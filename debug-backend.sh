#!/bin/bash

# SafeSphere Backend Debug Script
# This script helps debug backend issues

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

# Function to check container status
check_container_status() {
    print_status "Checking container status..."
    
    echo "=== Container Status ==="
    docker-compose -f docker-compose.ssl.yml ps
    
    echo ""
    echo "=== Backend Container Details ==="
    docker-compose -f docker-compose.ssl.yml ps backend
}

# Function to check backend logs
check_backend_logs() {
    print_status "Checking backend logs..."
    
    echo "=== Backend Logs (Last 50 lines) ==="
    docker-compose -f docker-compose.ssl.yml logs --tail=50 backend
}

# Function to check if backend is responding
test_backend_health() {
    print_status "Testing backend health..."
    
    # Test if backend container is running
    if docker-compose -f docker-compose.ssl.yml ps backend | grep -q "Up"; then
        print_status "Backend container is running"
    else
        print_error "Backend container is not running"
        return 1
    fi
    
    # Test if backend is responding on port 8000
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_status "Backend is responding on port 8000"
    else
        print_error "Backend is not responding on port 8000"
    fi
    
    # Test if nginx is responding
    if curl -f https://safespheres.info/health > /dev/null 2>&1; then
        print_status "Nginx is responding"
    else
        print_error "Nginx is not responding"
    fi
}

# Function to check nginx logs
check_nginx_logs() {
    print_status "Checking nginx logs..."
    
    echo "=== Nginx Logs (Last 30 lines) ==="
    docker-compose -f docker-compose.ssl.yml logs --tail=30 nginx
}

# Function to check network connectivity
check_network() {
    print_status "Checking network connectivity..."
    
    echo "=== Testing local connections ==="
    curl -I http://localhost:8000/health 2>/dev/null || echo "Backend not accessible locally"
    
    echo "=== Testing domain connection ==="
    curl -I https://safespheres.info/health 2>/dev/null || echo "Domain not accessible"
    
    echo "=== Testing API endpoint ==="
    curl -I https://safespheres.info/api/v1/auth/login/ 2>/dev/null || echo "API endpoint not accessible"
}

# Function to restart services
restart_services() {
    print_status "Restarting all services..."
    
    docker-compose -f docker-compose.ssl.yml down
    sleep 5
    docker-compose -f docker-compose.ssl.yml up -d
    
    print_status "Services restarted"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status     - Check container status"
    echo "  logs       - Check backend logs"
    echo "  health     - Test backend health"
    echo "  nginx      - Check nginx logs"
    echo "  network    - Check network connectivity"
    echo "  restart    - Restart all services"
    echo "  all        - Run all checks"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 all"
}

# Main script logic
case "$1" in
    status)
        check_root
        check_container_status
        ;;
    logs)
        check_root
        check_backend_logs
        ;;
    health)
        check_root
        test_backend_health
        ;;
    nginx)
        check_root
        check_nginx_logs
        ;;
    network)
        check_root
        check_network
        ;;
    restart)
        check_root
        restart_services
        ;;
    all)
        check_root
        check_container_status
        echo ""
        check_backend_logs
        echo ""
        test_backend_health
        echo ""
        check_nginx_logs
        echo ""
        check_network
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
