#!/bin/bash

# Simple CORS Fix Script
# This script updates the Django settings to allow Vercel frontend

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

# Function to backup settings
backup_settings() {
    print_status "Backing up current settings..."
    cp backend/core/settings.py backend/core/settings.py.backup
    print_status "Settings backed up"
}

# Function to update CORS settings
update_cors_settings() {
    print_status "Updating CORS settings..."
    
    # Create a temporary file with updated CORS settings
    cat > backend/core/settings_temp.py << 'EOF'
# CORS settings
CORS_ALLOWED_ORIGINS = [
    'https://safe-sphere-zeta.vercel.app',
    'https://safespheres.info',
    'https://www.safespheres.info',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5176',
    'http://127.0.0.1:5176',
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    'https://safe-sphere-zeta.vercel.app',
    'https://safespheres.info',
    'https://www.safespheres.info',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5176',
    'http://127.0.0.1:5176',
]
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
EOF

    # Replace the CORS section in the main settings file
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
CORS_ALLOW_CREDENTIALS = True\
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

    # Clean up
    rm backend/core/settings_temp.py
    
    print_status "CORS settings updated"
}

# Function to restart backend
restart_backend() {
    print_status "Restarting backend to apply CORS changes..."
    
    # If you're using docker-compose
    if command -v docker-compose &> /dev/null; then
        docker-compose -f docker-compose.ssl.yml restart backend
        print_status "Backend restarted via docker-compose"
    else
        print_warning "docker-compose not found. Please restart your backend manually."
        print_warning "You can restart it with: docker-compose -f docker-compose.ssl.yml restart backend"
    fi
}

# Function to test CORS
test_cors() {
    print_status "Testing CORS configuration..."
    
    # Wait a moment for backend to start
    sleep 5
    
    # Test CORS headers
    echo "Testing CORS headers..."
    curl -I -H "Origin: https://safe-sphere-zeta.vercel.app" https://safespheres.info/api/v1/auth/login/ 2>/dev/null | grep -i "access-control-allow-origin" || echo "CORS headers not found in response"
    
    print_status "CORS test completed"
}

# Main script
main() {
    print_status "Starting CORS fix..."
    backup_settings
    update_cors_settings
    restart_backend
    test_cors
    print_status "CORS fix completed!"
    print_status "Your Vercel frontend should now be able to connect to the backend."
}

# Run main function
main
