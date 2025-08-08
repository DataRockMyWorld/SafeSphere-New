#!/bin/bash

# Final CORS Fix Script
# This script ensures CORS is properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to backup current settings
backup_settings() {
    print_status "Backing up current settings..."
    
    if [ -f "backend/core/settings.py" ]; then
        cp backend/core/settings.py backend/core/settings.py.backup.$(date +%Y%m%d_%H%M%S)
        print_success "Settings backed up"
    else
        print_warning "Settings file not found"
    fi
}

# Function to update CORS settings
update_cors_settings() {
    print_status "Updating CORS settings..."
    
    # Update CORS_ALLOWED_ORIGINS
    sed -i '/^CORS_ALLOWED_ORIGINS = \[/,/^\]/c\
CORS_ALLOWED_ORIGINS = [\
    "https://safe-sphere-zeta.vercel.app",\
    "https://safespheres.info",\
    "https://www.safespheres.info",\
    "http://localhost:5173",\
    "http://127.0.0.1:5173",\
    "http://localhost:3000",\
    "http://127.0.0.1:3000",\
    "http://localhost:5176",\
    "http://127.0.0.1:5176",\
]' backend/core/settings.py
    
    # Update CSRF_TRUSTED_ORIGINS
    sed -i '/^CSRF_TRUSTED_ORIGINS = \[/,/^\]/c\
CSRF_TRUSTED_ORIGINS = [\
    "https://safe-sphere-zeta.vercel.app",\
    "https://safespheres.info",\
    "https://www.safespheres.info",\
    "http://localhost:5173",\
    "http://127.0.0.1:5173",\
    "http://localhost:3000",\
    "http://127.0.0.1:3000",\
    "http://localhost:5176",\
    "http://127.0.0.1:5176",\
]' backend/core/settings.py
    
    print_success "CORS settings updated"
}

# Function to restart backend
restart_backend() {
    print_status "Restarting backend to apply CORS changes..."
    
    docker-compose -f docker-compose.ssl.yml restart backend
    
    # Wait for backend to start
    sleep 10
    
    print_success "Backend restarted"
}

# Function to test CORS
test_cors() {
    print_status "Testing CORS configuration..."
    
    # Test OPTIONS request
    echo "Testing OPTIONS request..."
    CORS_RESPONSE=$(curl -s -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Access-Control-Request-Method: POST" https://safespheres.info/api/v1/auth/login/ 2>/dev/null)
    
    if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        print_success "CORS headers found in response"
        echo "Response: $CORS_RESPONSE"
    else
        print_error "CORS headers missing from response"
        echo "Response: $CORS_RESPONSE"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  fix       - Apply CORS fix"
    echo "  test      - Test CORS configuration"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 fix"
    echo "  $0 test"
}

# Main script logic
case "$1" in
    fix)
        check_root
        backup_settings
        update_cors_settings
        restart_backend
        test_cors
        ;;
    test)
        check_root
        test_cors
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
