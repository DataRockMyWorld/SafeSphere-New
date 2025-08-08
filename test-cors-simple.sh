#!/bin/bash

# Simple CORS Test Script

echo "=== Testing CORS Configuration ==="

echo "1. Testing OPTIONS request with Vercel origin..."
curl -s -X OPTIONS \
  -H "Origin: https://safe-sphere-zeta.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://safespheres.info/api/v1/auth/login/ | head -20

echo ""
echo "2. Testing POST request with Vercel origin..."
curl -s -X POST \
  -H "Origin: https://safe-sphere-zeta.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  https://safespheres.info/api/v1/auth/login/ | head -10

echo ""
echo "3. Testing headers specifically..."
curl -I -H "Origin: https://safe-sphere-zeta.vercel.app" \
  https://safespheres.info/api/v1/auth/login/ 2>/dev/null | grep -i "access-control"

echo ""
echo "=== CORS Test Complete ==="
