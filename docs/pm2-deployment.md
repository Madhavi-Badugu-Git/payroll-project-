# PM2 Deployment Guide - Trinits Technologies Payroll System

## Overview

This guide covers deploying the Trinits Payroll System using PM2 (Process
Manager 2) on a Linux server.

## Prerequisites

- Ubuntu/Debian Linux server (18.04 LTS or newer)
- Domain name pointing to your server (`trinitstechnologies.com`)
- SSH access to the server
- Sudo privileges

## Quick Deployment

### 1. Server Setup (Run once)

```bash
# Copy setup script to server
scp scripts/setup-server.sh user@your-server:/tmp/

# SSH to server and run setup
ssh user@your-server
sudo /tmp/setup-server.sh
```

### 2. Application Deployment

```bash
# Copy application files to server
rsync -avz --exclude='node_modules' --exclude='.git' \
  ./ user@your-server:/var/www/trinits-payroll/

# SSH to server and deploy
ssh user@your-server
cd /var/www/trinits-payroll
./scripts/deploy-pm2.sh
```

### 3. Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx-pm2.conf /etc/nginx/sites-available/trinits-payroll

# Enable the site
sudo ln -s /etc/nginx/sites-available/trinits-payroll /etc/nginx/sites-enabled/

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Setup SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d trinitstechnologies.com -d www.trinitstechnologies.com
```

## Detailed Setup Instructions

### Server Preparation

1. **Update System**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Required Software**

   ```bash
   # Node.js (LTS)
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # PM2
   sudo npm install -g pm2

   # PostgreSQL
   sudo apt install -y postgresql postgresql-contrib

   # Nginx
   sudo apt install -y nginx
   ```

3. **Database Setup**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE payroll_prod;
   CREATE USER payroll_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE payroll_prod TO payroll_user;
   \q
   ```

### Application Configuration

1. **Environment Variables** Create `/var/www/trinits-payroll/.env.production`:

   ```bash
   # Database
   DATABASE_URL="postgresql://payroll_user:your_password@localhost:5432/payroll_prod"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_your_key"
   CLERK_SECRET_KEY="sk_live_your_secret"
   CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret"

   # URLs with basePath
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/payroll/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/payroll/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/payroll/dashboard"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/payroll/dashboard"

   # Email
   RESEND_API_KEY="re_your_api_key"
   EMAIL_NOTIFICATIONS_ENABLED=true
   FROM_EMAIL="noreply@trinitstechnologies.com"
   ADMIN_EMAIL="admin@trinitstechnologies.com"

   # Security
   CRON_SECRET="your_secure_cron_secret"
   NODE_ENV="production"
   ```

2. **PM2 Configuration** The `ecosystem.config.json` is already configured for:
   - Cluster mode with maximum CPU cores
   - Auto-restart on crashes
   - Log management
   - Memory limit protection

### Deployment Process

1. **Install Dependencies**

   ```bash
   cd /var/www/trinits-payroll
   npm ci --only=production
   npm install --save-dev  # For build process
   ```

2. **Database Migration**

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

3. **Build Application**

   ```bash
   npm run build
   ```

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.json --env production
   pm2 save
   pm2 startup
   ```

## PM2 Management Commands

### Basic Operations

```bash
# Start application
pm2 start ecosystem.config.json --env production

# Stop application
pm2 stop trinits-payroll

# Restart application
pm2 restart trinits-payroll

# Delete application
pm2 delete trinits-payroll

# View logs
pm2 logs trinits-payroll

# Monitor applications
pm2 monit

# List all applications
pm2 list
```

### Advanced Operations

```bash
# Reload without downtime
pm2 reload trinits-payroll

# Scale to specific number of instances
pm2 scale trinits-payroll 4

# Reset restart count
pm2 reset trinits-payroll

# Save current process list
pm2 save

# Restore saved process list
pm2 resurrect
```

## Nginx Configuration

### SSL and Security

The nginx configuration includes:

- HTTP to HTTPS redirect
- SSL/TLS configuration
- Security headers
- Rate limiting
- Gzip compression
- Static file caching

### URL Rewriting

- Main domain redirects to `/payroll`
- Proper proxy headers for authentication
- Health check endpoint exposure

## Monitoring and Maintenance

### Health Monitoring

The application includes a comprehensive health check at:

- **URL**: `https://trinitstechnologies.com/payroll/api/health`
- **Features**: Database connectivity, memory usage, uptime

### Log Management

```bash
# Application logs
pm2 logs trinits-payroll

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
journalctl -u postgresql -f
```

### Automated Health Checks

A cron job runs every 5 minutes to check application health and restart if
needed.

### Backup Strategy

```bash
# Database backup (daily cron job recommended)
pg_dump postgresql://payroll_user:password@localhost:5432/payroll_prod > backup-$(date +%Y%m%d).sql

# Application backup
tar -czf app-backup-$(date +%Y%m%d).tar.gz -C /var/www trinits-payroll
```

## Security Considerations

### Firewall Configuration

```bash
# UFW firewall rules
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL Certificate Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Automatic renewal (already configured by certbot)
```

### Environment Security

- Use strong passwords for database
- Rotate API keys regularly
- Keep server updated
- Monitor access logs

## Troubleshooting

### Common Issues

1. **Application Won't Start**

   ```bash
   # Check PM2 logs
   pm2 logs trinits-payroll

   # Check environment variables
   pm2 env 0
   ```

2. **Database Connection Issues**

   ```bash
   # Test database connection
   psql postgresql://payroll_user:password@localhost:5432/payroll_prod

   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

3. **Nginx Issues**

   ```bash
   # Test configuration
   sudo nginx -t

   # Check nginx status
   sudo systemctl status nginx
   ```

4. **SSL Issues**

   ```bash
   # Check certificate
   sudo certbot certificates

   # Renew certificate
   sudo certbot renew
   ```

### Performance Optimization

1. **PM2 Clustering**
   - Application runs in cluster mode
   - Utilizes all CPU cores
   - Load balances requests

2. **Database Optimization**
   - Connection pooling enabled
   - Proper indexing in place
   - Regular VACUUM operations

3. **Nginx Caching**
   - Static assets cached for 1 year
   - Gzip compression enabled
   - Proper cache headers

## Updates and Deployment

### Deployment Process

```bash
# 1. Upload new code
rsync -avz --exclude='node_modules' ./ user@server:/var/www/trinits-payroll/

# 2. SSH to server
ssh user@server

# 3. Deploy
cd /var/www/trinits-payroll
./scripts/deploy-pm2.sh
```

### Zero-Downtime Deployment

```bash
# PM2 reload provides zero-downtime deployment
pm2 reload trinits-payroll
```

This setup provides a robust, scalable, and maintainable deployment for the
Trinits Payroll System using PM2 on Linux.
