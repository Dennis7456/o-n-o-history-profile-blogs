#!/usr/bin/env python3
"""
Add is_archived field to existing blog_posts table
"""

try:
    from supabase import create_client, Client
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "supabase==2.20.0"])
    from supabase import create_client, Client

import os

def add_archive_field():
    """Add is_archived field to blog_posts table"""
    
    # Get Supabase credentials from environment or use defaults
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://pyurqbnmaquuvqmbkjjp.supabase.co')
    SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dXJxYm5tYXF1dXZxbWJrampwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTMwMTc1OSwiZXhwIjoyMDc0ODc3NzU5fQ.Kts9K-WVpz9wE7rphN-tfIM8ZBcyLJr2LPS7bewSv6U')
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("🔧 Adding is_archived field to blog_posts table...")
        
        # Check if column already exists
        try:
            result = supabase.table('blog_posts').select('is_archived').limit(1).execute()
            print("✅ is_archived column already exists!")
            return True
        except Exception as e:
            if 'column "is_archived" does not exist' in str(e) or '42703' in str(e):
                print("📝 Column doesn't exist, adding it...")
            else:
                print(f"❌ Error checking column: {e}")
                return False
        
        # Add the column using RPC (if available) or direct SQL
        try:
            # Try using RPC to execute SQL
            sql_command = """
            ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
            CREATE INDEX IF NOT EXISTS idx_blog_posts_archived ON blog_posts(is_archived);
            UPDATE blog_posts SET is_archived = FALSE WHERE is_archived IS NULL;
            """
            
            result = supabase.rpc('exec_sql', {'sql': sql_command}).execute()
            print("✅ Successfully added is_archived column using RPC!")
            
        except Exception as rpc_error:
            print(f"⚠️  RPC method failed: {rpc_error}")
            print("💡 Please manually add the column using Supabase SQL Editor:")
            print("   1. Go to your Supabase dashboard")
            print("   2. Navigate to SQL Editor")
            print("   3. Run this SQL:")
            print("   ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;")
            print("   CREATE INDEX IF NOT EXISTS idx_blog_posts_archived ON blog_posts(is_archived);")
            print("   UPDATE blog_posts SET is_archived = FALSE WHERE is_archived IS NULL;")
            return False
        
        # Verify the column was added
        try:
            result = supabase.table('blog_posts').select('is_archived').limit(1).execute()
            print("✅ Column verification successful!")
            return True
        except Exception as e:
            print(f"❌ Column verification failed: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def main():
    """Main function"""
    print("🗃️  Database Archive Field Setup")
    print("=" * 40)
    
    success = add_archive_field()
    
    if success:
        print("\n🎉 Archive field setup complete!")
        print("✅ The blog post archive feature is now available")
        print("🔄 Restart your frontend to use the new functionality")
        print("   ./restart-frontend.sh")
    else:
        print("\n⚠️  Manual setup required")
        print("📋 Follow the instructions above to add the column manually")
        print("🔄 Then restart your frontend")

if __name__ == "__main__":
    main()