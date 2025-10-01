# 🚀 Quick Start - Kennedy Ogetto CMS

## The Issue
You're seeing Vite/React errors because you're accessing the wrong port. Our Next.js app runs on port 3001, not 3000.

## ✅ Quick Fix

### Step 1: Kill Existing Processes
```bash
# Kill any processes on ports 3000 and 3001
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:3001 | xargs kill -9
```

### Step 2: Start the Correct Application
```bash
# Navigate to frontend directory
cd frontend

# Start Next.js development server
npm run dev
```

### Step 3: Access the Correct URL
Visit: **http://localhost:3001** (NOT 3000)

## 🎯 What You Should See

### Home Page (http://localhost:3001)
- Kennedy Ogeto's professional profile
- Recent blog posts
- Career statistics
- Navigation menu with "Login to Edit" button

### Login Page (http://localhost:3001/login)
- See `ADMIN_CREDENTIALS.md` for login details

### After Login
- Admin dashboard at `/admin`
- Blog management at `/admin/blog`
- Profile settings at `/admin/profile`

## 🔧 If It Still Doesn't Work

### Check Environment File
Make sure `frontend/.env.local` exists with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://pyurqbnmaquuvqmbkjjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dXJxYm5tYXF1dXZxbWJrampwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMDE3NTksImV4cCI6MjA3NDg3Nzc1OX0.Kts9K-WVpz9wE7rphN-tfIM8ZBcyLJr2LPS7bewSv6U
```

### Check Dependencies
```bash
cd frontend
npm install
```

### Check Database Setup
```bash
# From project root
python3 test-connection.py
```

Should show:
- ✅ All tables accessible
- ✅ Profile data found
- ✅ Admin user found (if you ran the SQL fix)

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ No Vite/React errors in browser console
2. ✅ You see Kennedy Ogeto's profile on the home page
3. ✅ Navigation menu appears at the top
4. ✅ "Login to Edit" button is visible
5. ✅ Login works with admin credentials

## 📱 Application Structure

```
http://localhost:3001/           # Home page
http://localhost:3001/blog       # All blog posts
http://localhost:3001/timeline   # Career timeline
http://localhost:3001/login      # Admin login
http://localhost:3001/admin      # Admin dashboard (after login)
```

## 🚨 Common Mistakes

- ❌ Accessing `localhost:3000` instead of `localhost:3001`
- ❌ Missing `.env.local` file
- ❌ Not running `npm install` in frontend directory
- ❌ Database not set up (run the SQL fix script)

---

**The key is using port 3001, not 3000! 🎯**