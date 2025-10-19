# 🚀 Deployment Guide

## Quick Deploy

```bash
# Deploy to Vercel (recommended)
npm run deploy

# Or manually
npx vercel --prod
```

## Manual Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

3. **Verify deployment:**
   - Check the health endpoint: `https://your-app.vercel.app/_health`
   - Test the main pages:
     - `/kundali` - Main kundali page
     - `/kundali-test` - Test page with empty/sample data
     - `/vedic-demo` - VedicExplainer demo

## Environment Variables

Make sure to set these in your Vercel dashboard:

```env
# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app

# Prokerala API
PROKERALA_API_KEY=your_prokerala_api_key

# Redis (optional)
REDIS_URL=your_redis_url
```

## Features Deployed

✅ **Reliable Result Cards Layout**
- Always-visible layout with skeleton states
- No blank screens, graceful error handling
- Client-safe components with proper SSR handling

✅ **PDF Export Functionality**
- Multi-page PDF generation
- Chart capture with html2canvas
- Proper i18n support (Nepali/English)

✅ **Comprehensive Testing**
- Empty data scenarios
- Sample data scenarios
- Health check endpoint

✅ **Error Boundaries**
- Graceful fallback UI
- No crashes on component errors

## URLs

- **Production**: https://zstro-ai-astrology-kwv6df5ch-janaks-projects-69446763.vercel.app
- **Health Check**: https://zstro-ai-astrology-kwv6df5ch-janaks-projects-69446763.vercel.app/_health
- **Main Kundali**: https://zstro-ai-astrology-kwv6df5ch-janaks-projects-69446763.vercel.app/kundali
- **Test Page**: https://zstro-ai-astrology-kwv6df5ch-janaks-projects-69446763.vercel.app/kundali-test
- **Vedic Demo**: https://zstro-ai-astrology-kwv6df5ch-janaks-projects-69446763.vercel.app/vedic-demo

## Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Deployment Issues
```bash
# Check Vercel logs
npx vercel logs

# Redeploy
npx vercel --prod --force
```

### Health Check
```bash
# Test health endpoint
curl https://your-app.vercel.app/_health
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint and format
npm run lint:fix
npm run format
```
