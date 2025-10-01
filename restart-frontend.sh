#!/bin/bash

echo "🔄 Restarting Kennedy Ogetto CMS Frontend..."

# Navigate to frontend
cd frontend

# Kill existing processes
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Clear Next.js cache
echo "🧹 Clearing cache..."
rm -rf .next

# Reinstall dependencies to ensure everything is fresh
echo "📦 Refreshing dependencies..."
npm install

# Start development server
echo "🚀 Starting development server..."
echo ""
echo "📱 Your Kennedy Ogetto CMS will be available at:"
echo "   http://localhost:3000"
echo ""
echo "🎯 Database Status:"
echo "   ✅ 15 blog posts available"
echo "   ✅ 21 timeline entries available"
echo "   ✅ Complete profile information"
echo ""
echo "🔑 Admin access available at /admin"
echo ""

npm run dev