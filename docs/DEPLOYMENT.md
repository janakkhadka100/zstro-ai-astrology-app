# Deployment Guide

## Overview

This guide covers deploying the ZSTRO AI Astrology Platform to various environments, from development to production.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ database
- Redis 6+ (optional, for caching)
- Domain name and SSL certificate (for production)
- Environment variables configured

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/zstro_astrology"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# API Keys
OPENAI_API_KEY="your-openai-api-key"
PROKERALA_API_KEY="your-prokerala-api-key"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"

# Feature Flags
FF_DARK_MODE=1
FF_SKELETONS=1
FF_WS_REALTIME=1
FF_EXPORT=1
FF_HISTORY=1
FF_NOTIFICATIONS=1
FF_PWA=0

# Security
RATE_LIMIT_REDIS_URL="redis://localhost:6379"
UPLOAD_MAX_SIZE="20971520" # 20MB
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/webp,application/pdf"

# Monitoring (optional)
SENTRY_DSN="your-sentry-dsn"
ANALYTICS_ID="your-analytics-id"
```

### Generating VAPID Keys

For push notifications, generate VAPID keys:

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

This will output:
```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa40HI8Qy8nw3TzSwj6fJbmJREBJ0L3GzK1bDQMQK_lxHcR45cT8p5LPMHmM

Private Key:
VUybM1cU0pcuL215LO5Fz4VtU5LWuFwAeB4lUyS0xS0

=======================================
```

## Vercel Deployment (Recommended)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

```bash
vercel link
```

### 4. Set Environment Variables

```bash
# Set each variable
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add PROKERALA_API_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add VAPID_PUBLIC_KEY
vercel env add VAPID_PRIVATE_KEY

# Set feature flags
vercel env add FF_DARK_MODE
vercel env add FF_SKELETONS
vercel env add FF_WS_REALTIME
vercel env add FF_EXPORT
vercel env add FF_HISTORY
vercel env add FF_NOTIFICATIONS
```

### 5. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 6. Configure Database

Set up a PostgreSQL database (recommended: Vercel Postgres, Supabase, or PlanetScale):

```bash
# Using Vercel Postgres
vercel storage create postgres

# Get connection string
vercel storage connect postgres
```

### 7. Run Database Migrations

```bash
# Install database client
npm install -g @vercel/postgres

# Run migrations
vercel db migrate
```

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PROKERALA_API_KEY=${PROKERALA_API_KEY}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}
      - VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=zstro_astrology
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 3. Build and Run

```bash
# Build the image
docker build -t zstro-astrology .

# Run with docker-compose
docker-compose up -d

# Or run standalone
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:password@localhost:5432/zstro_astrology" \
  -e OPENAI_API_KEY="your-key" \
  -e PROKERALA_API_KEY="your-key" \
  zstro-astrology
```

## Manual Server Deployment

### 1. Server Requirements

- Ubuntu 20.04+ or CentOS 8+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Nginx (for reverse proxy)
- PM2 (for process management)

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Redis
sudo apt install redis-server

# Install Nginx
sudo apt install nginx

# Install PM2
sudo npm install -g pm2
```

### 3. Set Up Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE zstro_astrology;
CREATE USER zstro_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE zstro_astrology TO zstro_user;
\q
```

### 4. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/zstro-astrology.git
cd zstro-astrology

# Install dependencies
npm ci --production

# Build application
npm run build

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
npm run db:migrate

# Start application with PM2
pm2 start npm --name "zstro-astrology" -- start
pm2 save
pm2 startup
```

### 5. Configure Nginx

Create `/etc/nginx/sites-available/zstro-astrology`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/zstro-astrology /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Setup

### 1. Run Migrations

```bash
# Using Drizzle CLI
npm run db:migrate

# Or manually with SQL
psql -d zstro_astrology -f migrations/001_initial_schema.sql
```

### 2. Seed Initial Data

```bash
# Run seed script
npm run db:seed
```

### 3. Create Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_snapshots_session_id ON snapshots(session_id);

