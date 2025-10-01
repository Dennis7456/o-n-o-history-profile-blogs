#!/usr/bin/env python3
"""
Integration Script for New Kennedy Ogetto Content
Merges scraped content with existing JSON structure
"""

import json
from datetime import datetime
import os

class ContentIntegrator:
    def __init__(self):
        self.existing_blog_path = "blog.json"
        self.existing_timeline_path = "kennedy-ogetto-cases-chronological.json"
        self.site_blog_path = "site/data/blog.json"
        self.site_timeline_path = "site/data/kennedy-ogetto-cases-chronological.json"
        
    def load_json(self, filepath):
        """Load JSON file safely"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"File not found: {filepath}")
            return {}
        except json.JSONDecodeError as e:
            print(f"JSON decode error in {filepath}: {e}")
            return {}
    
    def save_json(self, data, filepath):
        """Save JSON file safely"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Successfully saved: {filepath}")
        except Exception as e:
            print(f"Error saving {filepath}: {e}")
    
    def enhance_scraped_content(self, scraped_posts):
        """Enhance scraped content with better information"""
        enhanced_posts = []
        
        for post in scraped_posts:
            # Create enhanced version based on the title and content
            if "NMS" in post['title']:
                # This matches the existing NMS clarification post
                enhanced_post = {
                    "post_id": "ogetto-nms-legality-clarification-2021",
                    "title": "11 June 2021 – Solicitor General Kennedy Ogeto Clarifies NMS Legality",
                    "slug": "kennedy-ogetto-nms-legality-clarification",
                    "publication_date": "2021-06-11",
                    "last_updated": datetime.now().strftime("%Y-%m-%d"),
                    "author": "Research Team",
                    "category": "Constitutional Law",
                    "tags": [
                        "NMS",
                        "National Management System",
                        "Constitutional Law",
                        "Government Institutions",
                        "Kenya",
                        "Legal Clarification"
                    ],
                    "excerpt": "Solicitor General Kennedy Ogeto addressed public concerns about the National Management System (NMS) legality, clarifying that the court had declared it constitutional.",
                    "content": {
                        "introduction": "On 11 June 2021, Solicitor General Kennedy Ogeto issued a public statement clarifying the legal status of the National Management System (NMS) after reports suggested a court had declared it unconstitutional.",
                        "main_content": "Ogeto termed the allegations untrue and cited the Employment and Labour Relations Court's final judgment of September 2020 by Justice Hellen Wasilwa, which held that NMS was legally created and constitutional. The clarification corrected misinformation that could undermine confidence in the institution and clarified the binding legal position.",
                        "conclusion": "The clarification underscored Ogeto's role in public legal communication and maintaining confidence in lawfully established government institutions."
                    },
                    "metadata": {
                        "reading_time": "3 minutes",
                        "word_count": 180,
                        "case_type": "Public Legal Clarification",
                        "outcome": "Clarified NMS constitutional status",
                        "significance": "Medium",
                        "legal_implications": "Affirmed validity of NMS and addressed public misinformation"
                    },
                    "sources": [
                        {
                            "url": "https://www.youtube.com/watch?v=ED5jntqRoh0",
                            "title": "Solicitor General Kennedy Ogeto Clarifies NMS Legality",
                            "publication": "YouTube",
                            "date": "2021-06-11",
                            "type": "Video Recording"
                        }
                    ],
                    "related_posts": [
                        "ogetto-solicitor-general-appointment-2018"
                    ]
                }
                enhanced_posts.append(enhanced_post)
                
            elif "Panel of Experts" in post['title'] and "Compensation" in post['title']:
                # New appointment to compensation panel
                enhanced_post = {
                    "post_id": "ogetto-compensation-panel-appointment-2025",
                    "title": "4 September 2025 – Kennedy Ogeto Appointed to Panel of Experts on Compensation of Victims of Protest",
                    "slug": "kennedy-ogetto-compensation-panel-appointment",
                    "publication_date": "2025-09-04",
                    "last_updated": datetime.now().strftime("%Y-%m-%d"),
                    "author": "Research Team",
                    "category": "Government Appointments",
                    "tags": [
                        "Government Appointment",
                        "Compensation Panel",
                        "Victims Rights",
                        "Kenya",
                        "Legal Expertise",
                        "Human Rights"
                    ],
                    "excerpt": "Kennedy Ogeto was sworn in as a member of the Panel of Experts on the Compensation of Victims of Protest, bringing his extensive legal expertise to address victims' rights and compensation matters.",
                    "content": {
                        "introduction": "On 4 September 2025, Kennedy Ogeto was sworn in as a member of the Panel of Experts on the Compensation of Victims of Protest, marking another significant appointment in his distinguished legal career.",
                        "main_content": "This appointment recognizes Ogeto's extensive experience in legal matters and his expertise in handling complex cases involving human rights and constitutional issues. The Panel of Experts is tasked with evaluating and recommending compensation for victims of protest-related incidents, requiring deep understanding of both legal principles and human rights frameworks.\n\nOgeto's background as former Solicitor General and current legal adviser to President Ruto, combined with his international legal experience at UNICTR and other international tribunals, makes him well-suited for this role. The panel's work involves assessing claims, determining appropriate compensation levels, and ensuring that victims' rights are protected within Kenya's legal framework.",
                        "conclusion": "This appointment further demonstrates Ogeto's continued commitment to public service and his role in Kenya's legal and human rights landscape. His expertise will be valuable in ensuring fair and just compensation for protest victims."
                    },
                    "metadata": {
                        "reading_time": "4 minutes",
                        "word_count": 320,
                        "case_type": "Government Appointment - Human Rights Panel",
                        "outcome": "Appointed to compensation panel",
                        "significance": "High - Important human rights and victims' compensation role",
                        "legal_implications": "Advancement of victims' rights and compensation frameworks in Kenya"
                    },
                    "sources": [
                        {
                            "url": "https://www.youtube.com/watch?v=LocZPStDmb0",
                            "title": "Kennedy Ogeto Sworn in as a member of Panel of Experts on the Compensation of Victims of Protest",
                            "publication": "YouTube - Kenya Digital News",
                            "date": "2025-09-04",
                            "type": "Video Recording"
                        }
                    ],
                    "related_posts": [
                        "ogetto-solicitor-general-appointment-2018",
                        "ogetto-ruto-legal-adviser-appointment-2023"
                    ]
                }
                enhanced_posts.append(enhanced_post)
        
        return enhanced_posts
    
    def create_timeline_entries(self, enhanced_posts):
        """Create timeline entries from enhanced posts"""
        timeline_entries = []
        
        for post in enhanced_posts:
            timeline_entry = {
                "date": post['publication_date'],
                "event_type": "Government Appointment" if "appointment" in post['slug'] else "Legal Clarification",
                "title": post['title'],
                "description": post['excerpt'],
                "significance": post['metadata']['significance'],
                "sources": post['sources'],
                "related_cases": [],
                "legal_context": post['metadata']['legal_implications'],
                "metadata": {
                    "post_id": post['post_id'],
                    "category": post['category'],
                    "word_count": post['metadata']['word_count']
                }
            }
            timeline_entries.append(timeline_entry)
        
        return timeline_entries
    
    def integrate_with_existing_blog(self, new_posts):
        """Integrate new posts with existing blog structure"""
        # Load existing blog data
        existing_blog = self.load_json(self.existing_blog_path)
        
        if not existing_blog or 'blog' not in existing_blog:
            print("No existing blog structure found")
            return
        
        existing_posts = existing_blog['blog'].get('posts', [])
        
        # Check for duplicates and add new posts
        existing_post_ids = {post['post_id'] for post in existing_posts}
        new_unique_posts = [post for post in new_posts if post['post_id'] not in existing_post_ids]
        
        if new_unique_posts:
            # Add new posts
            all_posts = existing_posts + new_unique_posts
            
            # Sort by publication date (newest first)
            all_posts.sort(key=lambda x: x['publication_date'], reverse=True)
            
            # Update blog structure
            existing_blog['blog']['posts'] = all_posts
            existing_blog['blog']['metadata']['total_posts'] = len(all_posts)
            existing_blog['blog']['metadata']['last_updated'] = datetime.now().strftime("%Y-%m-%d")
            
            # Save updated blog
            self.save_json(existing_blog, self.existing_blog_path)
            self.save_json(existing_blog, self.site_blog_path)
            
            print(f"Added {len(new_unique_posts)} new blog posts")
        else:
            print("No new unique posts to add")
    
    def integrate_with_existing_timeline(self, new_timeline_entries):
        """Integrate new timeline entries with existing structure"""
        # Load existing timeline data
        existing_timeline = self.load_json(self.existing_timeline_path)
        
        if not existing_timeline or 'kennedy_ogetto_cases' not in existing_timeline:
            print("No existing timeline structure found")
            return
        
        # Get existing timeline entries
        if 'timeline' not in existing_timeline['kennedy_ogetto_cases']:
            existing_timeline['kennedy_ogetto_cases']['timeline'] = []
        
        existing_entries = existing_timeline['kennedy_ogetto_cases']['timeline']
        
        # Check for duplicates and add new entries
        existing_titles = {entry['title'] for entry in existing_entries}
        new_unique_entries = [entry for entry in new_timeline_entries if entry['title'] not in existing_titles]
        
        if new_unique_entries:
            # Add new entries
            all_entries = existing_entries + new_unique_entries
            
            # Sort by date
            all_entries.sort(key=lambda x: x['date'])
            
            # Update timeline structure
            existing_timeline['kennedy_ogetto_cases']['timeline'] = all_entries
            existing_timeline['kennedy_ogetto_cases']['metadata']['total_timeline_entries'] = len(all_entries)
            existing_timeline['kennedy_ogetto_cases']['metadata']['last_updated'] = datetime.now().strftime("%Y-%m-%d")
            
            # Save updated timeline
            self.save_json(existing_timeline, self.existing_timeline_path)
            self.save_json(existing_timeline, self.site_timeline_path)
            
            print(f"Added {len(new_unique_entries)} new timeline entries")
        else:
            print("No new unique timeline entries to add")
    
    def run_integration(self):
        """Run the complete integration process"""
        print("Starting content integration...")
        
        # Load scraped content
        try:
            with open('data/processed/quality_blog_posts.json', 'r', encoding='utf-8') as f:
                scraped_posts = json.load(f)
        except FileNotFoundError:
            print("No scraped content found. Run the scraper first.")
            return
        
        # Enhance scraped content
        enhanced_posts = self.enhance_scraped_content(scraped_posts)
        
        if not enhanced_posts:
            print("No content to integrate")
            return
        
        # Create timeline entries
        timeline_entries = self.create_timeline_entries(enhanced_posts)
        
        # Integrate with existing structures
        self.integrate_with_existing_blog(enhanced_posts)
        self.integrate_with_existing_timeline(timeline_entries)
        
        print("Integration completed successfully!")
        
        # Save enhanced posts for reference
        self.save_json(enhanced_posts, 'data/processed/final_enhanced_posts.json')
        self.save_json(timeline_entries, 'data/processed/final_timeline_entries.json')

if __name__ == "__main__":
    integrator = ContentIntegrator()
    integrator.run_integration()