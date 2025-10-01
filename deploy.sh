#!/bin/bash

# Kennedy Ogeto CMS - Netlify Deployment Script
echo "🚀 Deploying Kennedy Ogeto CMS to Netlify..."

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod

echo "🎉 Deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "1. Test the live site functionality"
echo "2. Verify admin panel access"
echo "3. Check environment variables are set"
echo "4. Test CRUD operations"
echo "5. Verify Supabase connection"
echo ""
echo "🔗 Don't forget to:"
echo "- Set up custom domain (optional)"
echo "- Configure DNS records"
echo "- Test on mobile devices"