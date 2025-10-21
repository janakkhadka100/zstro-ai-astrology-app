#!/bin/bash
# Build script for Vercel deployment

set -e

echo "🚀 Starting Vercel build process..."

# Check Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit --no-fund

# Run type checking
echo "🔍 Running type check..."
npm run typecheck || echo "⚠️ Type check failed, continuing with build..."

# Run linting
echo "🧹 Running linter..."
npm run lint || echo "⚠️ Linting failed, continuing with build..."

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"
