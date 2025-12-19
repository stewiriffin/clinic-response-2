#!/bin/bash

# MongoDB Backup Script
# Usage: ./scripts/backup-db.sh

set -e

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="clinic-queue-backup-$DATE"

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if MongoDB URI is set
if [ -z "$MONGODB_URI" ]; then
  echo "Error: MONGODB_URI not set in .env file"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup..."
echo "Backup name: $BACKUP_NAME"

# Run mongodump
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$BACKUP_NAME"

# Compress backup
echo "Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

echo "Backup completed successfully!"
echo "Backup location: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Optional: Upload to cloud storage (AWS S3 example)
# Uncomment and configure if needed
# aws s3 cp "$BACKUP_NAME.tar.gz" s3://your-bucket/backups/

# Optional: Clean up old backups (keep last 7 days)
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Done!"
