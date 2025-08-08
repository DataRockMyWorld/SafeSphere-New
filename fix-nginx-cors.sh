#!/bin/bash

# Nginx CORS Fix Script
# This script applies CORS headers to Nginx configuration

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

# Function to backup current nginx config
backup_nginx() {
    print_status "Backing up current nginx configuration..."
    
    if [ -f "nginx/nginx.conf" ]; then
        cp nginx/nginx.conf nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
        print_success "Nginx config backed up"
    else
        print_warning "Nginx config file not found"
    fi
}

# Function to apply nginx CORS fix
apply_nginx_cors() {
    print_status "Applying Nginx CORS configuration..."
    
    # Copy the new nginx config
    cp nginx/nginx-cors.conf nginx/nginx.conf
    
    print_success "Nginx CORS configuration applied"
}

# Function to restart nginx
restart_nginx() {
    print_status "Restarting nginx to apply CORS changes..."
    
    docker-compose -f docker-compose.ssl.yml restart nginx
    
    # Wait for nginx to start
    sleep 5
    
    print_success "Nginx restarted"
}

# Function to test CORS
test_cors() {
    print_status "Testing CORS configuration..."
    
    # Test OPTIONS request
    echo "Testing OPTIONS request..."
    CORS_RESPONSE=$(curl -s -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Access-Control-Request-Method: POST" https://safespheres.info/api/v1/auth/login/ 2>/dev/null)
    
    if curl -I -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Access-Control-Request-Method: POST" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | grep -q "Access-Control-Allow-Origin"; then
        print_success "CORS headers found in response"
        echo "Response headers:"
        curl -I -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Access-Control-Request-Method: POST" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | grep -i "access-control"
    else
        print_error "CORS headers missing from response"
        echo "Response headers:"
        curl -I -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Access-Control-Request-Method: POST" https://safespheres.info/api/v1/auth/login/ 2>/dev/null
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  fix       - Apply Nginx CORS fix"
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
        backup_nginx
        apply_nginx_cors
        restart_nginx
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
