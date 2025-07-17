# Scripts

This folder contains utility scripts, database setup scripts, and development
tools.

## Database & Setup Scripts

- `seed-holidays.js` - Seeds holidays data into the database
- `setup-roles-and-user.mjs` - Sets up default roles and test user
- `seed-roles.mjs` - Seeds role data
- `migrate-database.mjs` - Database migration script

## User & Employee Management Scripts

- `create-admin.mjs` - Creates admin user
- `create-sample-employee.mjs` - Creates sample employee data
- `check-user*.mjs` - User verification scripts
- `verify-db*.mjs` - Database verification scripts

## Development & Debug Scripts

- `debug-*.js` - Debug utilities
- `fix-*.mjs` - Code fixing utilities
- `update-console-to-logger.mjs` - Logging updates

## Deployment Scripts

- `deploy.sh` - Production deployment
- `backup.sh` - Database backup
- `setup-server.sh` - Server setup

## Usage

Most scripts can be run with Node.js:

```bash
node scripts/[script-name]
```

For shell scripts:

```bash
./scripts/[script-name].sh
```
