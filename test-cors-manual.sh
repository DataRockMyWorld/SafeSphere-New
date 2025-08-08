#!/bin/bash

# Manual CORS Test Script

echo "=== Manual CORS Testing ==="

echo "1. Testing without Origin header..."
curl -I https://safespheres.info/api/v1/auth/login/ 2>/dev/null | head -10

echo ""
echo "2. Testing with Origin header..."
curl -I -H "Origin: https://safe-sphere-zeta.vercel.app" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | head -10

echo ""
echo "3. Testing OPTIONS request..."
curl -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | head -5

echo ""
echo "4. Testing with different origin..."
curl -I -H "Origin: https://safespheres.info" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | head -10

echo ""
echo "5. Testing with localhost origin..."
curl -I -H "Origin: http://localhost:5173" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | head -10

echo ""
echo "=== Manual CORS Test Complete ==="