-- Composite indexes
CREATE INDEX idx_sessions_user_updated ON sessions(user_id, updated_at DESC);
CREATE INDEX idx_messages_session_created ON messages(session_id, created_at DESC);
```

## Monitoring and Logging

### 1. Set Up Logging

```bash
# Install winston for logging
npm install winston

# Configure log rotation
sudo apt install logrotate

# Create logrotate config
sudo nano /etc/logrotate.d/zstro-astrology
```

Logrotate config:
```
/var/log/zstro-astrology/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Set Up Monitoring

```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Configure PM2 monitoring
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 3. Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check Redis connection
    await redis.ping();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 });
  }
}
```

## Backup and Recovery

### 1. Database Backup

```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/var/backups/zstro-astrology"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump zstro_astrology > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 2. Application Backup

```bash
# Backup application files
tar -czf /var/backups/zstro-astrology/app_backup_$(date +%Y%m%d).tar.gz /opt/zstro-astrology
```

### 3. Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/zstro-astrology/scripts/backup.sh
```

## Security Considerations

### 1. Firewall Configuration

```bash
# Configure UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000  # Block direct access to app port
```

### 2. Database Security

```sql
-- Create read-only user for monitoring
CREATE USER zstro_readonly WITH PASSWORD 'readonly_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO zstro_readonly;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
SELECT pg_reload_conf();
```

### 3. Application Security

```bash
# Set secure file permissions
chmod 600 .env.local
chmod 755 /opt/zstro-astrology
chown -R www-data:www-data /opt/zstro-astrology
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U zstro_user -d zstro_astrology

# Check logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 2. Redis Connection Failed

```bash
# Check Redis status
sudo systemctl status redis

# Test connection
redis-cli ping

# Check logs
sudo tail -f /var/log/redis/redis-server.log
```

#### 3. Application Crashes

```bash
# Check PM2 logs
pm2 logs zstro-astrology

# Check application logs
tail -f /var/log/zstro-astrology/error.log

# Restart application
pm2 restart zstro-astrology
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run

# Check Nginx config
sudo nginx -t
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM sessions WHERE user_id = '123';

-- Update table statistics
ANALYZE;

-- Reindex if needed
REINDEX DATABASE zstro_astrology;
```

#### 2. Redis Optimization

```bash
# Check Redis memory usage
redis-cli info memory

# Configure memory policy
redis-cli config set maxmemory-policy allkeys-lru
```

#### 3. Application Optimization

```bash
# Monitor PM2 processes
pm2 monit

# Check memory usage
pm2 show zstro-astrology

# Scale application
pm2 scale zstro-astrology 4
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or HAProxy
2. **Multiple Instances**: Run multiple PM2 instances
3. **Database Replication**: Set up read replicas
4. **Redis Cluster**: Use Redis Cluster for high availability

### Vertical Scaling

1. **Increase Server Resources**: More CPU, RAM, storage
2. **Database Optimization**: Better hardware, SSD storage
3. **Caching**: More Redis memory, CDN integration
4. **Code Optimization**: Performance profiling and optimization

## Maintenance

### Regular Tasks

1. **Security Updates**: Keep dependencies updated
2. **Database Maintenance**: Regular VACUUM and ANALYZE
3. **Log Rotation**: Clean up old log files
4. **Backup Verification**: Test backup restoration
5. **Performance Monitoring**: Check metrics and optimize

### Update Procedure

```bash
# 1. Backup current version
pm2 stop zstro-astrology
cp -r /opt/zstro-astrology /opt/zstro-astrology.backup

# 2. Pull latest changes
cd /opt/zstro-astrology
git pull origin main

# 3. Install dependencies
npm ci --production

# 4. Run migrations
npm run db:migrate

# 5. Build application
npm run build

# 6. Start application
pm2 start zstro-astrology

# 7. Verify deployment
curl http://localhost:3000/api/health
```

This deployment guide provides comprehensive instructions for deploying the ZSTRO AI Astrology Platform across different environments. Choose the deployment method that best fits your infrastructure and requirements.
