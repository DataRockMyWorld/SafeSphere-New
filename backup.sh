#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Backup Docker volumes
docker run --rm -v safesphere_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_$DATE.tar.gz -C /data .
docker run --rm -v safesphere_nginx_logs:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/nginx_$DATE.tar.gz -C /data .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
