#!/bin/bash
# Linux Server Setup Script for Trinits Payroll System with PM2

set -e

echo "=== Linux Server Setup for Trinits Payroll System ==="
echo "This script will install and configure the required software"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    print_error "This script must be run as root (use sudo)"
    exit 1
fi

# Get non-root user
REAL_USER=${SUDO_USER:-$USER}
if [ "$REAL_USER" = "root" ]; then
    read -p "Enter the username that will run the application: " REAL_USER
fi

print_status "Setting up server for user: $REAL_USER"

# Update system
print_status "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt-get install -y curl wget git build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js (LTS version)
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js $NODE_VERSION and npm $NPM_VERSION installed"

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Install PostgreSQL
print_status "Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Install Nginx
print_status "Installing Nginx..."
apt-get install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Install UFW firewall
print_status "Installing and configuring firewall..."
apt-get install -y ufw

# Configure UFW
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

print_status "Firewall configured (SSH, HTTP, HTTPS allowed)"

# Create application directory
APP_DIR="/var/www/trinits-payroll"
mkdir -p "$APP_DIR"
chown -R "$REAL_USER:$REAL_USER" "$APP_DIR"
print_status "Application directory created: $APP_DIR"

# Create backup directory
BACKUP_DIR="/var/backups/trinits-payroll"
mkdir -p "$BACKUP_DIR"
chown -R "$REAL_USER:$REAL_USER" "$BACKUP_DIR"
print_status "Backup directory created: $BACKUP_DIR"

# Create PM2 log directory
mkdir -p /var/log/pm2
chown -R "$REAL_USER:$REAL_USER" /var/log/pm2
print_status "PM2 log directory created"

# Setup PostgreSQL database
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE payroll_prod;"
sudo -u postgres psql -c "CREATE USER payroll_user WITH ENCRYPTED PASSWORD 'change_this_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE payroll_prod TO payroll_user;"
sudo -u postgres psql -c "ALTER USER payroll_user CREATEDB;"

print_status "PostgreSQL database 'payroll_prod' created with user 'payroll_user'"
print_warning "Please change the default password for payroll_user!"

# Configure PostgreSQL for production
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"

if [ -f "$PG_CONFIG_DIR/postgresql.conf" ]; then
    print_status "Configuring PostgreSQL for production..."
    
    # Backup original config
    cp "$PG_CONFIG_DIR/postgresql.conf" "$PG_CONFIG_DIR/postgresql.conf.backup"
    
    # Update configuration
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "$PG_CONFIG_DIR/postgresql.conf"
    sed -i "s/#port = 5432/port = 5432/" "$PG_CONFIG_DIR/postgresql.conf"
    
    # Restart PostgreSQL
    systemctl restart postgresql
    print_status "PostgreSQL configured and restarted"
fi

# Install SSL certificate tools
print_status "Installing SSL certificate tools..."
apt-get install -y certbot python3-certbot-nginx

# Create SSL certificate directory
mkdir -p /etc/ssl/certs /etc/ssl/private
chmod 700 /etc/ssl/private

# Install monitoring tools
print_status "Installing monitoring tools..."
apt-get install -y htop iotop nethogs ncdu tree

# Setup logrotate for application logs
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/trinits-payroll << EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 $REAL_USER $REAL_USER
    postrotate
        sudo -u $REAL_USER pm2 reloadLogs
    endscript
}
EOF

# Create systemd service for automatic PM2 startup
print_status "Setting up PM2 startup service..."
sudo -u "$REAL_USER" pm2 startup systemd -u "$REAL_USER" --hp "/home/$REAL_USER"

# Create a simple health check script
cat > /usr/local/bin/payroll-health-check << 'EOF'
#!/bin/bash
# Health check script for Trinits Payroll

HEALTH_URL="http://localhost:3000/payroll/api/health"
LOG_FILE="/var/log/payroll-health.log"

if curl -f -s "$HEALTH_URL" > /dev/null; then
    echo "$(date): Health check passed" >> "$LOG_FILE"
    exit 0
else
    echo "$(date): Health check failed" >> "$LOG_FILE"
    # Restart PM2 application
    sudo -u $REAL_USER pm2 restart trinits-payroll
    exit 1
fi
EOF

chmod +x /usr/local/bin/payroll-health-check

# Add health check to crontab
(crontab -u "$REAL_USER" -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/payroll-health-check") | crontab -u "$REAL_USER" -

print_status "Health check script created and scheduled"

# Display summary
echo ""
echo "=== Server Setup Complete ==="
echo "Node.js: $NODE_VERSION"
echo "npm: $NPM_VERSION"
echo "PM2: $(pm2 --version)"
echo "PostgreSQL: $(sudo -u postgres psql -t -c 'SELECT version();' | head -1 | xargs)"
echo "Nginx: $(nginx -v 2>&1)"
echo ""
echo "=== Next Steps ==="
echo "1. Copy your application files to: $APP_DIR"
echo "2. Create and configure: $APP_DIR/.env.production"
echo "3. Run deployment script: sudo -u $REAL_USER $APP_DIR/scripts/deploy-pm2.sh"
echo "4. Copy nginx config: cp $APP_DIR/nginx-pm2.conf /etc/nginx/sites-available/trinits-payroll"
echo "5. Enable nginx site: ln -s /etc/nginx/sites-available/trinits-payroll /etc/nginx/sites-enabled/"
echo "6. Test nginx config: nginx -t && systemctl reload nginx"
echo "7. Setup SSL certificate: certbot --nginx -d trinitstechnologies.com"
echo ""
echo "=== Important Security Notes ==="
echo "• Change PostgreSQL password: sudo -u postgres psql -c \"ALTER USER payroll_user PASSWORD 'new_secure_password';\""
echo "• Update .env.production with secure secrets"
echo "• Configure proper backup strategy"
echo "• Setup monitoring and alerting"
echo ""
print_status "Server setup completed successfully!"
