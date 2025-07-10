# Linux Deployment Checklist - Trinits Payroll System

## Pre-Deployment Checklist

### 🛡️ Security & Configuration

- [ ] Update `.env.production` with real production values:
  - [ ] Database credentials (PostgreSQL)
  - [ ] Clerk production keys (sign-in/sign-up URLs, webhook secret)
  - [ ] Resend API key for email notifications
  - [ ] CRON_SECRET and NEXTAUTH_SECRET (32+ characters)
  - [ ] Domain: `https://trinitstechnologies.com/payroll`

### 🗄️ Database Preparation

- [ ] Ensure PostgreSQL is installed and running on Linux server
- [ ] Create database: `payroll`
- [ ] Create database user with appropriate permissions
- [ ] Test database connection from the server

### 🔧 Server Requirements

- [ ] Ubuntu/Debian Linux server (18.04 LTS or newer)
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Nginx installed and configured
- [ ] UFW firewall configured (ports 22, 80, 443)
- [ ] Domain DNS pointing to server IP

## Deployment Steps

### 1. Server Initial Setup

```bash
# Copy setup script to server
scp scripts/setup-server.sh user@your-server:/tmp/

# SSH and run setup (as sudo)
ssh user@your-server
sudo /tmp/setup-server.sh
```

### 2. Application Deployment

```bash
# Copy application files to server
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='.next' \
  ./ user@your-server:/var/www/trinits-payroll/

# SSH to server
ssh user@your-server
cd /var/www/trinits-payroll

# Update environment file
cp .env.production.example .env.production
nano .env.production  # Update with production values

# Deploy with PM2
./scripts/deploy-pm2.sh
```

### 3. Nginx Configuration

```bash
# Copy and enable nginx config
sudo cp nginx-pm2.conf /etc/nginx/sites-available/trinits-payroll
sudo ln -s /etc/nginx/sites-available/trinits-payroll /etc/nginx/sites-enabled/

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 4. SSL Certificate Setup

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d trinitstechnologies.com
```

## Post-Deployment Verification

### ✅ Application Health Checks

- [ ] Application accessible at: `https://trinitstechnologies.com/payroll`
- [ ] Health endpoint responding:
      `https://trinitstechnologies.com/payroll/api/health`
- [ ] Database connectivity working
- [ ] Authentication (Clerk) working
- [ ] Email notifications working (if configured)

### ✅ PM2 Status

```bash
pm2 list                    # Check application status
pm2 logs trinits-payroll    # Check application logs
pm2 monit                   # Monitor resources
```

### ✅ Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t              # Test configuration
curl -I https://trinitstechnologies.com/payroll
```

### ✅ Security Verification

- [ ] HTTPS redirect working (HTTP → HTTPS)
- [ ] Security headers present
- [ ] Rate limiting functional
- [ ] Firewall rules active: `sudo ufw status`

## Monitoring & Maintenance

### 📊 Setup Monitoring

- [ ] PM2 monitoring dashboard (optional)
- [ ] Log rotation configured
- [ ] Backup automation scheduled
- [ ] Health check alerts

### 🔄 Regular Maintenance

```bash
# Application management
pm2 restart trinits-payroll     # Restart app
pm2 reload trinits-payroll      # Zero-downtime reload

# System updates
sudo apt update && sudo apt upgrade

# Log management
pm2 flush trinits-payroll       # Clear logs
```

### 💾 Backup Strategy

```bash
# Database backup (automated with cron)
./scripts/backup.sh

# Application backup
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/trinits-payroll
```

## Troubleshooting

### 🚨 Common Issues

1. **Application not starting**
   - Check PM2 logs: `pm2 logs trinits-payroll`
   - Verify environment variables in `.env.production`
   - Check database connectivity

2. **502 Bad Gateway**
   - Ensure PM2 application is running: `pm2 list`
   - Check Nginx configuration: `sudo nginx -t`
   - Verify port 3000 is accessible: `netstat -tlnp | grep 3000`

3. **Database connection issues**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Test database connection: `psql $DATABASE_URL`
   - Check firewall rules for database port

### 📞 Support Commands

```bash
# Application status
pm2 describe trinits-payroll

# System resources
htop
df -h
free -m

# Network connectivity
ss -tulpn | grep :3000
curl -I localhost:3000/payroll/api/health
```

## Production URLs

- **Application**: https://trinitstechnologies.com/payroll
- **Health Check**: https://trinitstechnologies.com/payroll/api/health
- **Admin Dashboard**: https://trinitstechnologies.com/payroll/admin

## Important Files

- **PM2 Config**: `/var/www/trinits-payroll/ecosystem.config.json`
- **Nginx Config**: `/etc/nginx/sites-available/trinits-payroll`
- **Environment**: `/var/www/trinits-payroll/.env.production`
- **Logs**: `/var/log/pm2/trinits-payroll.log`
