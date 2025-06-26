# Payroll Management System

A modern payroll management application built with Next.js, Prisma, PostgreSQL,
and Clerk authentication. This system provides comprehensive employee
management, attendance tracking, leave management, and payroll processing
capabilities.

## 🚀 Features

- **Employee Management**: Add, edit, and manage employee records with
  auto-generated Employee IDs
- **Excel Import/Export**: Bulk import employees from Excel files and export
  employee data
- **Employee Details**: Dedicated employee profile pages with comprehensive
  information
- **Attendance Tracking**: Real-time check-in/check-out with automated
  calculations
- **Leave Management**: Leave applications, approvals, and balance tracking
- **Holiday Management**: Configure company holidays and non-working days
- **Attendance Regularization**: Request and approve attendance corrections
- **Payroll Processing**: Generate payslips and salary calculations
- **Dashboard Analytics**: Visual insights into attendance patterns
- **Role-based Access**: Admin and employee roles with appropriate permissions
- **Automated Code Quality**: ESLint, Prettier, and pre-commit hooks
- **User-Employee Linking**: Automatic linking of Clerk users with employee
  records by email

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Clerk
- **Date/Time**: date-fns for consistent date handling
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **Charts**: Recharts
- **PDF Generation**: jsPDF, PDFKit
- **Excel Processing**: SheetJS (xlsx), file-saver
- **Logging**: Winston with daily log rotation

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Clerk account for authentication

## 🏠 Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd payroll
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/payroll_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 4. Database Setup

1. **Create PostgreSQL Database**:

   ```bash
   createdb payroll_db
   ```

2. **Run Database Migrations**:

   ```bash
   npx prisma migrate dev
   ```

3. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

4. **Seed Database (Optional)**:
   ```bash
   npm run seed
   ```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 6. Development Commands

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint          # Check for lint errors
npm run lint:fix      # Fix lint errors automatically

# Formatting
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are formatted correctly

# Database
npx prisma studio     # Open Prisma Studio (database GUI)
npx prisma migrate dev # Run database migrations
npx prisma generate   # Generate Prisma client

# Logging
npm run logs:view     # View application logs
npm run logs:errors   # View error logs
npm run logs:clean    # Clean old log files
```

## 🐧 Production Setup (Linux)

### 1. System Requirements

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+, npm, PM2
- PostgreSQL 12+
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt recommended)

### 2. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 3. Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE payroll_db;
CREATE USER payroll_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE payroll_db TO payroll_user;
\q
```

### 4. Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/payroll
sudo chown $USER:$USER /var/www/payroll

# Clone repository
cd /var/www/payroll
git clone <your-repository-url> .

# Install dependencies
npm ci --production

# Create production environment file
nano .env.production
```

**Production Environment Variables (.env.production)**:

```env
# Database
DATABASE_URL="postgresql://payroll_user:your_secure_password@localhost:5432/payroll_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Next.js
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_nextauth_secret
NODE_ENV=production
```

### 5. Build and Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build the application
npm run build

# Seed database (if needed)
npm run seed
```

### 6. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'payroll-app',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/payroll',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 'max',
      exec_mode: 'cluster',
      error_file: '/var/www/payroll/logs/pm2-error.log',
      out_file: '/var/www/payroll/logs/pm2-out.log',
      log_file: '/var/www/payroll/logs/pm2-combined.log',
      max_memory_restart: '1G',
      restart_delay: 4000,
    },
  ],
};
```

Start the application:

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 7. Nginx Configuration

Create `/etc/nginx/sites-available/payroll`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

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

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/payroll /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured, but verify)
sudo certbot renew --dry-run
```

### 9. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### 10. Monitoring and Maintenance

```bash
# PM2 monitoring
pm2 monit

# View application logs
pm2 logs payroll-app

# Check application status
pm2 status

# Restart application
pm2 restart payroll-app

# Update application
cd /var/www/payroll
git pull origin main
npm ci --production
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart payroll-app
```

## 📊 Code Quality & CI/CD

This project includes automated code quality checks:

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **GitHub Actions**: Automated CI/CD pipeline

### Pre-commit Hooks

Automatically run on every commit:

- ESLint fixes
- Prettier formatting
- Type checking

### GitHub Actions

Automated checks on pull requests:

- Code linting
- Format verification
- Build validation
- Type checking

## 📝 Project Structure

