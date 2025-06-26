#!/bin/bash
# Production Deployment Script for Trinits Payroll System

set -e

echo "=== Trinits Technologies Payroll System Deployment ==="
echo "Starting deployment at $(date)"

# Configuration
DEPLOYMENT_ENV=${1:-production}
BACKUP_BEFORE_DEPLOY=${2:-true}

echo "Deployment environment: $DEPLOYMENT_ENV"

# Pre-deployment checks
echo "Running pre-deployment checks..."

# Check if environment file exists
if [ ! -f ".env.${DEPLOYMENT_ENV}" ]; then
    echo "ERROR: Environment file .env.${DEPLOYMENT_ENV} not found!"
    echo "Please create the environment file with production configuration."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    exit 1
fi

# Check if required environment variables are set
source ".env.${DEPLOYMENT_ENV}"
required_vars=("DATABASE_URL" "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "CLERK_SECRET_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "ERROR: Required environment variable $var is not set!"
        exit 1
    fi
done

echo "✓ Pre-deployment checks passed"

# Backup database if requested
if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
    echo "Creating backup before deployment..."
    docker-compose -f docker-compose.prod.yml exec -T postgres /backup.sh || echo "Warning: Backup failed, continuing deployment..."
fi

# Pull latest changes (if deploying from git)
if [ -d ".git" ]; then
    echo "Pulling latest changes..."
    git pull origin main
fi

# Build and deploy
echo "Building application..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Run database migrations
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T payroll-app npx prisma migrate deploy

# Health check
echo "Performing health check..."
for i in {1..30}; do
    if curl -f http://localhost:3000/payroll/api/health > /dev/null 2>&1; then
        echo "✓ Application is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "ERROR: Application health check failed!"
        echo "Checking logs..."
        docker-compose -f docker-compose.prod.yml logs payroll-app
        exit 1
    fi
    echo "Waiting for application to be ready... ($i/30)"
    sleep 10
done

# Show deployment status
echo "=== Deployment Status ==="
docker-compose -f docker-compose.prod.yml ps

echo "=== Application Logs (last 20 lines) ==="
docker-compose -f docker-compose.prod.yml logs --tail=20 payroll-app

echo "=== Deployment completed successfully at $(date) ==="
echo "Application is available at: https://trinitstechnologies.com/payroll"
echo ""
echo "To monitor logs: docker-compose -f docker-compose.prod.yml logs -f payroll-app"
echo "To check status: docker-compose -f docker-compose.prod.yml ps"
