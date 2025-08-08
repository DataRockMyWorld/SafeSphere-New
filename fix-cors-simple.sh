#!/bin/bash

# SafeSphere CORS Fix Script (Simple)
# Run this on your DigitalOcean droplet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Function to update Django settings
update_django_settings() {
    print_status "Updating Django CORS settings..."
    
    # Create a backup
    cp backend/core/settings.py backend/core/settings.py.backup
    
    # Update the CORS settings in the main settings file
    sed -i '/^# CORS settings$/,/^CORS_ALLOW_HEADERS = \[/c\
# CORS settings\
CORS_ALLOWED_ORIGINS = [\
    "https://safe-sphere-zeta.vercel.app",\
    "https://safespheres.info",\
    "https://www.safespheres.info",\
    "http://localhost:5173",\
    "http://127.0.0.1:5173",\
    "http://localhost:3000",\
    "http://127.0.0.1:3000",\
]\
CORS_ALLOW_CREDENTIALS = True\
CSRF_TRUSTED_ORIGINS = [\
    "https://safe-sphere-zeta.vercel.app",\
    "https://safespheres.info",\
    "https://www.safespheres.info",\
    "http://localhost:5173",\
    "http://127.0.0.1:5173",\
    "http://localhost:3000",\
    "http://127.0.0.1:3000",\
]\
CORS_ALLOW_METHODS = [\
    "DELETE",\
    "GET",\
    "OPTIONS",\
    "PATCH",\
    "POST",\
    "PUT",\
]\
CORS_ALLOW_HEADERS = [' backend/core/settings.py
    
    print_status "Django CORS settings updated"
}

# Function to update environment file
update_env_file() {
    print_status "Updating environment file..."
    
    if [ -f .env.prod ]; then
        # Update CORS settings in .env.prod
        sed -i 's|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://safe-sphere-zeta.vercel.app,https://safespheres.info,https://www.safespheres.info,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000|' .env.prod
        
        # Update CSRF settings
        sed -i 's|CSRF_TRUSTED_ORIGINS=.*|CSRF_TRUSTED_ORIGINS=https://safe-sphere-zeta.vercel.app,https://safespheres.info,https://www.safespheres.info,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000|' .env.prod
        
        print_status "Environment file updated"
    else
        print_warning ".env.prod file not found"
    fi
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    
    # Restart backend to apply new settings
    docker-compose -f docker-compose.ssl.yml restart backend
    
    # Wait for backend to start
    sleep 10
    
    print_status "Services restarted"
}

# Function to test CORS
test_cors() {
    print_status "Testing CORS configuration..."
    
    # Test if the API is accessible
    if curl -f https://safespheres.info/api/v1/auth/login/ > /dev/null 2>&1; then
        print_status "API is accessible"
    else
        print_error "API is not accessible"
        return 1
    fi
    
    # Test CORS headers
    cors_headers=$(curl -I -H "Origin: https://safe-sphere-zeta.vercel.app" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | grep -i "access-control-allow-origin" || echo "")
    
    if [ -n "$cors_headers" ]; then
        print_status "CORS headers are present"
        echo "CORS Headers: $cors_headers"
    else
        print_warning "CORS headers not found. This might be normal for OPTIONS requests."
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  fix        - Fix CORS settings for Vercel frontend"
    echo "  test       - Test CORS configuration"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 fix"
    echo "  $0 test"
}

# Main script logic
case "$1" in
    fix)
        check_root
        update_django_settings
        update_env_file
        restart_services
        test_cors
        print_status "CORS settings fixed successfully!"
        print_status "Your Vercel frontend should now be able to connect to the backend."
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
