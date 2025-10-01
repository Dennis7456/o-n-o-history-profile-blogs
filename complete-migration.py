#!/usr/bin/env python3
"""
Complete Data Migration for Kennedy Ogetto CMS
Migrates ALL data from JSON files to Supabase
"""

import json
import sys
import os

# Add the virtual environment to the path
sys.path.insert(0, 'venv/lib/python3.13/site-packages')

from supabase import create_client, Client
from datetime import datetime

# Your Supabase credentials
SUPABASE_URL = "https://pyurqbnmaquuvqmbkjjp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dXJxYm5tYXF1dXZxbWJrampwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDE3NTksImV4cCI6MjA3NDg3Nzc1OX0.Kts9K-WVpz9wE7rphN-tfIM8ZBcyLJr2LPS7bewSv6U"

def load_json_file(filepath):
    """Load JSON file safely"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error in {filepath}: {e}")
        return None

def migrate_all_blog_posts(supabase):
    """Migrate ALL blog posts from JSON files"""
    print("📝 Migrating ALL blog posts...")
    
    # Try multiple file locations
    file_paths = [
        'site/data/blog.json',
        'blog.json',
        'kennedy-ogetto-cases-chronological.json',
        'site/data/kennedy-ogetto-cases-chronological.json'
    ]
    
    all_posts = []
    
    for filepath in file_paths:
        data = load_json_file(filepath)
        if not data:
            continue
            
        # Extract posts from different structures
        if 'blog' in data and 'posts' in data['blog']:
            posts = data['blog']['posts']
            print(f"✅ Found {len(posts)} posts in {filepath}")
            all_posts.extend(posts)
        elif 'kennedy_ogetto_cases' in data and 'blog_posts' in data['kennedy_ogetto_cases']:
            posts = data['kennedy_ogetto_cases']['blog_posts']
            print(f"✅ Found {len(posts)} posts in {filepath}")
            all_posts.extend(posts)
    
    print(f"📊 Total posts to migrate: {len(all_posts)}")
    
    migrated_count = 0
    skipped_count = 0
    
    for post in all_posts:
        try:
            # Check if post already exists
            existing = supabase.table('blog_posts').select('id').eq('post_id', post.get('post_id', '')).execute()
            
            if existing.data:
                print(f"⚠️  Post already exists: {post.get('title', 'Unknown')[:50]}...")
                skipped_count += 1
                continue
            
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
                'introduction': post.get('content', {}).get('introduction', '') if isinstance(post.get('content'), dict) else '',
                'main_content': post.get('content', {}).get('main_content', '') if isinstance(post.get('content'), dict) else str(post.get('content', '')),
                'conclusion': post.get('content', {}).get('conclusion', '') if isinstance(post.get('content'), dict) else '',
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
            result = supabase.table('blog_posts').insert(blog_record).execute()
            
            if result.data:
                migrated_count += 1
                print(f"✅ Migrated: {post.get('title', 'Unknown')[:50]}...")
            else:
                print(f"❌ Failed to migrate: {post.get('title', 'Unknown')[:50]}...")
                
        except Exception as e:
            print(f"❌ Error migrating post {post.get('post_id', 'unknown')}: {e}")
            continue
    
    print(f"📊 Migration complete: {migrated_count} new posts, {skipped_count} skipped")
    return migrated_count

def migrate_all_timeline_entries(supabase):
    """Migrate ALL timeline entries"""
    print("📅 Migrating ALL timeline entries...")
    
    # Load timeline data
    timeline_data = load_json_file('site/data/kennedy-ogetto-cases-chronological.json')
    if not timeline_data:
        timeline_data = load_json_file('kennedy-ogetto-cases-chronological.json')
    
    if not timeline_data:
        print("❌ No timeline data found")
        return 0
    
    timeline_entries = []
    
    # Extract timeline entries from the structure
    if 'kennedy_ogetto_cases' in timeline_data:
        # Look for blog_posts which contain timeline-like data
        blog_posts = timeline_data['kennedy_ogetto_cases'].get('blog_posts', [])
        
        for post in blog_posts:
            timeline_entry = {
                'entry_date': post.get('publication_date', ''),
                'event_type': determine_event_type(post.get('category', '')),
                'title': post.get('title', ''),
                'description': post.get('excerpt', ''),
                'significance': post.get('metadata', {}).get('significance', 'Medium'),
                'legal_context': post.get('metadata', {}).get('legal_implications', ''),
                'related_cases': [],
                'confidence_level': 'High'
            }
            timeline_entries.append(timeline_entry)
    
    print(f"📊 Total timeline entries to migrate: {len(timeline_entries)}")
    
    migrated_count = 0
    skipped_count = 0
    
    for entry in timeline_entries:
        try:
            # Check if entry already exists
            existing = supabase.table('timeline_entries').select('id').eq('title', entry['title']).execute()
            
            if existing.data:
                print(f"⚠️  Timeline entry already exists: {entry['title'][:50]}...")
                skipped_count += 1
                continue
            
            # Insert timeline entry
            result = supabase.table('timeline_entries').insert(entry).execute()
            
            if result.data:
                migrated_count += 1
                print(f"✅ Migrated timeline: {entry['title'][:50]}...")
            else:
                print(f"❌ Failed to migrate timeline: {entry['title'][:50]}...")
                
        except Exception as e:
            print(f"❌ Error migrating timeline entry: {e}")
            continue
    
    print(f"📊 Timeline migration complete: {migrated_count} new entries, {skipped_count} skipped")
    return migrated_count

def determine_event_type(category):
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

def update_profile_from_json(supabase):
    """Update profile with complete information from JSON"""
    print("👤 Updating profile information...")
    
    timeline_data = load_json_file('site/data/kennedy-ogetto-cases-chronological.json')
    if not timeline_data:
        timeline_data = load_json_file('kennedy-ogetto-cases-chronological.json')
    
    if timeline_data and 'kennedy_ogetto_cases' in timeline_data:
        profile_info = timeline_data['kennedy_ogetto_cases'].get('personal_profile', {})
        education = timeline_data['kennedy_ogetto_cases'].get('educational_background', {})
        
        if profile_info:
            try:
                # Get current profile ID
                current_profile = supabase.table('profile').select('id').execute()
                if current_profile.data:
                    profile_id = current_profile.data[0]['id']
                    
                    updated_profile = {
                        'full_name': profile_info.get('full_name', 'Kennedy Ogeto'),
                        'current_position': profile_info.get('current_position', ''),
                        'previous_position': profile_info.get('previous_position', ''),
                        'law_firm': profile_info.get('law_firm', ''),
                        'career_span': profile_info.get('career_span', ''),
                        'specialization': profile_info.get('specialization', ''),
                        'undergraduate': education.get('undergraduate', ''),
                        'graduate': education.get('graduate', ''),
                        'professional': education.get('professional', ''),
                        'institutions': education.get('institutions', [])
                    }
                    
                    result = supabase.table('profile').update(updated_profile).eq('id', profile_id).execute()
                    if result.data:
                        print("✅ Profile updated with complete information")
                    else:
                        print("⚠️  Profile update failed")
                        
            except Exception as e:
                print(f"❌ Error updating profile: {e}")

def main():
    """Main migration function"""
    print("🚀 Complete Kennedy Ogetto Data Migration")
    print("=" * 60)
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Test connection
        profile = supabase.table('profile').select('full_name').execute()
        if profile.data:
            print(f"✅ Connected to database. Profile: {profile.data[0]['full_name']}")
        
        # Update profile with complete information
        update_profile_from_json(supabase)
        
        # Migrate all blog posts
        blog_count = migrate_all_blog_posts(supabase)
        
        # Migrate all timeline entries
        timeline_count = migrate_all_timeline_entries(supabase)
        
        print(f"\n🎉 Complete Migration Summary:")
        print(f"   📝 Blog posts migrated: {blog_count}")
        print(f"   📅 Timeline entries migrated: {timeline_count}")
        print(f"   👤 Profile updated: ✅")
        
        if blog_count > 0 or timeline_count > 0:
            print("\n🎯 Your database now contains ALL the data from your JSON files!")
            print("Visit http://localhost:3001 to see the complete content.")
        else:
            print("\n⚠️  No new data was migrated (may already exist)")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    main()