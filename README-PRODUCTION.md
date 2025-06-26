# Production Deployment - Trinits Technologies Payroll System

## Quick Start for Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (can be containerized)
- SSL certificate for `trinitstechnologies.com`
- Clerk production application configured
- Resend account for email notifications

### 1. Environment Setup

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with your production values
nano .env.production
```

### 2. Deploy with Docker Compose

```bash
# Build and deploy
./scripts/deploy.sh production

# Or manually:
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Access Application

- **URL**: `https://trinitstechnologies.com/payroll`
- **Health Check**: `https://trinitstechnologies.com/payroll/api/health`

## Available Scripts

### Production Scripts

```bash
npm run deploy:prod          # Full production deployment
npm run docker:prod          # Start production containers
npm run docker:prod:down     # Stop production containers
npm run docker:prod:logs     # View application logs
npm run db:migrate           # Run database migrations
npm run db:backup            # Create database backup
```

### Development Scripts

```bash
npm run dev                  # Start development server
npm run build               # Build for production
npm run lint                # Run linting
npm run db:studio           # Open Prisma Studio
```

## Configuration Files

### Key Production Files

- `next.config.ts` - Next.js production configuration
- `docker-compose.prod.yml` - Production container orchestration
- `nginx.conf` - Reverse proxy configuration
- `Dockerfile` - Application container definition
- `.env.production.example` - Environment template

### Security Features

- CSP headers configured
- Rate limiting enabled
- SSL/TLS termination
- Security headers (HSTS, X-Frame-Options, etc.)
- Input validation and sanitization

## Monitoring

### Health Checks

- Application: `/payroll/api/health`
- Database: Automatic health checks in Docker
- Redis: Automatic health checks in Docker

### Logs

```bash
# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f payroll-app

# View specific service logs
docker-compose -f docker-compose.prod.yml logs postgres
docker-compose -f docker-compose.prod.yml logs nginx
```

## Backup and Recovery

### Automated Backups

- Daily database backups at 2 AM
- 7-day retention policy
- Compressed SQL dumps

### Manual Backup

```bash
# Create immediate backup
npm run db:backup

# Or using Docker
docker-compose -f docker-compose.prod.yml exec postgres /backup.sh
```

### Recovery

```bash
# Restore from backup
gunzip < backup_file.sql.gz | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U payroll_user -d payroll_prod
```

## Scaling and Performance

### Horizontal Scaling

- Load balancer configuration included in nginx.conf
- Stateless application design
- Database connection pooling

### Performance Optimizations

- Next.js production build optimizations
- Gzip compression enabled
- Static asset caching
- Database query optimization

## Security Checklist

- [ ] SSL certificate installed and configured
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Webhook secrets configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Access logs monitored
- [ ] Regular security updates scheduled

## Troubleshooting

### Common Issues

1. **Application won't start**

   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs payroll-app

   # Verify environment variables
   docker-compose -f docker-compose.prod.yml exec payroll-app env | grep -E "(DATABASE_URL|CLERK_)"
   ```

2. **Database connection issues**

   ```bash
   # Test database connection
   docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U payroll_user

   # Check database logs
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

3. **SSL/Domain issues**

   ```bash
   # Test SSL certificate
   openssl s_client -connect trinitstechnologies.com:443 -servername trinitstechnologies.com

   # Check nginx configuration
   docker-compose -f docker-compose.prod.yml exec nginx nginx -t
   ```

### Support

For production support issues, contact the development team with:

- Application logs
- Environment configuration (sanitized)
- Steps to reproduce the issue
- Expected vs actual behavior

## Maintenance

### Regular Tasks

- Monitor application health daily
- Review error logs weekly
- Update dependencies monthly
- Security patch updates immediately
- Database backup verification weekly

### Updates

```bash
# Update application
git pull origin main
./scripts/deploy.sh production

# Update dependencies
npm audit fix
npm run build
./scripts/deploy.sh production
```
