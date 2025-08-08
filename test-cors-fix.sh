#!/bin/bash

# Test CORS Fix Script
# This script tests if the CORS fix is working

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Test backend health
print_status "Testing backend health..."
if curl -f http://localhost:8000/api/v1/health/ > /dev/null 2>&1; then
    print_success "Backend health check passed"
else
    print_error "Backend health check failed"
fi

# Test API endpoint
print_status "Testing API endpoint..."
if curl -f https://safespheres.info/api/v1/health/ > /dev/null 2>&1; then
    print_success "API endpoint accessible"
else
    print_error "API endpoint not accessible"
fi

# Test CORS headers
print_status "Testing CORS headers..."
CORS_HEADERS=$(curl -I https://safespheres.info/api/v1/auth/login/ 2>/dev/null | grep -i "access-control-allow-origin" || echo "No CORS headers found")

if echo "$CORS_HEADERS" | grep -q "safe-sphere-zeta.vercel.app"; then
    print_success "CORS headers include Vercel frontend"
else
    print_error "CORS headers missing Vercel frontend"
    echo "Found headers: $CORS_HEADERS"
fi

print_status "CORS test completed"
