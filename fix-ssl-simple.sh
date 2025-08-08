#!/bin/bash

# SafeSphere SSL Fix Script (Simplified)
# This script fixes SSL certificate permissions and restarts nginx

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

# Function to fix certificate permissions
fix_certificate_permissions() {
    print_status "Fixing certificate permissions..."
    
    # Set proper permissions for certificate files
    chmod 644 /etc/letsencrypt/live/safespheres.info/fullchain.pem
    chmod 600 /etc/letsencrypt/live/safespheres.info/privkey.pem
    chmod 644 /etc/letsencrypt/live/safespheres.info/cert.pem
    chmod 644 /etc/letsencrypt/live/safespheres.info/chain.pem
    
    # Set proper ownership
    chown -R root:root /etc/letsencrypt/live/safespheres.info/
    
    # Make sure the directory is readable by nginx
    chmod 755 /etc/letsencrypt/live/safespheres.info/
    
    print_status "Certificate permissions fixed"
}

# Function to restart nginx
restart_nginx() {
    print_status "Restarting nginx container..."
    
    # Stop nginx
    docker-compose -f docker-compose.prod.yml stop nginx
    
    # Start nginx
    docker-compose -f docker-compose.prod.yml up -d nginx
    
    # Wait for nginx to start
    sleep 10
    
    print_status "Nginx restarted"
}

# Function to test SSL
test_ssl() {
    print_status "Testing SSL configuration..."
    
    # Wait a moment for nginx to start
    sleep 5
    
    # Test HTTPS
    if curl -f https://safespheres.info/health > /dev/null 2>&1; then
        print_status "SSL is working correctly"
        return 0
    else
        print_error "SSL test failed"
        return 1
    fi
}

# Function to check nginx logs
check_nginx_logs() {
    print_status "Checking nginx logs..."
    docker-compose -f docker-compose.prod.yml logs nginx --tail=10
}

# Function to verify certificate files
verify_certificates() {
    print_status "Verifying certificate files..."
    
    if [ -f "/etc/letsencrypt/live/safespheres.info/fullchain.pem" ]; then
        print_status "Certificate files exist"
    else
        print_error "Certificate files not found"
        exit 1
    fi
}

# Function to check nginx status
check_nginx_status() {
    print_status "Checking nginx container status..."
    docker-compose -f docker-compose.prod.yml ps nginx
}

# Main script logic
main() {
    check_root
    verify_certificates
    fix_certificate_permissions
    restart_nginx
    check_nginx_status
    check_nginx_logs
    
    if test_ssl; then
        print_status "SSL setup completed successfully!"
        print_status "Your site is now available at https://safespheres.info"
    else
        print_error "SSL setup failed. Check nginx logs for details."
        check_nginx_logs
        exit 1
    fi
}

# Run main function
main
