#!/bin/bash

# MongoDB Restore Script
# Usage: ./scripts/restore-db.sh <backup-file.tar.gz>

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore-db.sh <backup-file.tar.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' not found"
  exit 1
fi

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check if MongoDB URI is set
if [ -z "$MONGODB_URI" ]; then
  echo "Error: MONGODB_URI not set in .env file"
  exit 1
fi

echo "WARNING: This will restore the database from backup."
echo "Current data will be overwritten!"
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "Restore cancelled."
  exit 0
fi

# Extract backup
echo "Extracting backup..."
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Find the backup directory
BACKUP_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d -name "clinic-queue-backup-*" | head -n 1)

if [ -z "$BACKUP_DIR" ]; then
  echo "Error: Could not find backup directory in archive"
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Restore database
echo "Restoring database..."
mongorestore --uri="$MONGODB_URI" --drop "$BACKUP_DIR"

# Cleanup
rm -rf "$TEMP_DIR"

echo "Database restored successfully!"
