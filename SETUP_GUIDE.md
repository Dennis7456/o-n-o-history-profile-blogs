# Kennedy Ogeto CMS - Complete Setup Guide

## 📋 Overview

The Kennedy Ogeto Content Management System is a comprehensive platform for managing legal case documentation, career timeline, and professional profile information. This guide will walk you through the complete setup process.

## 🛠️ Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Git**
- **Supabase Account** (free tier available)

### System Requirements
- **Operating System**: macOS, Linux, or Windows
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: 2GB free space

## 🚀 Quick Start (5 Minutes)

### 1. Clone and Setup
```bash
# Clone the repository
git clone <repository-url>
cd kennedy-ogeto-cms

# Install Python dependencies
pip install -r requirements.txt

# Setup frontend
cd frontend
npm install
cd ..
```

### 2. Database Setup
```bash
# Run the migration script
python3 complete-migration.py
```

### 3. Start the Application
```bash
# Start the frontend
./restart-frontend.sh
```

### 4. Access the System
- **Public Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Login**: See `ADMIN_CREDENTIALS.md`

## 📖 Detailed Setup Instructions

### Step 1: Environment Configuration

#### 1.1 Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > API to get your credentials
4. Note down:
   - Project URL
   - Anon/Public Key
   - Service Role Key (for admin operations)

#### 1.2 Frontend Environment
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 1.3 Backend Environment
Create `supabase/.env.local`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Step 2: Database Schema Setup

#### 2.1 Create Database Schema
```bash
# Navigate to Supabase dashboard
# Go to SQL Editor
# Run the schema from supabase/schema.sql
```

#### 2.2 Add Archive Field (if needed)
```bash
# Run the archive field migration
# Execute supabase/add_archive_field.sql in SQL Editor
```

### Step 3: Data Migration

#### 3.1 Migrate Existing Data
```bash
# Run the complete migration script
python3 complete-migration.py
```

This will:
- Create admin user
- Import blog posts from site/data/blog.json
- Import timeline entries from site/data/kennedy-ogetto-cases-chronological.json
- Set up profile information

#### 3.2 Verify Data Migration
```bash
# Check the migration results
python3 -c "
from supabase import create_client
import os
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))
print('Blog posts:', len(supabase.table('blog_posts').select('*').execute().data))
print('Timeline entries:', len(supabase.table('timeline_entries').select('*').execute().data))
"
```

### Step 4: Frontend Setup

#### 4.1 Install Dependencies
```bash
cd frontend
npm install
```

#### 4.2 Configure Next.js
The `frontend/next.config.js` is already configured for:
- Image optimization
- Environment variables
- Build optimization

#### 4.3 Start Development Server
```bash
# From project root
./restart-frontend.sh

# Or manually
cd frontend
npm run dev
```

### Step 5: Profile Image Setup

#### 5.1 Add Profile Image
```bash
# Copy your profile image to frontend/public/
cp your-profile-image.png frontend/public/kennedy-ogeto-profile.png
```

The system is configured to use `/kennedy-ogeto-profile.png` as the profile image.

## 🎯 System Features

### Content Management
- **Blog Posts**: Create, edit, archive, and manage legal case documentation
- **Timeline**: Manage career milestones and important events
- **Profile**: Update professional information and credentials

### User Interface
- **Public Website**: Clean, professional presentation of content
- **Admin Panel**: Comprehensive management interface
- **Responsive Design**: Works on desktop, tablet, and mobile

### Data Management
- **Archive System**: Hide posts without deleting them
- **Search & Filter**: Find content quickly
- **Bulk Operations**: Manage multiple items efficiently

### Tutorial System
- **Interactive Guide**: Step-by-step tutorial for new users
- **Context-Aware**: Highlights relevant UI elements
- **Progress Tracking**: Saves completion status

## 🔧 Configuration Options

### Database Configuration
- **Row Level Security**: Enabled for data protection
- **Public Access**: Read-only access to published content
- **Admin Access**: Full CRUD operations for authenticated users

### Frontend Configuration
- **Image Optimization**: Automatic image compression and resizing
- **SEO Optimization**: Meta tags and structured data
- **Performance**: Code splitting and lazy loading

### Authentication
- **Simple Auth**: Username/password authentication
- **Session Management**: Secure session handling
- **Role-Based Access**: Admin-only areas protected

## 📱 Usage Instructions

### Admin Panel Access
1. Navigate to http://localhost:3000/admin
2. Login with default credentials (see `ADMIN_CREDENTIALS.md`)
3. Use the tutorial (shown on first login) to learn the interface

### Creating Content
1. **New Blog Post**: Admin > Blog > New Post
2. **Edit Profile**: Admin > Profile
3. **Manage Timeline**: Admin > Timeline (if implemented)

### Content Management
- **Archive Posts**: Use archive button to hide from public
- **Restore Posts**: Use restore button to make public again
- **Search**: Use search bar to find specific content
- **Filter**: Use category filters to organize content

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
python3 -c "
from supabase import create_client
import os
try:
    supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))
    result = supabase.table('profile').select('*').execute()
    print('✅ Database connection successful')
except Exception as e:
    print('❌ Database connection failed:', e)
"
```

#### Frontend Issues
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev

# Check for missing dependencies
npm install
```

#### Profile Image Issues
```bash
# Verify image exists
ls -la frontend/public/kennedy-ogeto-profile.png

# Check image permissions
chmod 644 frontend/public/kennedy-ogeto-profile.png
```

### Getting Help
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database schema is properly created
4. Check that all dependencies are installed

## 🚀 Deployment

### Production Deployment
1. **Frontend**: Deploy to Vercel, Netlify, or similar
2. **Database**: Use Supabase production instance
3. **Environment**: Set production environment variables
4. **Domain**: Configure custom domain if needed

### Environment Variables for Production
```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Backend
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_KEY=your_production_service_key
```

## 📚 Additional Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Support
- Check existing issues in the repository
- Create new issues for bugs or feature requests
- Follow the contribution guidelines for pull requests

## 🔄 Maintenance

### Regular Tasks
- **Backup Database**: Export data regularly
- **Update Dependencies**: Keep packages up to date
- **Monitor Performance**: Check loading times and errors
- **Content Review**: Regularly review and update content

### Updates
```bash
# Update frontend dependencies
cd frontend
npm update

# Update Python dependencies
pip install -r requirements.txt --upgrade
```

---

## 📞 Quick Reference

### Important URLs
- **Local Development**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Supabase Dashboard**: https://app.supabase.com

### Default Credentials
- See `ADMIN_CREDENTIALS.md` for login information

### Key Files
- **Frontend Config**: `frontend/.env.local`
- **Database Schema**: `supabase/schema.sql`
- **Migration Script**: `complete-migration.py`
- **Restart Script**: `restart-frontend.sh`

### Commands
```bash
# Start development
./restart-frontend.sh

# Run migration
python3 complete-migration.py

# Clean project
python3 cleanup-project.py
```

---

**🎉 You're all set! The Kennedy Ogeto CMS is ready to use.**