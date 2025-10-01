#!/usr/bin/env python3
"""
Debug dashboard data loading issues
"""

try:
    from supabase import create_client, Client
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "supabase==2.20.0"])
    from supabase import create_client, Client

import os

def debug_dashboard_data():
    """Debug what data is available for the dashboard"""
    
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://pyurqbnmaquuvqmbkjjp.supabase.co')
    SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dXJxYm5tYXF1dXZxbWJrampwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDE3NTksImV4cCI6MjA3NDg3Nzc1OX0.Kts9K-WVpz9wE7rphN-tfIM8ZBcyLJr2LPS7bewSv6U')
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("🔍 Debugging Dashboard Data")
        print("=" * 40)
        
        # Check blog posts
        print("\n📝 Blog Posts:")
        try:
            posts_result = supabase.table('blog_posts').select('*').execute()
            posts = posts_result.data or []
            print(f"   Total posts: {len(posts)}")
            
            if posts:
                # Check for is_archived column
                first_post = posts[0]
                has_archived = 'is_archived' in first_post
                print(f"   Has is_archived column: {has_archived}")
                
                if has_archived:
                    archived_count = len([p for p in posts if p.get('is_archived', False)])
                    active_count = len(posts) - archived_count
                    print(f"   Active posts: {active_count}")
                    print(f"   Archived posts: {archived_count}")
                else:
                    print(f"   All posts (no archive column): {len(posts)}")
                
                # Show sample post
                print(f"   Sample post: {posts[0].get('title', 'No title')[:50]}...")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Check timeline entries
        print("\n📅 Timeline Entries:")
        try:
            timeline_result = supabase.table('timeline_entries').select('*').execute()
            timeline = timeline_result.data or []
            print(f"   Total timeline entries: {len(timeline)}")
            
            if timeline:
                print(f"   Sample entry: {timeline[0].get('title', 'No title')[:50]}...")
                
                # Check timeline_sources table
                try:
                    sources_result = supabase.table('timeline_sources').select('*').execute()
                    sources = sources_result.data or []
                    print(f"   Total sources: {len(sources)}")
                    
                    if sources:
                        # Count sources per timeline entry
                        source_counts = {}
                        for source in sources:
                            entry_id = source.get('timeline_entry_id')
                            if entry_id:
                                source_counts[entry_id] = source_counts.get(entry_id, 0) + 1
                        
                        total_sources = sum(source_counts.values())
                        print(f"   Sources distributed across {len(source_counts)} entries")
                        print(f"   Total source references: {total_sources}")
                except Exception as e:
                    print(f"   ⚠️  Timeline sources table error: {e}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Check profile
        print("\n👤 Profile:")
        try:
            profile_result = supabase.table('profile').select('*').execute()
            profile = profile_result.data
            if profile:
                print(f"   Profile found: {profile[0].get('full_name', 'No name')}")
            else:
                print("   No profile found")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Test the timeline query with sources
        print("\n🔗 Testing Timeline with Sources Query:")
        try:
            timeline_with_sources = supabase.table('timeline_entries').select('''
                *,
                timeline_sources (
                    url,
                    title,
                    publication,
                    source_date,
                    source_type
                )
            ''').limit(5).execute()
            
            if timeline_with_sources.data:
                print(f"   ✅ Query successful: {len(timeline_with_sources.data)} entries")
                for entry in timeline_with_sources.data[:2]:
                    sources_count = len(entry.get('timeline_sources', []))
                    print(f"   - {entry.get('title', 'No title')[:30]}... ({sources_count} sources)")
            else:
                print("   ⚠️  Query returned no data")
        except Exception as e:
            print(f"   ❌ Timeline with sources query failed: {e}")
            
            # Try simple timeline query
            try:
                simple_timeline = supabase.table('timeline_entries').select('*').limit(5).execute()
                if simple_timeline.data:
                    print(f"   ✅ Simple query works: {len(simple_timeline.data)} entries")
                else:
                    print("   ❌ Even simple query returns no data")
            except Exception as e2:
                print(f"   ❌ Simple timeline query also failed: {e2}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

if __name__ == "__main__":
    debug_dashboard_data()