```
payroll/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility libraries and configurations
│   └── generated/           # Generated Prisma client
├── prisma/
│   ├── migrations/          # Database migrations
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Database seeding
├── docs/                    # Documentation
├── .github/workflows/       # GitHub Actions
└── logs/                    # Application logs
```

## 🔒 Security Considerations

- Environment variables are properly secured
- Authentication handled by Clerk
- Database connections use connection pooling
- HTTPS enforced in production
- Security headers configured in Nginx
- Input validation and sanitization
- Role-based access control

## 📚 API Documentation

The application provides RESTful APIs for:

- `/api/employees` - Employee management
- `/api/attendance` - Attendance tracking
- `/api/holidays` - Holiday management
- `/api/leave` - Leave applications
- `/api/regularization` - Attendance corrections
- `/api/configurations` - System configuration management
- `/api/sync-user` - User synchronization and employee linking

## ⚙️ Configuration Management

The application includes a comprehensive configuration management system that
allows administrators to manage system settings without code changes.

### Default Configurations

The system comes pre-seeded with these configurations:

| Configuration Key           | Default Value | Description                                   |
| --------------------------- | ------------- | --------------------------------------------- |
| `EMPLOYEE_ID_PREFIX`        | `TRINITS`     | Prefix used for generating employee IDs       |
| `SANCTIONED_LEAVE_PER_YEAR` | `24`          | Total sanctioned leaves per year per employee |
| `WORKING_HOURS_PER_DAY`     | `8`           | Standard working hours per day                |
| `OVERTIME_THRESHOLD`        | `8.5`         | Hours threshold for overtime calculation      |

### Admin Configuration Interface

Administrators can manage configurations through:

1. **Web Interface**: Navigate to `/admin/configurations`
   - Add new configurations
   - Edit existing configurations
   - Delete configurations
   - View configuration history

2. **API Endpoints**:
   ```bash
   GET    /api/configurations      # List all configurations
   POST   /api/configurations      # Create new configuration
   GET    /api/configurations/:id  # Get specific configuration
   PUT    /api/configurations/:id  # Update configuration
   DELETE /api/configurations/:id  # Delete configuration
   ```

### Using Configurations in Code

```typescript
import {
  getAppConfigurations,
  getConfigurationValue,
} from '@/lib/configurations';

// Get all configurations with type safety
const configs = await getAppConfigurations();
console.log(configs.EMPLOYEE_ID_PREFIX); // "TRINITS"
console.log(configs.SANCTIONED_LEAVE_PER_YEAR); // 24 (number)

// Get specific configuration value
const prefix = await getConfigurationValue('EMPLOYEE_ID_PREFIX');
console.log(prefix); // "TRINITS"
```

### Configuration Features

- **Type Safety**: Automatic type conversion for numbers and booleans
- **Caching**: Built-in 5-minute cache to reduce database queries
- **Fallback Values**: Default values when configurations are missing
- **Unique Keys**: Configuration keys are enforced to be unique
- **Admin Only**: Only administrators can modify configurations
- **Audit Trail**: Automatic created/updated timestamps

## 📅 Date Utilities

The application uses a centralized date utility system built with `date-fns` for
consistent date and time formatting. All date operations should use the
utilities from `/src/lib/dateUtils.ts`.

### Key Features

- **Timezone Safety**: Proper handling of timezone issues in attendance and
  regularization
- **Consistent Formatting**: Standardized date/time formats across the
  application
- **Business Logic**: Built-in functions for attendance calculations and working
  day checks
- **Type Safety**: Full TypeScript support with date-fns

### Quick Example

```typescript
import {
  formatDisplayDate,
  formatTime24,
  calculateHours,
  combineDateAndTime,
} from '@/lib/dateUtils';

// Format for display
const date = formatDisplayDate('2025-06-26'); // "Jun 26, 2025"
const time = formatTime24('2025-06-26T09:30:00'); // "09:30"

// Calculate working hours
const hours = calculateHours('09:00:00', '17:30:00'); // 8.5

// Combine for forms (timezone-safe)
const datetime = combineDateAndTime('2025-06-26', '09:30'); // "2025-06-26T09:30:00"
```

For detailed usage, see `/docs/date-utilities.md`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure code quality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the documentation in `/docs` folder
2. Review application logs
3. Check GitHub issues
4. Contact system administrator
