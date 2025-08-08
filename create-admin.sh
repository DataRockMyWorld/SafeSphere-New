#!/bin/bash

# SafeSphere Admin User Creation Script
# This script clears existing superusers and creates a new one

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

# Function to create admin user
create_admin_user() {
    print_status "Creating new admin user..."
    
    # Run the Django management command
    docker-compose -f docker-compose.ssl.yml exec backend python manage.py create_superuser \
        --username admin \
        --email admin@safespheres.info \
        --password admin123 \
        --first-name Admin \
        --last-name User
    
    print_status "Admin user creation completed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  create     - Clear existing superusers and create new admin"
    echo "  custom     - Create admin with custom credentials"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 create"
    echo "  $0 custom --username myadmin --password mypassword"
}

# Function to create custom admin user
create_custom_admin() {
    print_status "Creating custom admin user..."
    
    # Get custom credentials
    read -p "Enter username (default: admin): " username
    username=${username:-admin}
    
    read -p "Enter email (default: admin@safespheres.info): " email
    email=${email:-admin@safespheres.info}
    
    read -s -p "Enter password (default: admin123): " password
    password=${password:-admin123}
    echo
    
    read -p "Enter first name (default: Admin): " first_name
    first_name=${first_name:-Admin}
    
    read -p "Enter last name (default: User): " last_name
    last_name=${last_name:-User}
    
    # Run the Django management command with custom credentials
    docker-compose -f docker-compose.ssl.yml exec backend python manage.py create_superuser \
        --username "$username" \
        --email "$email" \
        --password "$password" \
        --first-name "$first_name" \
        --last-name "$last_name"
    
    print_status "Custom admin user creation completed"
}

# Main script logic
case "$1" in
    create)
        check_root
        check_services
        create_admin_user
        print_status "Admin user created successfully!"
        print_status "You can now login at https://safespheres.info/admin/"
        print_status "Username: admin"
        print_status "Password: admin123"
        ;;
    custom)
        check_root
        check_services
        create_custom_admin
        print_status "Custom admin user created successfully!"
        print_status "You can now login at https://safespheres.info/admin/"
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
