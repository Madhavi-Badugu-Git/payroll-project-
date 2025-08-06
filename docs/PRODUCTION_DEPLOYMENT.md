# Production Deployment Guide

## 🚀 NextAuth Production Configuration

### **Critical Environment Variables**

Ensure these are set in your production environment:

```bash
# Required for NextAuth to work with basePath
NEXTAUTH_URL="https://trinitstechnologies.com/payroll"
NEXTAUTH_SECRET="your_production_secret_key_at_least_32_characters"

# Application Configuration
NEXT_PUBLIC_BASE_PATH="/payroll"
NODE_ENV="production"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/payroll"
```

### **Common Production Login Issues & Fixes**

#### ❌ **Issue**: `api/auth/providers` endpoint not found

**Cause**: NextAuth doesn't recognize the basePath in production **Solution**:

1. Set `NEXTAUTH_URL` to include the basePath: `https://yourdomain.com/payroll`
2. Ensure `basePath` is configured in `next.config.ts`
3. Add basePath to NextAuth config (already implemented)

#### ❌ **Issue**: Authentication callbacks fail

**Cause**: Incorrect redirect URLs **Solution**: Update all auth URLs to include
basePath:

- Sign in: `/payroll/auth/signin`
- Error: `/payroll/auth/error`
- API routes: `/payroll/api/auth/[...nextauth]`

#### ❌ **Issue**: Session not persisting

**Cause**: Secure cookie issues or domain mismatch **Solution**: Verify
NEXTAUTH_URL matches your actual domain

### **Deployment Checklist**

- [ ] **Environment Variables Set**
  - [ ] `NEXTAUTH_URL` with correct domain and basePath
  - [ ] `NEXTAUTH_SECRET` (32+ characters)
  - [ ] `DATABASE_URL` for production database
  - [ ] `NEXT_PUBLIC_BASE_PATH="/payroll"`

- [ ] **Database Setup**
  - [ ] Production database created
  - [ ] Migrations applied: `npx prisma migrate deploy`
  - [ ] Seed data populated: `npm run seed`

- [ ] **Build Verification**
  - [ ] `npm run build` succeeds
  - [ ] No TypeScript errors
  - [ ] Static generation complete

- [ ] **Authentication Testing**
  - [ ] Can access `/payroll/auth/signin`
  - [ ] Login flow works
  - [ ] Session persists across page reloads
  - [ ] Logout works correctly

### **Nginx Configuration (if applicable)**

```nginx
location /payroll/ {
    proxy_pass http://localhost:3000/payroll/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### **Troubleshooting Commands**

```bash
# Check NextAuth endpoints
curl https://yourdomain.com/payroll/api/auth/providers

# Verify build output
npm run build 2>&1 | grep -E "(error|Error|failed)"

# Check environment variables
printenv | grep -E "(NEXTAUTH|NEXT_PUBLIC)"

# Test database connection
npx prisma db push --preview-feature
```

### **Migration from Clerk to NextAuth**

If migrating from Clerk:

1. Remove all Clerk environment variables
2. Update `AuthProvider` component if needed
3. Test user sessions are cleared
4. Verify all auth flows work with NextAuth

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify all environment variables
3. Test authentication endpoints manually
4. Check server logs for detailed errors
