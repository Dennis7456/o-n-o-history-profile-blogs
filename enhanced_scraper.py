#!/usr/bin/env python3
"""
Enhanced Kennedy Ogetto Scraper
Focuses on extracting detailed information from discovered sources
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime
import re
from blog_template_generator import BlogPostGenerator
from timeline_processor import TimelineProcessor

class EnhancedOgettoScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        self.blog_generator = BlogPostGenerator()
        self.timeline_processor = TimelineProcessor()
        
    def extract_youtube_metadata(self, video_url):
        """Extract metadata from YouTube video"""
        try:
            response = self.session.get(video_url, timeout=10)
            if response.status_code == 200:
                content = response.text
                
                # Extract title
                title_match = re.search(r'"title":"([^"]+)"', content)
                title = title_match.group(1) if title_match else "Unknown Title"
                
                # Extract description
                desc_match = re.search(r'"shortDescription":"([^"]+)"', content)
                description = desc_match.group(1) if desc_match else ""
                
                # Extract upload date
                date_match = re.search(r'"uploadDate":"([^"]+)"', content)
                upload_date = date_match.group(1) if date_match else datetime.now().strftime('%Y-%m-%d')
                
                # Extract view count
                views_match = re.search(r'"viewCount":"(\d+)"', content)
                views = views_match.group(1) if views_match else "0"
                
                return {
                    'title': title.replace('\\u0026', '&').replace('\\"', '"'),
                    'description': description.replace('\\n', ' ').replace('\\"', '"')[:500],
                    'upload_date': upload_date.split('T')[0] if 'T' in upload_date else upload_date,
                    'views': views,
                    'url': video_url
                }
            else:
                return None
        except Exception as e:
            print(f"Error extracting YouTube metadata: {e}")
            return None
    
    def search_specific_kenyan_sites(self):
        """Search specific Kenyan news sites for Kennedy Ogetto"""
        kenyan_sites = [
            {
                'name': 'Daily Nation',
                'base_url': 'https://nation.co.ke',
                'search_path': '/search',
                'params': {'q': 'Kennedy Ogetto'}
            },
            {
                'name': 'The Star',
                'base_url': 'https://www.the-star.co.ke',
                'search_path': '/search',
                'params': {'q': 'Kennedy Ogetto'}
            },
            {
                'name': 'Business Daily',
                'base_url': 'https://www.businessdailyafrica.com',
                'search_path': '/search',
                'params': {'q': 'Kennedy Ogetto'}
            }
        ]
        
        all_articles = []
        
        for site in kenyan_sites:
            try:
                search_url = f"{site['base_url']}{site['search_path']}"
                response = self.session.get(search_url, params=site['params'], timeout=10)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Common selectors for article links
                    article_selectors = [
                        'a[href*="ogetto"]', 'a[href*="ogeto"]',
                        '.article-title a', '.headline a', '.story-title a',
                        'h2 a', 'h3 a', '.entry-title a'
                    ]
                    
                    for selector in article_selectors:
                        links = soup.select(selector)
                        for link in links[:3]:  # Limit per selector
                            href = link.get('href', '')
                            title = link.get_text().strip()
                            
                            if href and ('ogetto' in title.lower() or 'ogeto' in title.lower()):
                                full_url = href if href.startswith('http') else f"{site['base_url']}{href}"
                                all_articles.append({
                                    'title': title,
                                    'url': full_url,
                                    'source': site['name'],
                                    'date': datetime.now().strftime('%Y-%m-%d')
                                })
                
                time.sleep(2)  # Be respectful
                
            except Exception as e:
                print(f"Error searching {site['name']}: {e}")
                continue
        
        return all_articles
    
    def extract_detailed_content(self, url, source_name):
        """Extract detailed content from article URLs"""
        try:
            response = self.session.get(url, timeout=15)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract title
                title_selectors = ['h1', '.article-title', '.entry-title', '.headline', 'title']
                title = "Unknown Title"
                for selector in title_selectors:
                    title_elem = soup.select_one(selector)
                    if title_elem:
                        title = title_elem.get_text().strip()
                        break
                
                # Extract content
                content_selectors = [
                    '.article-content', '.entry-content', '.post-content',
                    '.story-body', '.content', 'article', 'main'
                ]
                
                content = ""
                for selector in content_selectors:
                    content_elem = soup.select_one(selector)
                    if content_elem:
                        # Remove script and style elements
                        for script in content_elem(["script", "style"]):
                            script.decompose()
                        content = content_elem.get_text().strip()
                        break
                
                # Extract date
                date_selectors = ['.date', '.published', '.post-date', 'time']
                article_date = datetime.now().strftime('%Y-%m-%d')
                for selector in date_selectors:
                    date_elem = soup.select_one(selector)
                    if date_elem:
                        date_text = date_elem.get_text().strip()
                        # Try to parse the date
                        parsed_date = self.parse_article_date(date_text)
                        if parsed_date:
                            article_date = parsed_date
                        break
                
                # Clean up content
                content = re.sub(r'\s+', ' ', content)
                content = content[:3000]  # Limit content length
                
                return {
                    'title': title,
                    'content': content,
                    'date': article_date,
                    'url': url,
                    'source': source_name
                }
            else:
                return None
                
        except Exception as e:
            print(f"Error extracting content from {url}: {e}")
            return None
    
    def parse_article_date(self, date_text):
        """Parse article date from various formats"""
        # Common date patterns
        patterns = [
            r'(\d{4}-\d{2}-\d{2})',
            r'(\d{1,2})/(\d{1,2})/(\d{4})',
            r'(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})',
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, date_text, re.IGNORECASE)
            if match:
                if pattern == patterns[0]:  # YYYY-MM-DD
                    return match.group(1)
                elif pattern == patterns[1]:  # MM/DD/YYYY or DD/MM/YYYY
                    month, day, year = match.groups()
                    return f"{year}-{int(month):02d}-{int(day):02d}"
                # Add more date parsing logic as needed
        
        return None
    
    def create_comprehensive_content(self):
        """Create comprehensive content from all sources"""
        print("Starting comprehensive Kennedy Ogetto content creation...")
        
        # Load existing raw results
        try:
            with open('data/scraped/raw_results.json', 'r') as f:
                raw_results = json.load(f)
        except FileNotFoundError:
            raw_results = []
        
        enhanced_content = []
        
        # Process YouTube videos
        youtube_videos = [r for r in raw_results if r.get('source') == 'YouTube']
        print(f"Processing {len(youtube_videos)} YouTube videos...")
        
        for video in youtube_videos:
            metadata = self.extract_youtube_metadata(video['url'])
            if metadata:
                enhanced_content.append({
                    'type': 'video',
                    'title': metadata['title'],
                    'content': f"YouTube video: {metadata['description']}. Views: {metadata['views']}",
                    'date': metadata['upload_date'],
                    'url': video['url'],
                    'source': 'YouTube',
                    'metadata': metadata
                })
                time.sleep(1)  # Rate limiting
        
        # Search Kenyan news sites
        print("Searching Kenyan news sites...")
        news_articles = self.search_specific_kenyan_sites()
        
        # Extract detailed content from news articles
        for article in news_articles:
            detailed_content = self.extract_detailed_content(article['url'], article['source'])
            if detailed_content and detailed_content['content']:
                enhanced_content.append({
                    'type': 'article',
                    'title': detailed_content['title'],
                    'content': detailed_content['content'],
                    'date': detailed_content['date'],
                    'url': detailed_content['url'],
                    'source': detailed_content['source']
                })
                time.sleep(2)  # Rate limiting
        
        return enhanced_content
    
    def generate_quality_blog_posts(self, enhanced_content):
        """Generate high-quality blog posts from enhanced content"""
        blog_posts = []
        
        for item in enhanced_content:
            if len(item['content']) > 100:  # Only process substantial content
                # Determine category based on content
                category = self.determine_category(item['title'], item['content'])
                
                blog_post = self.blog_generator.generate_blog_post(
                    title=item['title'],
                    content=item['content'],
                    date=item['date'],
                    sources=[{
                        'url': item['url'],
                        'title': item['title'],
                        'publication': item['source'],
                        'date': item['date'],
                        'type': 'Video' if item['type'] == 'video' else 'News Article'
                    }],
                    category=category
                )
                
                # Enhance the blog post with better metadata
                blog_post['metadata']['significance'] = self.determine_significance(item['content'])
                blog_post['metadata']['legal_implications'] = self.extract_legal_implications(item['content'])
                
                blog_posts.append(blog_post)
        
        return blog_posts
    
    def determine_category(self, title, content):
        """Determine the most appropriate category"""
        text = (title + ' ' + content).lower()
        
        if any(term in text for term in ['solicitor general', 'appointment', 'sworn', 'swearing']):
            return 'Government Appointments'
        elif any(term in text for term in ['nms', 'legality', 'constitutional']):
            return 'Constitutional Law'
        elif any(term in text for term in ['election', 'petition', 'supreme court']):
            return 'Election Law'
        elif any(term in text for term in ['icc', 'international court', 'tribunal']):
            return 'International Criminal Law'
        else:
            return 'General Legal'
    
    def determine_significance(self, content):
        """Determine significance based on content analysis"""
        content_lower = content.lower()
        
        high_significance_terms = [
            'solicitor general', 'supreme court', 'president', 'constitutional',
            'landmark', 'historic', 'unprecedented'
        ]
        
        medium_significance_terms = [
            'high court', 'court of appeal', 'government', 'legal', 'case'
        ]
        
        if any(term in content_lower for term in high_significance_terms):
            return 'High - Significant legal or government matter'
        elif any(term in content_lower for term in medium_significance_terms):
            return 'Medium - Important legal proceeding'
        else:
            return 'Standard - Regular legal activity'
    
    def extract_legal_implications(self, content):
        """Extract legal implications from content"""
        content_lower = content.lower()
        
        if 'constitutional' in content_lower:
            return 'Constitutional law implications for Kenya\'s legal framework'
        elif 'solicitor general' in content_lower:
            return 'Government legal representation and policy implications'
        elif 'election' in content_lower:
            return 'Electoral law and democratic process implications'
        elif 'international' in content_lower:
            return 'International law and Kenya\'s global legal standing'
        else:
            return 'General legal practice and professional development'

if __name__ == "__main__":
    scraper = EnhancedOgettoScraper()
    
    # Create comprehensive content
    enhanced_content = scraper.create_comprehensive_content()
    
    # Generate quality blog posts
    blog_posts = scraper.generate_quality_blog_posts(enhanced_content)
    
    # Save enhanced results
    with open('data/processed/enhanced_content.json', 'w', encoding='utf-8') as f:
        json.dump(enhanced_content, f, indent=2, ensure_ascii=False)
    
    with open('data/processed/quality_blog_posts.json', 'w', encoding='utf-8') as f:
        json.dump(blog_posts, f, indent=2, ensure_ascii=False)
    
    print(f"\nGenerated {len(blog_posts)} quality blog posts from {len(enhanced_content)} sources")
    
    if blog_posts:
        print("\nSample enhanced blog post:")
        print(json.dumps(blog_posts[0], indent=2)[:800] + "...")