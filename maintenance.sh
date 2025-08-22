#!/bin/bash
echo "Running weekly maintenance..."

# Update system packages
apt update && apt upgrade -y

# Clean up Docker
docker system prune -f

# Check disk space
df -h

# Restart services weekly to prevent issues
cd /opt/safesphere
docker-compose -f docker-compose.ssl.yml restart

echo "Maintenance complete!"
