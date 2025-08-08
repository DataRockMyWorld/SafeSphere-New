#!/bin/bash

# Debug Nginx CORS Script
# This script helps debug Nginx CORS configuration issues

echo "=== Debugging Nginx CORS Configuration ==="

echo "1. Checking nginx configuration syntax..."
docker-compose -f docker-compose.ssl.yml exec nginx nginx -t 2>&1 || echo "Nginx syntax check failed"

echo ""
echo "2. Checking current nginx configuration file..."
docker-compose -f docker-compose.ssl.yml exec nginx cat /etc/nginx/nginx.conf | grep -A 10 -B 5 "CORS\|cors\|Access-Control" || echo "No CORS configuration found"

echo ""
echo "3. Checking if nginx is using the correct config file..."
docker-compose -f docker-compose.ssl.yml exec nginx ls -la /etc/nginx/nginx.conf

echo ""
echo "4. Testing OPTIONS request with verbose output..."
curl -v -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Access-Control-Request-Method: POST" https://safespheres.info/api/v1/auth/login/ 2>&1 | head -40

echo ""
echo "5. Testing POST request..."
curl -v -X POST -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}' https://safespheres.info/api/v1/auth/login/ 2>&1 | head -30

echo ""
echo "6. Checking nginx logs for errors..."
docker-compose -f docker-compose.ssl.yml logs --tail=20 nginx

echo ""
echo "7. Checking if the nginx config file was updated..."
echo "Local nginx.conf file:"
head -20 nginx/nginx.conf

echo ""
echo "8. Testing with a different origin to see if CORS works at all..."
curl -I -H "Origin: http://localhost:5173" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | grep -i "access-control" || echo "No CORS headers found for localhost either"

echo ""
echo "=== Nginx CORS Debug Complete ==="
