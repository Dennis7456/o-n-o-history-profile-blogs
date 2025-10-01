#!/usr/bin/env python3
"""
Content Generator for Kennedy Ogetto Blog Posts and Timeline
Processes scraped data and generates structured content
"""

import json
from datetime import datetime
import re

class ContentGenerator:
    def __init__(self, existing_blog_path="blog.json", existing_timeline_path="kennedy-ogetto-cases-chronological.json"):
        self.existing_blog = self.load_json(existing_blog_path)
        self.existing_timeline = self.load_json(existing_timeline_path)
        
    def load_json(self, filepath):
        """Load existing JSON data"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def generate_blog_post(self, scraped_data):
        """Generate a new blog post from scraped data"""
        template = {
            "post_id": "",
            "title": "",
            "slug": "",
            "publication_date": "",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "author": "Research Team",
            "category": "",
            "tags": [],
            "excerpt": "",
            "content": {
                "introduction": "",
                "main_content": "",
                "conclusion": ""
            },
            "metadata": {
                "reading_time": "",
                "word_count": 0,
                "case_type": "",
                "outcome": "",
                "significance": "",
                "legal_implications": ""
            },
            "sources": [],
            "related_posts": [],
            "social_sharing": {
                "twitter_summary": "",
                "linkedin_summary": ""
            }
        }
        return template
    
    def generate_timeline_entry(self, scraped_data):
        """Generate a new timeline entry"""
        timeline_template = {
            "date": "",
            "event_type": "",
            "title": "",
            "description": "",
            "significance": "",
            "sources": [],
            "related_cases": [],
            "legal_context": ""
        }
        return timeline_template
    
    def extract_key_information(self, text):
        """Extract key information from scraped text"""
        # Extract dates
        date_patterns = [
            r'\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b',
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b',
            r'\b\d{4}-\d{2}-\d{2}\b'
        ]
        
        dates = []
        for pattern in date_patterns:
            dates.extend(re.findall(pattern, text, re.IGNORECASE))
        
        # Extract legal terms and case references
        legal_terms = [
            'Supreme Court', 'High Court', 'Court of Appeal', 'ICC', 'UNICTR', 
            'ICSID', 'Solicitor General', 'Attorney General', 'petition', 
            'judgment', 'ruling', 'case', 'legal', 'constitutional'
        ]
        
        found_terms = []
        for term in legal_terms:
            if term.lower() in text.lower():
                found_terms.append(term)
        
        return {
            'dates': dates,
            'legal_terms': found_terms,
            'word_count': len(text.split())
        }
    
    def categorize_content(self, content):
        """Categorize content based on keywords"""
        categories = {
            'Election Law': ['election', 'petition', 'supreme court', 'presidential'],
            'International Criminal Law': ['ICC', 'UNICTR', 'Sierra Leone', 'genocide', 'war crimes'],
            'Constitutional Law': ['constitution', 'BBI', 'constitutional', 'amendment'],
            'International Investment Law': ['ICSID', 'investment', 'arbitration', 'energy'],
            'Government Appointments': ['solicitor general', 'appointment', 'vetting', 'legal adviser']
        }
        
        content_lower = content.lower()
        for category, keywords in categories.items():
            if any(keyword in content_lower for keyword in keywords):
                return category
        
        return 'General Legal'

# Example usage
generator = ContentGenerator()