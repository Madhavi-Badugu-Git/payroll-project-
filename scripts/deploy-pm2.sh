#!/bin/bash
# PM2 Deployment Script for Trinits Payroll System on Linux

set -e

echo "=== Trinits Technologies Payroll System - PM2 Deployment ==="
echo "Starting deployment at $(date)"

# Configuration
APP_NAME="trinits-payroll"
APP_DIR="/var/www/trinits-payroll"
BACKUP_DIR="/var/backups/trinits-payroll"
NODE_VERSION="18"
DOMAIN="trinitstechnologies.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    print_error "This script should not be run as root directly. Use sudo for specific commands."
    exit 1
fi

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js $NODE_VERSION first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 is not installed. Installing PM2..."
    sudo npm install -g pm2
    print_status "PM2 installed successfully"
fi

# Check if PostgreSQL client is available
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y postgresql-client
fi

# Create application directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    print_status "Creating application directory: $APP_DIR"
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
fi

# Create backup directory
if [ ! -d "$BACKUP_DIR" ]; then
    print_status "Creating backup directory: $BACKUP_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo chown -R $USER:$USER "$BACKUP_DIR"
fi

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Navigate to app directory
cd "$APP_DIR"

# Backup current deployment if it exists
if [ -d ".next" ]; then
    print_status "Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    cp -r .next package.json package-lock.json "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true
    print_status "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Copy application files
print_status "Copying application files..."
if [ -d "/Users/sudhakar/Projects/Github/payroll" ]; then
    # Development deployment
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='.next' \
          /Users/sudhakar/Projects/Github/payroll/ "$APP_DIR/"
else
    # Assume files are already in current directory or will be uploaded
    print_warning "Source directory not found. Assuming files are already in place."
fi

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Install dev dependencies for build
npm install --save-dev

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    if [ -f ".env.production.example" ]; then
        print_warning "Production environment file not found. Creating from template..."
        cp .env.production.example .env.production
        print_error "Please edit .env.production with your production configuration before continuing!"
        print_error "nano $APP_DIR/.env.production"
        exit 1
    else
        print_error ".env.production file is required. Please create it with your production configuration."
        exit 1
    fi
fi

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Build the application
print_status "Building application..."
npm run build

# Stop PM2 app if running
if pm2 list | grep -q "$APP_NAME"; then
    print_status "Stopping existing PM2 process..."
    pm2 stop "$APP_NAME"
    pm2 delete "$APP_NAME"
fi

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.json --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
STARTUP_CMD=$(pm2 startup systemd -u $USER --hp $HOME | tail -n 1)
if [[ $STARTUP_CMD == *"sudo"* ]]; then
    echo "Please run the following command to setup PM2 startup:"
    echo "$STARTUP_CMD"
fi

# Wait for application to start
print_status "Waiting for application to start..."
sleep 10

# Health check
print_status "Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost:3000/payroll/api/health > /dev/null 2>&1; then
        print_status "Application is healthy and running!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Health check failed! Check PM2 logs: pm2 logs $APP_NAME"
        pm2 logs "$APP_NAME" --lines 20
        exit 1
    fi
    echo "Waiting for application... ($i/30)"
    sleep 2
done

# Display status
echo ""
echo "=== Deployment Status ==="
pm2 list
echo ""
echo "=== Application Info ==="
echo "Application URL: http://localhost:3000/payroll"
if [ ! -z "$DOMAIN" ]; then
    echo "Production URL: https://$DOMAIN/payroll"
fi
echo ""
echo "=== Useful Commands ==="
echo "View logs:           pm2 logs $APP_NAME"
echo "Monitor:             pm2 monit"
echo "Restart:             pm2 restart $APP_NAME"
echo "Stop:                pm2 stop $APP_NAME"
echo "Application status:  pm2 list"
echo ""

print_status "Deployment completed successfully!"
print_warning "Don't forget to:"
print_warning "1. Configure Nginx reverse proxy"
print_warning "2. Setup SSL certificate"
print_warning "3. Configure firewall rules"
print_warning "4. Setup monitoring and alerts"
