#!/usr/bin/env python3
"""
Fix missing timeline_sources table
"""

try:
    from supabase import create_client, Client
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "supabase==2.20.0"])
    from supabase import create_client, Client

import os

def fix_timeline_sources():
    """Create the missing timeline_sources table"""
    
    SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://pyurqbnmaquuvqmbkjjp.supabase.co')
    SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dXJxYm5tYXF1dXZxbWJrampwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDE3NTksImV4cCI6MjA3NDg3Nzc1OX0.Kts9K-WVpz9wE7rphN-tfIM8ZBcyLJr2LPS7bewSv6U')
    
    print("🔧 Fixing Timeline Sources Table")
    print("=" * 40)
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Check if table exists
        try:
            result = supabase.table('timeline_sources').select('*').limit(1).execute()
            print("✅ timeline_sources table already exists!")
            return True
        except Exception as e:
            if 'timeline_sources' in str(e) and 'not find' in str(e):
                print("📝 timeline_sources table missing, need to create it")
            else:
                print(f"❌ Unexpected error: {e}")
                return False
        
        print("\n💡 Manual Setup Required:")
        print("The timeline_sources table needs to be created manually in Supabase.")
        print("\n📋 Steps:")
        print("1. Go to your Supabase Dashboard: https://app.supabase.com")
        print("2. Navigate to SQL Editor")
        print("3. Run this SQL:")
        print("""
-- Create timeline_sources table
CREATE TABLE IF NOT EXISTS timeline_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_entry_id UUID REFERENCES timeline_entries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  publication VARCHAR(255),
  source_date DATE,
  source_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE timeline_sources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for timeline_sources" ON timeline_sources FOR SELECT USING (true);
CREATE POLICY "Admin full access to timeline_sources" ON timeline_sources FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
        """)
        
        print("\n4. After running the SQL, restart your frontend:")
        print("   ./restart-frontend.sh")
        
        return False
        
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

if __name__ == "__main__":
    fix_timeline_sources()