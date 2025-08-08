#!/bin/bash

# Simple Backend Test Script
# This script tests if the backend is working correctly

echo "=== Testing Backend Health ==="

# Test the correct health endpoint
echo "Testing /api/v1/health/ endpoint..."
curl -s https://safespheres.info/api/v1/health/ | jq . 2>/dev/null || curl -s https://safespheres.info/api/v1/health/

echo ""
echo "=== Testing Login Endpoint ==="

# Test the login endpoint (should return 405 for GET, which is correct)
echo "Testing /api/v1/auth/login/ endpoint..."
curl -I https://safespheres.info/api/v1/auth/login/ 2>/dev/null | head -5

echo ""
echo "=== Testing CORS Headers ==="

# Test CORS headers
echo "Testing CORS headers on login endpoint..."
curl -I -H "Origin: https://safe-sphere-zeta.vercel.app" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | grep -i "access-control"

echo ""
echo "=== Backend Test Complete ==="
