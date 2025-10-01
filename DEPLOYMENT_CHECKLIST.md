# 🚀 Netlify Deployment Checklist

## **Quick Start (5 Minutes)**

### **Option 1: Netlify Dashboard (Easiest)**
1. **Go to [netlify.com](https://netlify.com)** and sign in
2. **Click "Add new site"** → "Import an existing project"
3. **Connect your GitHub repository**
4. **Configure build settings:**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/.next
   ```
5. **Add environment variables** (Site settings → Environment variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-supabase-anon-key
   ```
6. **Click "Deploy site"**

### **Option 2: Netlify CLI (Advanced)**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Run deployment script
./deploy.sh
```

---

## **Pre-Deployment Checklist**

### **✅ Repository Setup**
- [ ] Code is pushed to GitHub/GitLab
- [ ] `netlify.toml` file is in project root
- [ ] `frontend/_redirects` file exists
- [ ] Environment variables are documented

### **✅ Supabase Configuration**
- [ ] Supabase project is set up
- [ ] Database schema is deployed
- [ ] Row Level Security policies are configured
- [ ] API keys are ready

### **✅ Frontend Preparation**
- [ ] `npm run build` works locally
- [ ] All dependencies are in `package.json`
- [ ] Environment variables are configured
- [ ] Images and assets are optimized

---

## **Environment Variables Needed**

```bash
# Required for Netlify deployment
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://kennedyogeto.com
```

---

## **Post-Deployment Testing**

### **✅ Basic Functionality**
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Images display properly
- [ ] Mobile responsive design

### **✅ Content Management**
- [ ] Blog posts display
- [ ] Timeline page works
- [ ] Search functionality
- [ ] Filtering works

### **✅ Admin Panel**
- [ ] Login page accessible at `/admin`
- [ ] Authentication works
- [ ] Dashboard loads
- [ ] CRUD operations function
- [ ] File uploads work (if applicable)

### **✅ Database Integration**
- [ ] Data loads from Supabase
- [ ] Create operations work
- [ ] Update operations work
- [ ] Delete operations work
- [ ] Real-time updates function

---

## **Common Issues & Solutions**

### **Build Failures**
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and rebuild
rm -rf frontend/.next
rm -rf frontend/node_modules
cd frontend && npm install && npm run build
```

### **Environment Variables Not Working**
1. Check they're set in Netlify dashboard
2. Verify variable names match exactly
3. Redeploy after adding variables

### **Routing Issues**
- Ensure `_redirects` file is in `frontend/` directory
- Check `netlify.toml` redirect configuration

### **Database Connection Issues**
- Verify Supabase URL and keys
- Check network policies in Supabase
- Test connection locally first

---

## **Performance Optimization**

### **✅ Already Configured**
- Next.js automatic optimization
- Image optimization with Next.js Image
- Tailwind CSS purging
- Automatic code splitting

### **✅ Netlify Features**
- Global CDN
- Automatic HTTPS
- Gzip compression
- Asset optimization

---

## **Custom Domain Setup (Optional)**

### **1. Add Domain in Netlify**
- Site settings → Domain management
- Add custom domain: `kennedyogeto.com`

### **2. Configure DNS**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME  
Name: www
Value: your-site-name.netlify.app
```

### **3. SSL Certificate**
- Automatically provisioned by Netlify
- Usually active within 24 hours

---

## **🎉 Success Indicators**

When deployment is successful, you should see:
- ✅ Green build status in Netlify
- ✅ Site accessible at provided URL
- ✅ All pages load without errors
- ✅ Admin panel accessible
- ✅ Database operations work
- ✅ HTTPS certificate active

---

## **Support & Troubleshooting**

### **Netlify Resources**
- [Netlify Docs](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/)
- [Build troubleshooting](https://docs.netlify.com/configure-builds/troubleshooting-tips/)

### **Project-Specific Help**
- Check build logs in Netlify dashboard
- Review environment variables
- Test locally with `npm run build`
- Verify Supabase connection

**Ready to deploy? Follow Option 1 above for the quickest setup!** 🚀