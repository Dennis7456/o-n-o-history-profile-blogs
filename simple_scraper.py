#!/usr/bin/env python3
"""
Simple Kennedy Ogetto Web Scraper
Focuses on scraping real data from accessible sources
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime
import re
from blog_template_generator import BlogPostGenerator
from timeline_processor import TimelineProcessor

class SimpleOgettoScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        self.blog_generator = BlogPostGenerator()
        self.timeline_processor = TimelineProcessor()
        
    def search_google_news(self, query, num_results=10):
        """Search Google News for Kennedy Ogetto articles"""
        try:
            # Google News search URL
            search_url = f"https://news.google.com/search?q={query.replace(' ', '%20')}&hl=en-KE&gl=KE&ceid=KE:en"
            
            response = self.session.get(search_url)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                articles = []
                
                # Find article elements (this may need adjustment based on Google's current structure)
                article_elements = soup.find_all('article')[:num_results]
                
                for article in article_elements:
                    try:
                        title_elem = article.find('h3') or article.find('h4')
                        title = title_elem.get_text().strip() if title_elem else "No title"
                        
                        link_elem = article.find('a')
                        link = link_elem.get('href') if link_elem else ""
                        
                        # Clean up Google News redirect links
                        if link.startswith('./'):
                            link = "https://news.google.com" + link[1:]
                        
                        articles.append({
                            'title': title,
                            'url': link,
                            'source': 'Google News',
                            'date': datetime.now().strftime('%Y-%m-%d')
                        })
                    except Exception as e:
                        print(f"Error parsing article: {e}")
                        continue
                
                return articles
            else:
                print(f"Failed to fetch Google News: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error searching Google News: {e}")
            return []
    
    def scrape_kenya_law(self):
        """Scrape Kenya Law for legal documents mentioning Kennedy Ogetto"""
        try:
            # Kenya Law search URL
            search_url = "http://kenyalaw.org/caselaw/search"
            params = {
                'q': 'Kennedy Ogetto',
                'type': 'all'
            }
            
            response = self.session.get(search_url, params=params, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                cases = []
                
                # Look for case results
                case_elements = soup.find_all('div', class_='case-result') or soup.find_all('tr')
                
                for case in case_elements[:5]:  # Limit to 5 results
                    try:
                        title_elem = case.find('a') or case.find('td')
                        if title_elem:
                            title = title_elem.get_text().strip()
                            link = title_elem.get('href', '') if case.find('a') else ''
                            
                            if 'ogetto' in title.lower() or 'ogeto' in title.lower():
                                cases.append({
                                    'title': title,
                                    'url': f"http://kenyalaw.org{link}" if link.startswith('/') else link,
                                    'source': 'Kenya Law',
                                    'type': 'Legal Document',
                                    'date': datetime.now().strftime('%Y-%m-%d')
                                })
                    except Exception as e:
                        continue
                
                return cases
            else:
                print(f"Failed to fetch Kenya Law: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error scraping Kenya Law: {e}")
            return []
    
    def scrape_youtube_search(self):
        """Search YouTube for Kennedy Ogetto videos"""
        try:
            # YouTube search URL (this will return HTML, not API results)
            search_url = "https://www.youtube.com/results"
            params = {'search_query': 'Kennedy Ogetto lawyer Kenya'}
            
            response = self.session.get(search_url, params=params, timeout=10)
            if response.status_code == 200:
                # Extract video information from the page
                content = response.text
                videos = []
                
                # Look for video data in the page (simplified extraction)
                video_pattern = r'"title":{"runs":\[{"text":"([^"]+)"}.*?"videoId":"([^"]+)"'
                matches = re.findall(video_pattern, content)
                
                for title, video_id in matches[:5]:  # Limit to 5 results
                    if 'ogetto' in title.lower() or 'ogeto' in title.lower():
                        videos.append({
                            'title': title,
                            'url': f"https://www.youtube.com/watch?v={video_id}",
                            'source': 'YouTube',
                            'type': 'Video',
                            'date': datetime.now().strftime('%Y-%m-%d')
                        })
                
                return videos
            else:
                print(f"Failed to fetch YouTube: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"Error scraping YouTube: {e}")
            return []
    
    def extract_article_content(self, url):
        """Extract content from a news article URL"""
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Common content selectors for news sites
                content_selectors = [
                    'article', '.article-content', '.post-content', 
                    '.entry-content', '.content', 'main', '.story-body'
                ]
                
                content = ""
                for selector in content_selectors:
                    content_elem = soup.select_one(selector)
                    if content_elem:
                        # Extract text and clean it up
                        content = content_elem.get_text().strip()
                        # Remove extra whitespace
                        content = re.sub(r'\s+', ' ', content)
                        break
                
                return content[:2000] if content else "Content not available"
            else:
                return "Content not accessible"
                
        except Exception as e:
            print(f"Error extracting content from {url}: {e}")
            return "Content extraction failed"
    
    def run_comprehensive_search(self):
        """Run a comprehensive search across all sources"""
        print("Starting comprehensive Kennedy Ogetto search...")
        
        all_results = []
        
        # Search Google News
        print("Searching Google News...")
        news_results = self.search_google_news("Kennedy Ogetto Kenya lawyer")
        all_results.extend(news_results)
        time.sleep(2)  # Be respectful with requests
        
        # Search Kenya Law
        print("Searching Kenya Law...")
        legal_results = self.scrape_kenya_law()
        all_results.extend(legal_results)
        time.sleep(2)
        
        # Search YouTube
        print("Searching YouTube...")
        video_results = self.scrape_youtube_search()
        all_results.extend(video_results)
        
        print(f"Found {len(all_results)} total results")
        
        # Process results into blog posts and timeline entries
        blog_posts = []
        timeline_entries = []
        
        for result in all_results:
            if result.get('url') and not result['url'].startswith('https://news.google.com'):
                # Extract content for non-Google News links
                content = self.extract_article_content(result['url'])
                time.sleep(1)  # Rate limiting
            else:
                content = f"Article about Kennedy Ogetto from {result.get('source', 'Unknown source')}"
            
            # Generate blog post
            blog_post = self.blog_generator.generate_blog_post(
                title=result['title'],
                content=content,
                date=result.get('date', datetime.now().strftime('%Y-%m-%d')),
                sources=[{
                    'url': result['url'],
                    'title': result['title'],
                    'publication': result.get('source', 'Unknown'),
                    'date': result.get('date', datetime.now().strftime('%Y-%m-%d')),
                    'type': result.get('type', 'Article')
                }]
            )
            blog_posts.append(blog_post)
            
            # Generate timeline entry
            timeline_entry = self.timeline_processor.create_timeline_entry(
                title=result['title'],
                content=content,
                date=result.get('date', datetime.now().strftime('%Y-%m-%d')),
                sources=[{
                    'url': result['url'],
                    'title': result['title'],
                    'publication': result.get('source', 'Unknown'),
                    'date': result.get('date', datetime.now().strftime('%Y-%m-%d')),
                    'type': result.get('type', 'Article')
                }]
            )
            timeline_entries.append(timeline_entry)
        
        return blog_posts, timeline_entries, all_results
    
    def save_results(self, blog_posts, timeline_entries, raw_results):
        """Save results to files"""
        # Save raw results
        with open('data/scraped/raw_results.json', 'w', encoding='utf-8') as f:
            json.dump(raw_results, f, indent=2, ensure_ascii=False)
        
        # Save processed blog posts
        with open('data/processed/new_blog_posts.json', 'w', encoding='utf-8') as f:
            json.dump(blog_posts, f, indent=2, ensure_ascii=False)
        
        # Save processed timeline entries
        with open('data/processed/new_timeline_entries.json', 'w', encoding='utf-8') as f:
            json.dump(timeline_entries, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(blog_posts)} blog posts and {len(timeline_entries)} timeline entries")

if __name__ == "__main__":
    scraper = SimpleOgettoScraper()
    blog_posts, timeline_entries, raw_results = scraper.run_comprehensive_search()
    scraper.save_results(blog_posts, timeline_entries, raw_results)
    
    print("\nSample blog post:")
    if blog_posts:
        print(json.dumps(blog_posts[0], indent=2)[:500] + "...")
    
    print("\nSample timeline entry:")
    if timeline_entries:
        print(json.dumps(timeline_entries[0], indent=2)[:500] + "...")