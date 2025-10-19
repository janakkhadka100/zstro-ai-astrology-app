#!/bin/bash

# Vedic Astrology App Deployment Script
echo "🚀 Starting deployment process..."

# Check if git is clean
if [[ -n $(git status -s) ]]; then
  echo "⚠️  Warning: You have uncommitted changes. Committing them now..."
  git add .
  git commit -m "chore: Auto-commit before deployment"
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix errors before deploying."
  exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod

if [ $? -eq 0 ]; then
  echo "🎉 Deployment successful!"
  echo "📱 Your app is now live on Vercel"
else
  echo "❌ Deployment failed. Please check the logs."
  exit 1
fi
