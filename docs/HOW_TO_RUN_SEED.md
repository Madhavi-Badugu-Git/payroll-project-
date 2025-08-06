# How to Run the Seed File

## Quick Commands

### 1. **Recommended Method (tsx)**

```bash
npx tsx prisma/seed.ts
```

### 2. **Using npm script**

```bash
npm run seed
```

### 3. **Using Prisma's official seed command**

```bash
npx prisma db seed
```

### 4. **Using ts-node (alternative)**

```bash
npx ts-node prisma/seed.ts
```

## When to Run the Seed File

### First Time Setup

- After cloning the repository
- After setting up the database
- When you need initial data

### Development

- When you need to reset your database with fresh data
- After making changes to the seed file
- When testing with clean data

### Production Setup

- During initial deployment
- When setting up a new environment

## What Gets Seeded

✅ **Roles** (user, employee, manager, admin) ✅ **Super User**
(admin@trinitstechnologies.com) ✅ **Company Holidays** (2025 calendar) ✅
**System Configurations** (employee prefix, leave quota, etc.)

## Important Notes

### Safe to Run Multiple Times

The seed script is **idempotent** - it can be run multiple times safely:

- Won't create duplicate data
- Skips existing records
- Shows what was created vs. skipped

### Super User Credentials

- **Email**: `admin@trinitstechnologies.com`
- **Password**: `Admin123#!@#` (as seen in the code)
- **Role**: Admin (full system access)

### Reset Database (if needed)

If you want to completely reset and re-seed:

```bash
# Reset database (WARNING: This deletes all data!)
npx prisma db push --force-reset

# Re-run migrations
npx prisma db push

# Seed the database
npm run seed
```

## Troubleshooting

### If tsx is not found:

```bash
npm install -g tsx
# or use npx (recommended)
npx tsx prisma/seed.ts
```

### If TypeScript errors occur:

```bash
# Make sure Prisma client is generated
npx prisma generate

# Check if all dependencies are installed
npm install
```

### Environment Variables

Make sure your `.env` or `.env.local` file has:

```env
DATABASE_URL="your_database_connection_string"
```

## Output Example

When successful, you'll see:

```
Start seeding ...
🔐 Seeding roles...
✅ Created role: admin with id: abc123
👤 Seeding super user...
✅ Created super user: admin@trinitstechnologies.com
🎉 Seeding holidays...
✅ Created holiday 'New Year' for date 2025-01-01
⚙️ Seeding configurations...
✅ Created configuration 'EMPLOYEE_ID_PREFIX'
Seeding finished.
```
