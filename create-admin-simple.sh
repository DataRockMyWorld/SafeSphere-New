#!/bin/bash

# SafeSphere Admin User Creation Script (Email-based)
# This script clears existing superusers and creates a new one using Django shell

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

# Function to create admin user using Django shell
create_admin_user() {
    print_status "Creating new admin user..."
    
    # Create a Python script to run in Django shell
    cat > /tmp/create_admin.py << 'EOF'
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

with transaction.atomic():
    # Delete all existing superusers
    superusers = User.objects.filter(is_superuser=True)
    count = superusers.count()
    superusers.delete()
    print(f'Deleted {count} existing superuser(s)')

    # Create new superuser with correct fields
    user = User.objects.create_superuser(
        email='admin@safespheres.info',
        first_name='Admin',
        last_name='User',
        phone_number='+1234567890',
        password='admin123'
    )
    
    print('Successfully created new superuser:')
    print(f'Email: admin@safespheres.info')
    print(f'Password: admin123')
    print(f'Name: Admin User')
    print(f'Phone: +1234567890')
EOF

    # Run the script in Django shell
    docker-compose -f docker-compose.ssl.yml exec -T backend python manage.py shell < /tmp/create_admin.py
    
    # Clean up
    rm /tmp/create_admin.py
    
    print_status "Admin user creation completed"
}

# Function to create custom admin user
create_custom_admin() {
    print_status "Creating custom admin user..."
    
    # Get custom credentials
    read -p "Enter email (default: admin@safespheres.info): " email
    email=${email:-admin@safespheres.info}
    
    read -s -p "Enter password (default: admin123): " password
    password=${password:-admin123}
    echo
    
    read -p "Enter first name (default: Admin): " first_name
    first_name=${first_name:-Admin}
    
    read -p "Enter last name (default: User): " last_name
    last_name=${last_name:-User}
    
    read -p "Enter phone number (default: +1234567890): " phone_number
    phone_number=${phone_number:-+1234567890}
    
    # Create a Python script for custom user
    cat > /tmp/create_custom_admin.py << EOF
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

with transaction.atomic():
    # Delete all existing superusers
    superusers = User.objects.filter(is_superuser=True)
    count = superusers.count()
    superusers.delete()
    print(f'Deleted {count} existing superuser(s)')

    # Create new superuser with correct fields
    user = User.objects.create_superuser(
        email='$email',
        first_name='$first_name',
        last_name='$last_name',
        phone_number='$phone_number',
        password='$password'
    )
    
    print('Successfully created new superuser:')
    print(f'Email: $email')
    print(f'Password: $password')
    print(f'Name: $first_name $last_name')
    print(f'Phone: $phone_number')
EOF

    # Run the script in Django shell
    docker-compose -f docker-compose.ssl.yml exec -T backend python manage.py shell < /tmp/create_custom_admin.py
    
    # Clean up
    rm /tmp/create_custom_admin.py
    
    print_status "Custom admin user creation completed"
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
    echo "  $0 custom"
}

# Main script logic
case "$1" in
    create)
        check_root
        check_services
        create_admin_user
        print_status "Admin user created successfully!"
        print_status "You can now login at https://safespheres.info/admin/"
        print_status "Email: admin@safespheres.info"
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
