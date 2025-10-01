# Manual Archive Field Setup

## 🎯 Issue
The `is_archived` column doesn't exist in the `blog_posts` table yet, causing errors when trying to use archive functionality.

## 🔧 Solution

### Step 1: Add the Archive Column
1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Run this SQL command:

```sql
-- Add is_archived column to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_archived ON blog_posts(is_archived);

-- Set all existing posts to not archived
UPDATE blog_posts SET is_archived = FALSE WHERE is_archived IS NULL;
```

### Step 2: Verify the Setup
Run this query to verify the column was added:

```sql
SELECT id, title, is_archived FROM blog_posts LIMIT 5;
```

You should see the `is_archived` column with `false` values.

### Step 3: Restart Frontend
```bash
./restart-frontend.sh
```

## ✅ After Setup

Once the column is added, you'll have full archive functionality:

- **Archive Posts**: Hide posts from public view without deleting them
- **Restore Posts**: Make archived posts public again
- **Filter View**: Toggle between showing all posts or only active posts
- **Admin Control**: Full management of post visibility

## 🔄 Alternative: Use Without Archive Feature

If you prefer not to add the column right now, the system will work without archive functionality:

- All posts will be visible to the public
- Archive buttons will show error messages
- You can still create, edit, and delete posts normally

The frontend has been updated to handle the missing column gracefully.

## 📞 Need Help?

If you encounter issues:
1. Check that you're using the correct Supabase project
2. Ensure you have admin access to the database
3. Verify the SQL runs without errors
4. Restart the frontend after making changes

---

**The archive feature is optional but recommended for better content management.**