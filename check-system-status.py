#!/usr/bin/env python3
"""
Check Kennedy Ogeto CMS system status
"""

try:
    from supabase import create_client, Client
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "supabase==2.20.0"])
    from supabase import create_client, Client

import os
import requests

def check_database():
    """Check database connection and data"""
    try:
        SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://pyurqbnmaquuvqmbkjjp.supabase.co')
        SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dXJxYm5tYXF1dXZxbWJrampwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDE3NTksImV4cCI6MjA3NDg3Nzc1OX0.Kts9K-WVpz9wE7rphN-tfIM8ZBcyLJr2LPS7bewSv6U')
        
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("🔍 Checking database connection...")
        
        # Check profile
        try:
            profile_result = supabase.table('profile').select('*').execute()
            profile_count = len(profile_result.data) if profile_result.data else 0
            print(f"✅ Profile: {profile_count} record(s)")
        except Exception as e:
            print(f"❌ Profile error: {e}")
        
        # Check blog posts
        try:
            posts_result = supabase.table('blog_posts').select('*').execute()
            posts_count = len(posts_result.data) if posts_result.data else 0
            print(f"✅ Blog posts: {posts_count} record(s)")
            
            # Check for is_archived column
            if posts_result.data and len(posts_result.data) > 0:
                first_post = posts_result.data[0]
                if 'is_archived' in first_post:
                    archived_count = len([p for p in posts_result.data if p.get('is_archived', False)])
                    print(f"✅ Archive feature: Available ({archived_count} archived)")
                else:
                    print(f"⚠️  Archive feature: Not available (column missing)")
        except Exception as e:
            print(f"❌ Blog posts error: {e}")
        
        # Check timeline
        try:
            timeline_result = supabase.table('timeline_entries').select('*').execute()
            timeline_count = len(timeline_result.data) if timeline_result.data else 0
            print(f"✅ Timeline entries: {timeline_count} record(s)")
        except Exception as e:
            print(f"❌ Timeline error: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_frontend():
    """Check if frontend is running"""
    try:
        print("\n🌐 Checking frontend...")
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend: Running on http://localhost:3000")
            return True
        else:
            print(f"⚠️  Frontend: Responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Frontend: Not running (connection refused)")
        return False
    except Exception as e:
        print(f"❌ Frontend error: {e}")
        return False

def check_files():
    """Check important files"""
    print("\n📁 Checking important files...")
    
    important_files = [
        'frontend/public/kennedy-ogeto-profile.png',
        'frontend/.env.local',
        'frontend/package.json',
        'supabase/schema.sql',
        'complete-migration.py',
        'restart-frontend.sh'
    ]
    
    all_good = True
    for file_path in important_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} (missing)")
            all_good = False
    
    return all_good

def main():
    """Main status check"""
    print("🏥 Kennedy Ogeto CMS - System Status Check")
    print("=" * 50)
    
    db_status = check_database()
    frontend_status = check_frontend()
    files_status = check_files()
    
    print("\n📊 Summary:")
    print(f"   Database: {'✅ Connected' if db_status else '❌ Issues'}")
    print(f"   Frontend: {'✅ Running' if frontend_status else '❌ Not running'}")
    print(f"   Files: {'✅ Complete' if files_status else '❌ Missing files'}")
    
    if db_status and frontend_status and files_status:
        print("\n🎉 System Status: All systems operational!")
        print("🌐 Access your CMS:")
        print("   • Website: http://localhost:3000")
        print("   • Admin: http://localhost:3000/admin")
        print("   • Credentials: See ADMIN_CREDENTIALS.md")
    else:
        print("\n⚠️  System Status: Issues detected")
        if not frontend_status:
            print("💡 Start frontend: ./restart-frontend.sh")
        if not db_status:
            print("💡 Check database connection and environment variables")
        if not files_status:
            print("💡 Ensure all required files are present")

if __name__ == "__main__":
    main()