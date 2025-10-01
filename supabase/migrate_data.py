#!/usr/bin/env python3
"""
Data Migration Script for Kennedy Ogetto Content
Migrates existing JSON data to Supabase database
"""

import json
import os
from datetime import datetime
from supabase import create_client, Client
import bcrypt

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://pyurqbnmaquuvqmbkjjp.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dXJxYm5tYXF1dXZxbWJrampwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDE3NTksImV4cCI6MjA3NDg3Nzc1OX0.Kts9K-WVpz9wE7rphN-tfIM8ZBcyLJr2LPS7bewSv6U')

class DataMigrator:
    def __init__(self):
        print(SUPABASE_URL, SUPABASE_KEY)
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
    def load_json_file(self, filepath):
        """Load JSON file safely"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"File not found: {filepath}")
            return None
        except json.JSONDecodeError as e:
            print(f"JSON decode error in {filepath}: {e}")
            return None
    
    def migrate_profile(self, profile_data):
        """Migrate profile information"""
        try:
            # Extract profile data from the JSON structure
            if 'kennedy_ogetto_cases' in profile_data:
                profile_info = profile_data['kennedy_ogetto_cases'].get('personal_profile', {})
                education = profile_data['kennedy_ogetto_cases'].get('educational_background', {})
                featured_image = profile_data['kennedy_ogetto_cases'].get('featured_image', {})
            else:
                return False
            
            profile_record = {
                'full_name': profile_info.get('full_name', 'Kennedy Ogeto'),
                'current_position': profile_info.get('current_position', ''),
                'previous_position': profile_info.get('previous_position', ''),
                'law_firm': profile_info.get('law_firm', ''),
                'career_span': profile_info.get('career_span', ''),
                'specialization': profile_info.get('specialization', ''),
                'undergraduate': education.get('undergraduate', ''),
                'graduate': education.get('graduate', ''),
                'professional': education.get('professional', ''),
                'institutions': education.get('institutions', []),
                'featured_image_url': featured_image.get('url', ''),
                'featured_image_alt': featured_image.get('alt_text', ''),
                'featured_image_caption': featured_image.get('caption', '')
            }
            
            # Update existing profile or insert new one
            result = self.supabase.table('profile').upsert(profile_record).execute()
            print(f"Profile migrated successfully: {profile_record['full_name']}")
            return True
            
        except Exception as e:
            print(f"Error migrating profile: {e}")
            return False
    
    def migrate_blog_posts(self, blog_data):
        """Migrate blog posts and their sources"""
        try:
            if 'blog' not in blog_data or 'posts' not in blog_data['blog']:
                print("No blog posts found in data")
                return False
            
            posts = blog_data['blog']['posts']
            migrated_count = 0
            
            for post in posts:
                try:
                    # Prepare blog post record
                    blog_record = {
                        'post_id': post.get('post_id', ''),
                        'title': post.get('title', ''),
                        'slug': post.get('slug', ''),
                        'publication_date': post.get('publication_date', ''),
                        'author': post.get('author', 'Research Team'),
                        'category': post.get('category', 'General Legal'),
                        'tags': post.get('tags', []),
                        'excerpt': post.get('excerpt', ''),
                        'introduction': post.get('content', {}).get('introduction', ''),
                        'main_content': post.get('content', {}).get('main_content', ''),
                        'conclusion': post.get('content', {}).get('conclusion', ''),
                        'reading_time': post.get('metadata', {}).get('reading_time', ''),
                        'word_count': post.get('metadata', {}).get('word_count', 0),
                        'case_type': post.get('metadata', {}).get('case_type', ''),
                        'outcome': post.get('metadata', {}).get('outcome', ''),
                        'significance': post.get('metadata', {}).get('significance', 'Medium'),
                        'legal_implications': post.get('metadata', {}).get('legal_implications', ''),
                        'twitter_summary': post.get('social_sharing', {}).get('twitter_summary', ''),
                        'linkedin_summary': post.get('social_sharing', {}).get('linkedin_summary', '')
                    }
                    
                    # Insert blog post
                    blog_result = self.supabase.table('blog_posts').insert(blog_record).execute()
                    blog_post_id = blog_result.data[0]['id']
                    
                    # Insert sources
                    sources = post.get('sources', [])
                    for source in sources:
                        source_record = {
                            'blog_post_id': blog_post_id,
                            'url': source.get('url', ''),
                            'title': source.get('title', ''),
                            'publication': source.get('publication', ''),
                            'source_date': source.get('date', ''),
                            'source_type': source.get('type', ''),
                            'case_number': source.get('case_number', '')
                        }
                        self.supabase.table('blog_sources').insert(source_record).execute()
                    
                    # Insert related posts
                    related_posts = post.get('related_posts', [])
                    for related_post_id in related_posts:
                        related_record = {
                            'blog_post_id': blog_post_id,
                            'related_post_id': related_post_id
                        }
                        self.supabase.table('related_posts').insert(related_record).execute()
                    
                    migrated_count += 1
                    print(f"Migrated blog post: {post.get('title', 'Unknown')}")
                    
                except Exception as e:
                    print(f"Error migrating blog post {post.get('post_id', 'unknown')}: {e}")
                    continue
            
            print(f"Successfully migrated {migrated_count} blog posts")
            return True
            
        except Exception as e:
            print(f"Error migrating blog posts: {e}")
            return False
    
    def migrate_timeline(self, timeline_data):
        """Migrate timeline entries and their sources"""
        try:
            # Handle both possible structures
            if 'kennedy_ogetto_cases' in timeline_data:
                timeline_entries = timeline_data['kennedy_ogetto_cases'].get('timeline', [])
                # If no timeline in kennedy_ogetto_cases, check for blog_posts
                if not timeline_entries:
                    timeline_entries = timeline_data['kennedy_ogetto_cases'].get('blog_posts', [])
            elif 'timeline' in timeline_data:
                timeline_entries = timeline_data['timeline']
            else:
                print("No timeline entries found in data")
                return False
            
            migrated_count = 0
            
            for entry in timeline_entries:
                try:
                    # Handle both timeline entry format and blog post format
                    if 'event_type' in entry:
                        # Timeline entry format
                        timeline_record = {
                            'entry_date': entry.get('date', ''),
                            'event_type': entry.get('event_type', 'Legal Event'),
                            'title': entry.get('title', ''),
                            'description': entry.get('description', ''),
                            'significance': entry.get('significance', ''),
                            'legal_context': entry.get('legal_context', ''),
                            'related_cases': entry.get('related_cases', []),
                            'confidence_level': entry.get('metadata', {}).get('confidence_level', 'High')
                        }
                    else:
                        # Blog post format - convert to timeline entry
                        timeline_record = {
                            'entry_date': entry.get('publication_date', ''),
                            'event_type': self.determine_event_type(entry.get('category', '')),
                            'title': entry.get('title', ''),
                            'description': entry.get('excerpt', ''),
                            'significance': entry.get('metadata', {}).get('significance', 'Medium'),
                            'legal_context': entry.get('metadata', {}).get('legal_implications', ''),
                            'related_cases': [],
                            'confidence_level': 'High'
                        }
                    
                    # Insert timeline entry
                    timeline_result = self.supabase.table('timeline_entries').insert(timeline_record).execute()
                    timeline_entry_id = timeline_result.data[0]['id']
                    
                    # Insert sources
                    sources = entry.get('sources', [])
                    for source in sources:
                        source_record = {
                            'timeline_entry_id': timeline_entry_id,
                            'url': source.get('url', ''),
                            'title': source.get('title', ''),
                            'publication': source.get('publication', ''),
                            'source_date': source.get('date', ''),
                            'source_type': source.get('type', '')
                        }
                        self.supabase.table('timeline_sources').insert(source_record).execute()
                    
                    migrated_count += 1
                    print(f"Migrated timeline entry: {entry.get('title', 'Unknown')}")
                    
                except Exception as e:
                    print(f"Error migrating timeline entry: {e}")
                    continue
            
            print(f"Successfully migrated {migrated_count} timeline entries")
            return True
            
        except Exception as e:
            print(f"Error migrating timeline: {e}")
            return False
    
    def determine_event_type(self, category):
        """Determine event type from category"""
        category_mapping = {
            'Government Appointments': 'Government Appointment',
            'Election Law': 'Legal Case',
            'Constitutional Law': 'Legal Case',
            'International Criminal Law': 'Legal Case',
            'International Investment Law': 'Legal Case',
            'International Criminal Court': 'Court Appearance'
        }
        return category_mapping.get(category, 'Legal Event')
    
    def create_admin_user(self):
        """Create admin user with hashed password"""
        try:
            # Hash the password
            password = "admin@12345"
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            user_record = {
                'username': 'admin',
                'email': 'admin@ogetto.com',
                'password_hash': password_hash,
                'role': 'admin'
            }
            
            # Check if user already exists
            existing_user = self.supabase.table('users').select('*').eq('username', 'admin').execute()
            
            if not existing_user.data:
                result = self.supabase.table('users').insert(user_record).execute()
                print("Admin user created successfully")
            else:
                print("Admin user already exists")
                
            return True
            
        except Exception as e:
            print(f"Error creating admin user: {e}")
            return False
    
    def run_migration(self):
        """Run complete data migration"""
        print("Starting Kennedy Ogetto data migration to Supabase...")
        
        # Create admin user
        self.create_admin_user()
        
        # Load JSON files
        blog_data = self.load_json_file('site/data/blog.json')
        timeline_data = self.load_json_file('site/data/kennedy-ogetto-cases-chronological.json')
        
        if not blog_data and not timeline_data:
            print("No data files found to migrate")
            return False
        
        success = True
        
        # Migrate profile (from timeline data which has more complete profile info)
        if timeline_data:
            if not self.migrate_profile(timeline_data):
                success = False
        
        # Migrate blog posts
        if blog_data:
            if not self.migrate_blog_posts(blog_data):
                success = False
        
        # Migrate timeline
        if timeline_data:
            if not self.migrate_timeline(timeline_data):
                success = False
        
        if success:
            print("✅ Data migration completed successfully!")
        else:
            print("❌ Data migration completed with some errors")
        
        return success

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    migrator = DataMigrator()
    migrator.run_migration()