#!/bin/bash

# SafeSphere SSL Setup Script
# This script sets up Let's Encrypt SSL certificates for safespheres.info

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="safespheres.info"
EMAIL="admin@safespheres.info"  # Change this to your email

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

# Function to check if domain is pointing to this server
check_domain() {
    print_status "Checking if domain $DOMAIN is pointing to this server..."
    
    # Get server's public IP
    SERVER_IP=$(curl -s ifconfig.me)
    
    # Get domain's IP
    DOMAIN_IP=$(dig +short $DOMAIN | head -1)
    
    if [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
        print_status "Domain $DOMAIN is correctly pointing to this server"
    else
        print_warning "Domain $DOMAIN is not pointing to this server"
        print_warning "Server IP: $SERVER_IP"
        print_warning "Domain IP: $DOMAIN_IP"
        print_warning "Please update your DNS records and try again"
        exit 1
    fi
}

# Function to install certbot
install_certbot() {
    print_status "Installing Certbot..."
    
    # Update package list
    apt update
    
    # Install certbot and nginx plugin
    apt install -y certbot python3-certbot-nginx
    
    print_status "Certbot installed successfully"
}

# Function to obtain SSL certificates
obtain_certificates() {
    print_status "Obtaining SSL certificates for $DOMAIN and www.$DOMAIN..."
    
    # Stop nginx temporarily
    docker-compose -f docker-compose.prod.yml stop nginx
    
    # Obtain certificates
    certbot certonly --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    print_status "SSL certificates obtained successfully"
}

# Function to set up auto-renewal
setup_renewal() {
    print_status "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /etc/cron.daily/certbot-renew << 'EOF'
#!/bin/bash
certbot renew --quiet --post-hook "docker-compose -f /path/to/your/project/docker-compose.prod.yml restart nginx"
EOF
    
    chmod +x /etc/cron.daily/certbot-renew
    
    print_status "Auto-renewal configured"
}

# Function to update nginx configuration
update_nginx_config() {
    print_status "Updating nginx configuration..."
    
    # Create a temporary nginx config for certbot
    cat > nginx/nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Upstream for backend
    upstream backend {
        server backend:8000;
    }

    # HTTP server for Let's Encrypt
    server {
        listen 80;
        server_name safespheres.info www.safespheres.info;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$host$request_uri;
        }
    }
}
EOF
    
    print_status "Nginx configuration updated"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    
    # Start nginx with new configuration
    docker-compose -f docker-compose.prod.yml up -d nginx
    
    print_status "Services restarted successfully"
}

# Function to test SSL
test_ssl() {
    print_status "Testing SSL configuration..."
    
    # Wait a moment for nginx to start
    sleep 5
    
    # Test HTTPS
    if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
        print_status "SSL is working correctly"
    else
        print_error "SSL test failed"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Complete SSL setup (install, obtain certificates, configure)"
    echo "  install   - Install Certbot"
    echo "  obtain    - Obtain SSL certificates"
    echo "  renew     - Renew SSL certificates"
    echo "  test      - Test SSL configuration"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 renew"
}

# Main script logic
case "$1" in
    setup)
        check_root
        check_domain
        install_certbot
        update_nginx_config
        obtain_certificates
        setup_renewal
        restart_services
        test_ssl
        print_status "SSL setup completed successfully!"
        print_status "Your site is now available at https://$DOMAIN"
        ;;
    install)
        check_root
        install_certbot
        ;;
    obtain)
        check_root
        obtain_certificates
        ;;
    renew)
        check_root
        certbot renew
        docker-compose -f docker-compose.prod.yml restart nginx
        ;;
    test)
        test_ssl
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
