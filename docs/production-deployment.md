# Production Deployment Guide for Trinits Technologies Payroll System

## Overview

This guide covers all the changes required to deploy the payroll application to
production at `trinitstechnologies.com/payroll`.

## 1. Environment Configuration

### Production Environment Variables

Create a production `.env` file with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:5432/payroll_prod?sslmode=require"

# Clerk Authentication (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Webhook Configuration
CLERK_WEBHOOK_SECRET="whsec_..."

# Email Configuration
RESEND_API_KEY="re_..."
EMAIL_NOTIFICATIONS_ENABLED=true
FROM_EMAIL="noreply@trinitstechnologies.com"
ADMIN_EMAIL="admin@trinitstechnologies.com"

# Cron Security
CRON_SECRET="your_secure_production_cron_secret"

# Security
NEXTAUTH_SECRET="your_production_secret_key"
NEXTAUTH_URL="https://trinitstechnologies.com/payroll"

# Application Configuration
NODE_ENV="production"
```

## 2. Next.js Configuration Updates

### next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Base path for subdirectory deployment
  basePath: '/payroll',
  assetPrefix: '/payroll',

  // Image optimization
  images: {
    domains: ['trinitstechnologies.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects for old URLs
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },

  // Enable static file serving
  trailingSlash: false,

  // Production webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
```

## 3. Database Configuration

### Production Database Setup

1. **PostgreSQL Production Database**:

   ```sql
   CREATE DATABASE payroll_prod;
   CREATE USER payroll_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE payroll_prod TO payroll_user;
   ```

2. **SSL Configuration**: Enable SSL for database connections
3. **Backup Strategy**: Set up automated daily backups
4. **Connection Pooling**: Use connection pooling for better performance

### Migration for Production

```bash
# Deploy migrations to production
npx prisma migrate deploy

# Generate production client
npx prisma generate

# Seed production data (if needed)
npx prisma db seed
```

## 4. Deployment Options

### Option A: Vercel Deployment (Recommended)

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Deploy**:

   ```bash
   vercel --prod
   ```

3. **Configure custom domain** in Vercel dashboard

### Option B: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  payroll-app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=payroll_prod
      - POSTGRES_USER=payroll_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## 5. Nginx Configuration

### Reverse Proxy Setup

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name trinitstechnologies.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    location /payroll {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Handle payroll subdirectory
        rewrite ^/payroll(/.*)$ $1 break;
    }
}
```

## 6. Security Enhancements

### Content Security Policy

Add to `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *.clerk.accounts.dev; connect-src 'self' *.clerk.accounts.dev wss:; frame-src 'self' *.clerk.accounts.dev;",
        },
      ],
    },
  ];
},
```

### Rate Limiting

Add rate limiting middleware for API routes.

## 7. Monitoring and Logging

### Error Tracking

Configure error tracking service (Sentry, LogRocket, etc.)

### Performance Monitoring

Set up application performance monitoring

### Health Checks

Create health check endpoint:

```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

## 8. Clerk Authentication Setup

### Production Configuration

1. **Create Clerk Production Application**
2. **Configure OAuth providers** (Google, Microsoft)
3. **Set up webhook endpoints** for user sync
4. **Configure email templates** with company branding

## 9. Email Configuration

### Resend Setup

1. **Verify domain**: `trinitstechnologies.com`
2. **Set up DKIM records**
3. **Configure email templates**

## 10. Backup and Recovery

### Database Backups

```bash
#!/bin/bash
# backup-script.sh
pg_dump $DATABASE_URL > "backup-$(date +%Y%m%d-%H%M%S).sql"
aws s3 cp backup-*.sql s3://trinits-backups/payroll/
```

### File System Backups

- Set up regular backups of uploaded files
- Implement file versioning

## 11. Performance Optimizations

### Caching Strategy

- Redis for session storage
- Database query optimization
- CDN for static assets

### Database Indexing

Review and optimize database indexes for production workload.

## 12. Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Clerk authentication configured
- [ ] Email service configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Performance testing completed
- [ ] Error tracking configured
- [ ] Health checks implemented

## 13. Post-Deployment Tasks

1. **User Training**: Train administrators and employees
2. **Data Migration**: Import existing employee data
3. **Integration Testing**: Test all workflows
4. **Performance Monitoring**: Monitor application performance
5. **Security Audit**: Conduct security review

## 14. Maintenance

### Regular Tasks

- Monitor application health
- Review error logs
- Update dependencies
- Backup verification
- Security updates

This comprehensive guide ensures a secure, scalable, and maintainable production
deployment of the payroll system.
