#!/bin/bash

# SafeSphere CORS Fix Script
# This script fixes CORS settings to allow Vercel frontend to connect

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

# Function to check if docker-compose is running
check_services() {
    print_status "Checking if services are running..."
    
    if docker-compose -f docker-compose.ssl.yml ps | grep -q "Up"; then
        print_status "Services are running"
    else
        print_error "Services are not running. Please start them first:"
        print_error "docker-compose -f docker-compose.ssl.yml up -d"
        exit 1
    fi
}

# Function to update environment file
update_env_file() {
    print_status "Updating environment file with Vercel CORS settings..."
    
    # Check if .env.prod exists
    if [ ! -f .env.prod ]; then
        print_error ".env.prod file not found. Please create it first."
        exit 1
    fi
    
    # Update CORS settings in .env.prod
    sed -i 's|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://safe-sphere-zeta.vercel.app,https://safespheres.info,https://www.safespheres.info,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000|' .env.prod
    
    # Update CSRF settings
    sed -i 's|CSRF_TRUSTED_ORIGINS=.*|CSRF_TRUSTED_ORIGINS=https://safe-sphere-zeta.vercel.app,https://safespheres.info,https://www.safespheres.info,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000|' .env.prod
    
    # Update ALLOWED_HOSTS
    sed -i 's|ALLOWED_HOSTS=.*|ALLOWED_HOSTS=safespheres.info,www.safespheres.info,64.226.70.172,localhost,127.0.0.1|' .env.prod
    
    # Update FRONTEND_URL
    sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://safe-sphere-zeta.vercel.app|' .env.prod
    
    print_status "Environment file updated"
}

# Function to create Django settings override
create_settings_override() {
    print_status "Creating Django settings override for CORS..."
    
    # Create a settings override file
    cat > backend/core/settings_override.py << 'EOF'
# CORS settings override for production
CORS_ALLOWED_ORIGINS = [
    'https://safe-sphere-zeta.vercel.app',
    'https://safespheres.info',
    'https://www.safespheres.info',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

CSRF_TRUSTED_ORIGINS = [
    'https://safe-sphere-zeta.vercel.app',
    'https://safespheres.info',
    'https://www.safespheres.info',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

# Additional CORS settings
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
EOF

    print_status "Django settings override created"
}

# Function to update main settings file
update_main_settings() {
    print_status "Updating main Django settings..."
    
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
    
    print_status "Main Django settings updated"
}

# Function to restart services
restart_services() {
    print_status "Restarting services with new CORS settings..."
    
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
        check_services
        update_env_file
        update_main_settings
        restart_services
        test_cors
        print_status "CORS settings fixed successfully!"
        print_status "Your Vercel frontend should now be able to connect to the backend."
        ;;
    test)
        check_root
        check_services
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
