#!/bin/bash

# SafeSphere SSL Final Fix Script
# This script creates a working SSL setup by copying certificates and using proper paths

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

# Function to create working certificate files
create_working_certificates() {
    print_status "Creating working certificate files..."
    
    # Create directory for working certificates
    mkdir -p /opt/safesphere/ssl
    
    # Copy the actual certificate files (not symlinks)
    cp /etc/letsencrypt/archive/safespheres.info/fullchain1.pem /opt/safesphere/ssl/fullchain.pem
    cp /etc/letsencrypt/archive/safespheres.info/privkey1.pem /opt/safesphere/ssl/privkey.pem
    
    # Set proper permissions
    chmod 644 /opt/safesphere/ssl/fullchain.pem
    chmod 600 /opt/safesphere/ssl/privkey.pem
    chown root:root /opt/safesphere/ssl/fullchain.pem
    chown root:root /opt/safesphere/ssl/privkey.pem
    
    print_status "Working certificate files created"
}

# Function to update nginx configuration
update_nginx_config() {
    print_status "Updating nginx configuration..."
    
    # Create a new nginx config with local certificate paths
    cat > nginx/nginx-ssl.conf << 'EOF'
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

        # SSL configuration using local certificate files
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
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
        # All non-API routes should redirect to Vercel frontend
        location / {
            return 301 https://safe-sphere-zeta.vercel.app$request_uri;
        }
    }
}
EOF
    
    print_status "Nginx configuration updated"
}

# Function to update docker-compose
update_docker_compose() {
    print_status "Updating docker-compose configuration..."
    
    # Create a new docker-compose file with local SSL volume
    cat > docker-compose.ssl.yml << 'EOF'
version: '3.8'

services:
  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - /var/www/certbot:/var/www/certbot:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - safesphere_network

  # Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    env_file:
      - .env.prod
    volumes:
      - backend_static:/app/staticfiles
      - backend_media:/app/media
      - backend_logs:/app/logs
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - safesphere_network

  # Celery worker
  celery:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    command: ["/opt/venv/bin/celery", "-A", "core", "worker", "--loglevel=info"]
    volumes:
      - backend_media:/app/media
      - backend_logs:/app/logs
    env_file:
      - .env.prod
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - safesphere_network

  # Celery beat (scheduler)
  celery-beat:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    command: ["/opt/venv/bin/celery", "-A", "core", "beat", "--loglevel=info"]
    volumes:
      - backend_logs:/app/logs
    env_file:
      - .env.prod
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - safesphere_network

  # Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
    networks:
      - safesphere_network

volumes:
  redis_data:
  backend_static:
  backend_media:
  backend_logs:
  nginx_logs:

networks:
  safesphere_network:
    driver: bridge
EOF
    
    print_status "Docker-compose configuration updated"
}

# Function to restart services
restart_services() {
    print_status "Restarting services with new SSL configuration..."
    
    # Stop all services
    docker-compose -f docker-compose.prod.yml down
    
    # Start with new SSL configuration
    docker-compose -f docker-compose.ssl.yml up -d
    
    # Wait for nginx to start
    sleep 10
    
    print_status "Services restarted"
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
    docker-compose -f docker-compose.ssl.yml logs nginx --tail=10
}

# Function to verify certificate files
verify_certificates() {
    print_status "Verifying certificate files..."
    
    if [ -f "/etc/letsencrypt/archive/safespheres.info/fullchain1.pem" ]; then
        print_status "Certificate files exist"
    else
        print_error "Certificate files not found"
        exit 1
    fi
}

# Main script logic
main() {
    check_root
    verify_certificates
    create_working_certificates
    update_nginx_config
    update_docker_compose
    restart_services
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
