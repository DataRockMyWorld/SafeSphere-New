#!/bin/bash

# Debug Nginx Script
# This script helps debug Nginx configuration issues

echo "=== Debugging Nginx Configuration ==="

echo "1. Checking nginx configuration syntax..."
docker-compose -f docker-compose.ssl.yml exec nginx nginx -t

echo ""
echo "2. Checking nginx configuration file..."
docker-compose -f docker-compose.ssl.yml exec nginx cat /etc/nginx/nginx.conf | grep -A 5 -B 5 "CORS\|cors\|Access-Control"

echo ""
echo "3. Testing OPTIONS request with verbose output..."
curl -v -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Access-Control-Request-Method: POST" https://safespheres.info/api/v1/auth/login/ 2>&1 | head -30

echo ""
echo "4. Testing POST request..."
curl -v -X POST -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}' https://safespheres.info/api/v1/auth/login/ 2>&1 | head -20

echo ""
echo "5. Checking nginx logs..."
docker-compose -f docker-compose.ssl.yml logs --tail=10 nginx

echo ""
echo "=== Nginx Debug Complete ==="
