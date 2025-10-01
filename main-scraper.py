#!/usr/bin/env python3
"""
Main Scraping Orchestrator
Coordinates all scraping activities and content generation
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime
import os
from blog_template_generator import BlogPostGenerator
from timeline_processor import TimelineProcessor

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class OgettoDataOrchestrator:
    def __init__(self):
        self.blog_generator = BlogPostGenerator()
        self.timeline_processor = TimelineProcessor()
        self.session = None
        self.scraped_data = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def scrape_news_sources(self):
        """Scrape news sources for Kennedy Ogetto mentions"""
        news_sources = [
            {
                'name': 'Daily Nation',
                'search_url': 'https://nation.co.ke/search?q=Kennedy+Ogetto',
                'selector': '.article-title'
            },
            {
                'name': 'Business Daily',
                'search_url': 'https://www.businessdailyafrica.com/search?q=Kennedy+Ogetto',
                'selector': '.headline'
            },
            {
                'name': 'The Star',
                'search_url': 'https://www.the-star.co.ke/search?q=Kennedy+Ogetto',
                'selector': '.article-headline'
            }
        ]
        
        for source in news_sources:
            try:
                await self.scrape_single_source(source)
            except Exception as e:
                logger.error(f"Error scraping {source['name']}: {e}")
    
    async def scrape_single_source(self, source):
        """Scrape a single news source"""
        try:
            async with self.session.get(source['search_url']) as response:
                if response.status == 200:
                    html = await response.text()
                    # Parse HTML and extract articles
                    # This would use BeautifulSoup in a real implementation
                    logger.info(f"Successfully scraped {source['name']}")
                else:
                    logger.warning(f"Failed to scrape {source['name']}: Status {response.status}")
        except Exception as e:
            logger.error(f"Error scraping {source['name']}: {e}")
    
    async def scrape_legal_databases(self):
        """Scrape legal databases for case information"""
        legal_sources = [
            'http://kenyalaw.org/caselaw/search?q=Kennedy+Ogetto',
            'https://www.icc-cpi.int/search?q=Kennedy+Ogetto',
        ]
        
        for url in legal_sources:
            try:
                await self.scrape_legal_source(url)
            except Exception as e:
                logger.error(f"Error scraping legal source {url}: {e}")
    
    async def scrape_legal_source(self, url):
        """Scrape a legal database"""
        # Implementation would depend on the specific database structure
        logger.info(f"Scraping legal source: {url}")
    
    def process_scraped_data(self):
        """Process all scraped data into blog posts and timeline entries"""
        blog_posts = []
        timeline_entries = []
        
        for data in self.scraped_data:
            # Generate blog post
            blog_post = self.blog_generator.generate_blog_post(
                title=data.get('title', ''),
                content=data.get('content', ''),
                date=data.get('date', datetime.now().strftime('%Y-%m-%d')),
                sources=data.get('sources', [])
            )
            blog_posts.append(blog_post)
            
            # Generate timeline entry
            timeline_entry = self.timeline_processor.create_timeline_entry(
                title=data.get('title', ''),
                content=data.get('content', ''),
                date=data.get('date', datetime.now().strftime('%Y-%m-%d')),
                sources=data.get('sources', [])
            )
            timeline_entries.append(timeline_entry)
        
        return blog_posts, timeline_entries
    
    def update_json_files(self, blog_posts, timeline_entries):
        """Update the existing JSON files with new data"""
        # Update blog.json
        try:
            with open('blog.json', 'r', encoding='utf-8') as f:
                blog_data = json.load(f)
            
            # Add new posts
            existing_posts = blog_data.get('blog', {}).get('posts', [])
            all_posts = existing_posts + blog_posts
            
            # Remove duplicates based on post_id
            unique_posts = []
            seen_ids = set()
            
            for post in all_posts:
                if post['post_id'] not in seen_ids:
                    unique_posts.append(post)
                    seen_ids.add(post['post_id'])
            
            # Update blog data
            blog_data['blog']['posts'] = unique_posts
            blog_data['blog']['metadata']['total_posts'] = len(unique_posts)
            blog_data['blog']['metadata']['last_updated'] = datetime.now().strftime('%Y-%m-%d')
            
            # Write back to file
            with open('blog.json', 'w', encoding='utf-8') as f:
                json.dump(blog_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Updated blog.json with {len(blog_posts)} new posts")
            
        except Exception as e:
            logger.error(f"Error updating blog.json: {e}")
        
        # Update timeline file
        try:
            updated_timeline = self.timeline_processor.merge_with_existing_timeline(
                timeline_entries, 
                'kennedy-ogetto-cases-chronological.json'
            )
            
            with open('kennedy-ogetto-cases-chronological.json', 'w', encoding='utf-8') as f:
                json.dump(updated_timeline, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Updated timeline with {len(timeline_entries)} new entries")
            
        except Exception as e:
            logger.error(f"Error updating timeline: {e}")
    
    async def run_full_scraping_cycle(self):
        """Run a complete scraping cycle"""
        logger.info("Starting Kennedy Ogetto data scraping cycle")
        
        # Scrape all sources
        await self.scrape_news_sources()
        await self.scrape_legal_databases()
        
        # Process data
        blog_posts, timeline_entries = self.process_scraped_data()
        
        # Update files
        self.update_json_files(blog_posts, timeline_entries)
        
        logger.info("Scraping cycle completed")
        
        return {
            'blog_posts_added': len(blog_posts),
            'timeline_entries_added': len(timeline_entries),
            'total_sources_scraped': len(self.scraped_data)
        }

# Usage example
async def main():
    async with OgettoDataOrchestrator() as orchestrator:
        results = await orchestrator.run_full_scraping_cycle()
        print(f"Scraping completed: {results}")

if __name__ == "__main__":
    asyncio.run(main())