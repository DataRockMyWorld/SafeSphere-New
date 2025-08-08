#!/bin/bash

# Simple Nginx CORS Fix Script
# This script adds CORS headers directly to the existing nginx.conf

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

# Function to create a simple CORS-enabled nginx config
create_simple_cors_nginx() {
    print_status "Creating simple CORS-enabled nginx configuration..."
    
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Upstream for backend
    upstream backend {
        server backend:8000;
    }

    # HTTP server (redirect to HTTPS)
    server {
        listen 80;
        server_name safespheres.info www.safespheres.info;
        
        # Let's Encrypt challenge location
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl;
        http2 on;
        server_name safespheres.info www.safespheres.info;

        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/safespheres.info/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/safespheres.info/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # CORS headers for all requests
        add_header Access-Control-Allow-Origin "https://safe-sphere-zeta.vercel.app" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;

        # Handle OPTIONS requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://safe-sphere-zeta.vercel.app" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Access-Control-Max-Age "1728000" always;
            add_header Content-Type "text/plain; charset=utf-8" always;
            add_header Content-Length "0" always;
            return 204;
        }

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            proxy_set_header X-Forwarded-Port $server_port;
            
            # CORS headers for API
            add_header Access-Control-Allow-Origin "https://safe-sphere-zeta.vercel.app" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
            add_header Access-Control-Allow-Credentials "true" always;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Admin interface
        location /admin/ {
            limit_req zone=api burst=10 nodelay;
            
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files (Django)
        location /static/ {
            proxy_pass http://backend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Media files (Django)
        location /media/ {
            proxy_pass http://backend;
            expires 1y;
            add_header Cache-Control "public";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Frontend is hosted on Vercel
        location / {
            return 301 https://safe-sphere-zeta.vercel.app$request_uri;
        }
    }
}
EOF

    print_success "Simple CORS-enabled nginx configuration created"
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
    echo "  fix       - Apply simple CORS fix"
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
        create_simple_cors_nginx
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
