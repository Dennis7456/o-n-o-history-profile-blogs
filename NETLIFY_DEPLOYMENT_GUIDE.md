# Netlify Deployment Guide for Kennedy Ogeto CMS

## 🚀 **Complete Netlify Deployment Instructions**

### **Prerequisites**
- ✅ Netlify account (existing)
- ✅ GitHub repository with your code
- ✅ Supabase project with database setup

---

## **Step 1: Prepare Your Repository**

### **1.1 Create Netlify Configuration**
Create a `netlify.toml` file in your project root:

```toml
[build]
  publish = "frontend/.next"
  command = "cd frontend && npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  NODE_ENV = "production"
```

### **1.2 Update Package.json Build Script**
Your current build script is correct:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

---

## **Step 2: Deploy to Netlify**

### **Option A: Deploy via Netlify Dashboard (Recommended)**

1. **Login to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in to your existing account

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub" (or your Git provider)

3. **Connect Repository**
   - Authorize Netlify to access your repositories
   - Select your Kennedy Ogeto CMS repository

4. **Configure Build Settings**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/.next
   ```

5. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add these variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
   ```

6. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### **Option B: Deploy via Netlify CLI**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   cd frontend
   netlify init
   ```

4. **Set Environment Variables**
   ```bash
   netlify env:set NEXT_PUBLIC_SUPABASE_URL "your-supabase-url"
   netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-supabase-anon-key"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

---

## **Step 3: Configure Domain & Settings**

### **3.1 Custom Domain (Optional)**
1. Go to Site settings → Domain management
2. Add custom domain: `kennedyogeto.com` or similar
3. Configure DNS records as instructed

### **3.2 HTTPS & Security**
- Netlify automatically provides HTTPS
- Enable "Force HTTPS" in Site settings

### **3.3 Build Hooks (Optional)**
- Create build hooks for automatic deployments
- Useful for CMS updates or scheduled rebuilds

---

## **Step 4: Environment Variables Setup**

### **Required Environment Variables:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Analytics, etc.
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX (if using Google Analytics)
```

### **How to Add in Netlify:**
1. Site settings → Environment variables
2. Click "Add variable"
3. Enter key and value
4. Save and redeploy

---

## **Step 5: Optimize for Production**

### **5.1 Create Production Build Script**
Add to `frontend/package.json`:
```json
{
  "scripts": {
    "build:netlify": "next build && next export"
  }
}
```

### **5.2 Update Netlify Build Command**
In Netlify dashboard:
```
Build command: npm run build
```

### **5.3 Performance Optimizations**
- Images are already optimized with Next.js Image component
- Tailwind CSS is purged automatically
- React components are minified

---

## **Step 6: Post-Deployment Checklist**

### **✅ Test Functionality**
- [ ] Homepage loads correctly
- [ ] Blog posts display properly
- [ ] Timeline page works
- [ ] Admin login functions
- [ ] CRUD operations work
- [ ] Images load correctly

### **✅ SEO & Performance**
- [ ] Meta tags are correct
- [ ] Site loads quickly
- [ ] Mobile responsive
- [ ] HTTPS enabled

### **✅ Admin Access**
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Can create/edit content
- [ ] Database operations function

---

## **Step 7: Continuous Deployment**

### **Automatic Deployments**
Netlify will automatically deploy when you:
- Push to main/master branch
- Merge pull requests
- Update via Git

### **Manual Deployments**
```bash
# From frontend directory
netlify deploy --prod
```

---

## **Troubleshooting Common Issues**

### **Build Failures**
```bash
# Check build logs in Netlify dashboard
# Common fixes:
- Ensure Node.js version is 18+
- Check environment variables are set
- Verify all dependencies are in package.json
```

### **Environment Variable Issues**
```bash
# Verify variables are set:
netlify env:list

# Update if needed:
netlify env:set VARIABLE_NAME "value"
```

### **Routing Issues**
- Next.js routing should work automatically
- Check `_redirects` file if needed

### **Database Connection Issues**
- Verify Supabase URL and keys
- Check Row Level Security policies
- Ensure database is accessible

---

## **Step 8: Domain Configuration**

### **Custom Domain Setup**
1. **Add Domain in Netlify**
   - Site settings → Domain management
   - Add custom domain

2. **DNS Configuration**
   ```
   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app

   Type: A
   Name: @
   Value: 75.2.60.5 (Netlify's IP)
   ```

3. **SSL Certificate**
   - Automatically provisioned by Netlify
   - Usually takes 24-48 hours

---

## **Final Deployment URLs**

After deployment, you'll have:
- **Production URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://kennedyogeto.com` (if configured)
- **Admin Panel**: `https://your-domain.com/admin`

---

## **🎉 Deployment Complete!**

Your Kennedy Ogeto CMS is now live on Netlify with:
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Continuous Deployment**
- ✅ **Environment Variables**
- ✅ **Production Optimization**

**Next Steps:**
1. Test all functionality on live site
2. Configure custom domain (optional)
3. Set up monitoring/analytics
4. Share the live URL!

**Live Site Access:**
- **Public Website**: `https://your-domain.com`
- **Admin Panel**: `https://your-domain.com/admin`
- **Login**: Use your configured admin credentials