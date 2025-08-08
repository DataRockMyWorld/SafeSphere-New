#!/bin/bash

# Check Nginx Syntax Script
# This script checks if there are any syntax errors in the Nginx configuration

echo "=== Checking Nginx Configuration ==="

echo "1. Checking nginx-ssl.conf syntax..."
if docker-compose -f docker-compose.ssl.yml exec nginx nginx -t 2>&1; then
    echo "✅ Nginx syntax is OK"
else
    echo "❌ Nginx syntax error found"
fi

echo ""
echo "2. Checking nginx container status..."
docker-compose -f docker-compose.ssl.yml ps nginx

echo ""
echo "3. Checking nginx logs..."
docker-compose -f docker-compose.ssl.yml logs --tail=10 nginx

echo ""
echo "4. Checking if nginx config file exists in container..."
docker-compose -f docker-compose.ssl.yml exec nginx ls -la /etc/nginx/nginx.conf

echo ""
echo "5. Checking nginx config content..."
docker-compose -f docker-compose.ssl.yml exec nginx cat /etc/nginx/nginx.conf | grep -A 5 -B 5 "CORS\|cors\|Access-Control" || echo "No CORS configuration found"

echo ""
echo "6. Testing basic connectivity..."
curl -I https://safespheres.info/ 2>/dev/null || echo "Server not responding"

echo ""
echo "=== Nginx Check Complete ==="
