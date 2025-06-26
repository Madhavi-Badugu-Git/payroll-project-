#!/bin/bash
# Database Backup Script for Trinits Payroll System

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="payroll_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=7

# Database connection details
DB_NAME="payroll_prod"
DB_USER="${POSTGRES_USER}"
DB_HOST="${POSTGRES_HOST:-postgres}"

echo "Starting backup at $(date)"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
echo "Creating database backup..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h $DB_HOST \
    -U $DB_USER \
    -d $DB_NAME \
    --no-password \
    --verbose \
    --create \
    --clean \
    --format=plain \
    > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Verify backup exists and has content
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ] && [ -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "Backup created successfully: $BACKUP_FILE"
    echo "Backup size: $(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)"
else
    echo "ERROR: Backup failed or is empty!"
    exit 1
fi

# Clean up old backups (keep only last 7 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "payroll_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# List current backups
echo "Current backups:"
ls -lah $BACKUP_DIR/payroll_backup_*.sql.gz

echo "Backup completed at $(date)"

# Optional: Upload to cloud storage (uncomment and configure as needed)
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://trinits-backups/payroll/"
