#!/bin/bash

# Comprehensive CORS Fix Script
# This script applies all necessary CORS settings

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

# Function to update CORS settings comprehensively
update_cors_settings() {
    print_status "Updating CORS settings comprehensively..."
    
    # Create a temporary file with the new CORS settings
    cat > /tmp/cors_settings.py << 'EOF'
# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://safe-sphere-zeta.vercel.app",
    "https://safespheres.info",
    "https://www.safespheres.info",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
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

CORS_EXPOSE_HEADERS = [
    'content-type',
    'content-disposition',
]

CSRF_TRUSTED_ORIGINS = [
    "https://safe-sphere-zeta.vercel.app",
    "https://safespheres.info",
    "https://www.safespheres.info",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
]
EOF

    # Replace the CORS settings section in settings.py
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
    "http://localhost:5176",\
    "http://127.0.0.1:5176",\
]\
\
CORS_ALLOW_CREDENTIALS = True\
\
CORS_ALLOW_ALL_ORIGINS = False\
\
CORS_ALLOW_METHODS = [\
    "DELETE",\
    "GET",\
    "OPTIONS",\
    "PATCH",\
    "POST",\
    "PUT",\
]\
\
CORS_ALLOW_HEADERS = [' backend/core/settings.py

    # Add CSRF_TRUSTED_ORIGINS if it doesn't exist
    if ! grep -q "CSRF_TRUSTED_ORIGINS" backend/core/settings.py; then
        sed -i '/^CORS_ALLOW_HEADERS = \[/,/^\]/a\
]\
\
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
    fi

    print_success "CORS settings updated comprehensively"
}

# Function to restart backend
restart_backend() {
    print_status "Restarting backend to apply CORS changes..."
    
    docker-compose -f docker-compose.ssl.yml restart backend
    
    # Wait for backend to start
    sleep 15
    
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
        
        # Show the actual response headers
        echo ""
        echo "Actual response headers:"
        curl -I -X OPTIONS -H "Origin: https://safe-sphere-zeta.vercel.app" -H "Access-Control-Request-Method: POST" https://safespheres.info/api/v1/auth/login/ 2>/dev/null
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  fix       - Apply comprehensive CORS fix"
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
