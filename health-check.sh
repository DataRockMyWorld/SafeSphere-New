#!/bin/bash
if ! curl -f https://safespheres.info/api/v1/health/ > /dev/null 2>&1; then
    echo "App is down! Restarting services..."
    cd /opt/safesphere
    docker-compose -f docker-compose.ssl.yml restart
    # Send alert email/SMS
fi
