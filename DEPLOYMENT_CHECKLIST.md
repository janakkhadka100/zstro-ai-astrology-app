# ZSTRO AI Deployment Checklist

## Pre-Deployment Checklist

### Environment Setup
- [ ] **Environment Variables**: All required environment variables are set
  - [ ] `NODE_ENV=production`
  - [ ] `OPENAI_API_KEY` - Valid OpenAI API key
  - [ ] `PROKERALA_API_KEY` - Valid Pokhrel API key
  - [ ] `PROKERALA_API_SECRET` - Valid Pokhrel API secret
  - [ ] `AUTH_SECRET` - Strong secret for NextAuth.js
  - [ ] `POSTGRES_URL` - Primary database connection
  - [ ] `DB_REPLICA_URL` - Replica database connection (optional)
  - [ ] `REDIS_URL` - Redis connection string
  - [ ] `PII_ENC_KEY` - 32-byte base64 encoded key
  - [ ] `PRIVACY_RETENTION_DAYS` - Data retention period (default: 365)
  - [ ] `STRIPE_SECRET_KEY` - Stripe secret key (if using Stripe)
  - [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
  - [ ] `KHALTI_SECRET` - Khalti secret key
  - [ ] `ESEWA_SECRET` - eSewa secret key
  - [ ] `CONNECTIPS_SECRET` - ConnectIPS secret key

### Database Setup
- [ ] **Primary Database**: PostgreSQL instance is running and accessible
- [ ] **Replica Database**: Read replica is configured (optional but recommended)
- [ ] **Database Migrations**: All migrations have been applied
  - [ ] Run `npm run db:migrate` to apply migrations
  - [ ] Verify all tables are created
  - [ ] Check indexes are created
- [ ] **Database Indexes**: Performance indexes are in place
  - [ ] `idx_users_email`
  - [ ] `idx_transactions_user_id_created_at`
  - [ ] `idx_chats_user_id_created_at`
  - [ ] `idx_messages_chat_id_created_at`
  - [ ] `idx_astrological_data_user_id_created_at`
- [ ] **Database Permissions**: Proper user permissions are set
- [ ] **Database Backup**: Backup strategy is in place

### Cache Setup
- [ ] **Redis Instance**: Redis is running and accessible
- [ ] **Redis Configuration**: Proper configuration for production
  - [ ] Memory limit set appropriately
  - [ ] Persistence configured
  - [ ] Eviction policy set
- [ ] **Cache Warm-up**: Critical data is pre-cached
- [ ] **Cache Monitoring**: Redis monitoring is set up

### External Services
- [ ] **Pokhrel API**: API credentials are valid and tested
- [ ] **OpenAI API**: API key is valid and has sufficient credits
- [ ] **Payment Gateways**: All payment gateways are configured
  - [ ] Stripe (if using)
  - [ ] Khalti
  - [ ] eSewa
  - [ ] ConnectIPS
- [ ] **Geocoding Service**: OpenStreetMap API is accessible
- [ ] **Email Service**: SMTP configuration is set up

### Security Setup
- [ ] **SSL Certificates**: Valid SSL certificates are installed
- [ ] **Security Headers**: Security headers are configured
- [ ] **CORS Configuration**: CORS is properly configured
- [ ] **Rate Limiting**: Rate limiting is enabled
- [ ] **Input Validation**: All inputs are validated
- [ ] **Data Encryption**: PII encryption is configured
- [ ] **Session Security**: JWT encryption is configured

### Monitoring Setup
- [ ] **Health Checks**: Health check endpoints are working
  - [ ] `/api/healthz` returns 200
  - [ ] Database connectivity check
  - [ ] Redis connectivity check
  - [ ] External API connectivity check
- [ ] **Logging**: Logging is configured for production
- [ ] **Error Tracking**: Error tracking service is set up
- [ ] **Performance Monitoring**: Performance monitoring is configured
- [ ] **Uptime Monitoring**: Uptime monitoring is set up

## Deployment Steps

### 1. Build and Test
- [ ] **Build Application**: Run `npm run build`
- [ ] **Build Success**: No build errors
- [ ] **Bundle Analysis**: Check bundle size and dependencies
- [ ] **Lint Check**: Run `npm run lint` - no errors
- [ ] **Type Check**: Run `npm run type-check` - no errors
- [ ] **Unit Tests**: Run `npm run test` - all tests pass
- [ ] **Integration Tests**: Run `npm run test:integration` - all tests pass
- [ ] **E2E Tests**: Run `npm run test:e2e` - all tests pass

### 2. Database Migration
- [ ] **Backup Database**: Create full database backup
- [ ] **Run Migrations**: Execute `npm run db:migrate`
- [ ] **Verify Schema**: Check all tables and indexes are created
- [ ] **Test Queries**: Run sample queries to verify functionality
- [ ] **Performance Check**: Verify query performance with indexes

### 3. Cache Setup
- [ ] **Redis Connection**: Test Redis connection
- [ ] **Cache Test**: Test cache read/write operations
- [ ] **Cache Invalidation**: Test cache invalidation logic
- [ ] **Memory Usage**: Monitor Redis memory usage
- [ ] **Persistence**: Verify Redis persistence is working

### 4. Application Deployment
- [ ] **Deploy to Staging**: Deploy to staging environment first
- [ ] **Staging Tests**: Run full test suite on staging
- [ ] **Performance Tests**: Run performance tests on staging
- [ ] **Security Tests**: Run security tests on staging
- [ ] **User Acceptance Tests**: Run UAT on staging
- [ ] **Deploy to Production**: Deploy to production environment
- [ ] **Verify Deployment**: Check all services are running

### 5. Post-Deployment Verification
- [ ] **Health Checks**: All health checks pass
- [ ] **API Endpoints**: All API endpoints are accessible
- [ ] **Database Connectivity**: Database is accessible
- [ ] **Cache Connectivity**: Redis is accessible
- [ ] **External Services**: All external services are accessible
- [ ] **Payment Processing**: Test payment processing
- [ ] **Astrology Calculations**: Test astrology calculations
- [ ] **User Registration**: Test user registration flow
- [ ] **User Login**: Test user login flow
- [ ] **Chart Generation**: Test chart generation
- [ ] **AI Responses**: Test AI response generation

## Production Configuration

### Environment Variables
```bash
# Core Configuration
NODE_ENV=production
PORT=3000

# Database
POSTGRES_URL=postgresql://user:password@host:5432/database
DB_REPLICA_URL=postgresql://user:password@replica-host:5432/database
READ_PREFER_REPLICA=true

# Cache
REDIS_URL=redis://user:password@host:6379

# Security
AUTH_SECRET=your-strong-secret-key
PII_ENC_KEY=your-32-byte-base64-encoded-key
PRIVACY_RETENTION_DAYS=365

# External APIs
OPENAI_API_KEY=sk-your-openai-key
PROKERALA_API_KEY=your-pokhrel-key
PROKERALA_API_SECRET=your-pokhrel-secret

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
KHALTI_SECRET=your-khalti-secret
ESEWA_SECRET=your-esewa-secret
CONNECTIPS_SECRET=your-connectips-secret

# Feature Flags
FF_PWA=true
FF_STRIPE=true
FF_I18N=true
FF_ANALYTICS=true

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

### Database Configuration
```sql
-- Connection Pool Settings
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

-- Performance Settings
random_page_cost = 1.1
effective_io_concurrency = 200
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
```

### Redis Configuration
```conf
# Memory Settings
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence Settings
save 900 1
save 300 10
save 60 10000

# Network Settings
timeout 300
tcp-keepalive 300
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    # Proxy to Next.js
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
}
```

## Monitoring and Alerting

### Health Check Endpoints
- [ ] **Application Health**: `GET /api/healthz`
- [ ] **Database Health**: `GET /api/healthz/database`
- [ ] **Cache Health**: `GET /api/healthz/cache`
- [ ] **External APIs**: `GET /api/healthz/external`

### Key Metrics to Monitor
- [ ] **Response Time**: API response times < 400ms (cached), < 900ms (cold)
- [ ] **Error Rate**: Error rate < 1%
- [ ] **Uptime**: Uptime > 99.9%
- [ ] **Memory Usage**: Memory usage < 80%
- [ ] **CPU Usage**: CPU usage < 70%
- [ ] **Database Connections**: Active connections < 80% of max
- [ ] **Cache Hit Rate**: Cache hit rate > 80%
- [ ] **Queue Length**: Queue length < 100

### Alerting Rules
- [ ] **High Error Rate**: Alert if error rate > 5%
- [ ] **High Response Time**: Alert if response time > 2s
- [ ] **Low Uptime**: Alert if uptime < 99%
- [ ] **High Memory Usage**: Alert if memory usage > 90%
- [ ] **Database Issues**: Alert if database connectivity fails
- [ ] **Cache Issues**: Alert if Redis connectivity fails
- [ ] **External API Issues**: Alert if external APIs fail

## Rollback Plan

### Rollback Triggers
- [ ] **High Error Rate**: Error rate > 10%
- [ ] **Critical Bugs**: Critical functionality broken
- [ ] **Security Issues**: Security vulnerabilities discovered
- [ ] **Performance Issues**: Performance degradation > 50%
- [ ] **Data Corruption**: Data integrity issues

### Rollback Steps
1. [ ] **Stop New Deployments**: Prevent new deployments
2. [ ] **Identify Issue**: Determine the root cause
3. [ ] **Rollback Code**: Revert to previous stable version
4. [ ] **Rollback Database**: Revert database changes if needed
5. [ ] **Verify Rollback**: Ensure rollback is successful
6. [ ] **Monitor System**: Monitor system stability
7. [ ] **Communicate**: Notify stakeholders of rollback

### Rollback Checklist
- [ ] **Code Rollback**: Previous version deployed
- [ ] **Database Rollback**: Database reverted if needed
- [ ] **Cache Clear**: Clear all caches
- [ ] **Health Checks**: All health checks pass
- [ ] **Functionality**: Core functionality working
- [ ] **Performance**: Performance restored
- [ ] **Monitoring**: Monitoring shows green status

## Post-Deployment Tasks

### Immediate Tasks (0-1 hour)
- [ ] **Health Check**: Verify all services are running
- [ ] **Smoke Tests**: Run basic functionality tests
- [ ] **Monitor Logs**: Check for any errors or warnings
- [ ] **Performance Check**: Verify response times are acceptable
- [ ] **User Test**: Test with real user account

### Short-term Tasks (1-24 hours)
- [ ] **Monitor Metrics**: Watch key performance metrics
- [ ] **User Feedback**: Monitor user feedback and reports
- [ ] **Error Analysis**: Analyze any errors that occur
- [ ] **Performance Tuning**: Optimize based on real traffic
- [ ] **Documentation**: Update deployment documentation

### Long-term Tasks (1-7 days)
- [ ] **Performance Analysis**: Analyze performance patterns
- [ ] **User Behavior**: Analyze user behavior and usage
- [ ] **Capacity Planning**: Plan for future capacity needs
- [ ] **Security Review**: Conduct security review
- [ ] **Optimization**: Implement performance optimizations

## Emergency Procedures

### Critical Issues
- [ ] **Database Down**: Switch to read-only mode
- [ ] **Cache Down**: Disable caching temporarily
- [ ] **External API Down**: Use cached data or show maintenance page
- [ ] **High Load**: Enable rate limiting and scaling
- [ ] **Security Breach**: Immediate lockdown and investigation

### Contact Information
- [ ] **On-call Engineer**: Primary contact for technical issues
- [ ] **DevOps Team**: Infrastructure and deployment issues
- [ ] **Security Team**: Security-related issues
- [ ] **Management**: Business-critical issues
- [ ] **External Vendors**: Third-party service issues

---

## Deployment Sign-off

### Technical Lead
- [ ] **Code Review**: All code changes reviewed and approved
- [ ] **Testing**: All tests pass and coverage is adequate
- [ ] **Performance**: Performance requirements met
- [ ] **Security**: Security requirements met
- [ ] **Documentation**: Documentation is up to date

### DevOps Engineer
- [ ] **Infrastructure**: Infrastructure is ready and configured
- [ ] **Monitoring**: Monitoring and alerting are set up
- [ ] **Backup**: Backup and recovery procedures are in place
- [ ] **Scaling**: Auto-scaling is configured
- [ ] **Security**: Security measures are implemented

### Product Manager
- [ ] **Features**: All planned features are implemented
- [ ] **Quality**: Quality standards are met
- [ ] **User Experience**: User experience is satisfactory
- [ ] **Business Requirements**: Business requirements are met
- [ ] **Go-live**: Ready for production launch

---

*Last Updated: January 2024*
*Version: 1.0.0*
