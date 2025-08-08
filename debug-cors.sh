#!/bin/bash

# Debug CORS Script
# This script helps debug CORS issues

echo "=== Debugging CORS Configuration ==="

echo "1. Testing basic OPTIONS request..."
curl -v -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" https://safespheres.info/api/v1/auth/login/ 2>&1 | grep -E "(Access-Control|access-control)" || echo "No CORS headers found"

echo ""
echo "2. Testing with all CORS headers..."
curl -v -X OPTIONS \
  -H "Origin: https://safe-sphere-zeta.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  https://safespheres.info/api/v1/auth/login/ 2>&1 | grep -E "(Access-Control|access-control)" || echo "No CORS headers found"

echo ""
echo "3. Testing POST request..."
curl -v -X POST \
  -H "Origin: https://safe-sphere-zeta.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  https://safespheres.info/api/v1/auth/login/ 2>&1 | grep -E "(Access-Control|access-control)" || echo "No CORS headers found"

echo ""
echo "4. Testing health endpoint..."
curl -v -H "Origin: https://safe-sphere-zeta.vercel.app" https://safespheres.info/api/v1/health/ 2>&1 | grep -E "(Access-Control|access-control)" || echo "No CORS headers found"

echo ""
echo "=== CORS Debug Complete ==="
