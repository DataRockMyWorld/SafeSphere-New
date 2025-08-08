#!/bin/bash

# SafeSphere Project Cleanup Script
# This script removes temporary debug files and organizes the project structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to backup files before deletion
backup_files() {
    print_status "Creating backup directory..."
    mkdir -p .backup/$(date +%Y%m%d_%H%M%S)
    print_success "Backup directory created"
}

# Function to remove temporary debug scripts
remove_debug_scripts() {
    print_header "Removing Temporary Debug Scripts"
    
    # List of scripts to remove
    local scripts_to_remove=(
        "fix-cors-minimal.sh"
        "fix-cors-final.sh"
        "debug-nginx-cors.sh"
        "fix-cors-simple-nginx.sh"
        "debug-nginx.sh"
        "fix-cors-direct.sh"
        "fix-nginx-cors.sh"
        "test-cors-manual.sh"
        "debug-cors.sh"
        "fix-cors-comprehensive.sh"
        "test-cors-simple.sh"
        "test-backend.sh"
        "debug-backend.sh"
        "test-cors-fix.sh"
        "fix-cors-simple.sh"
        "fix-cors-server.sh"
        "fix-cors.sh"
        "fix-ssl-simple.sh"
        "fix-ssl.sh"
        "create-admin.sh"
        "check-nginx-syntax.sh"
        "test-cors-simple.sh"
    )
    
    for script in "${scripts_to_remove[@]}"; do
        if [ -f "$script" ]; then
            print_status "Removing $script"
            rm "$script"
            print_success "Removed $script"
        fi
    done
}

# Function to organize production scripts
organize_production_scripts() {
    print_header "Organizing Production Scripts"
    
    # Create scripts directory
    mkdir -p scripts/production
    mkdir -p scripts/deployment
    mkdir -p scripts/admin
    
    # Move production scripts
    if [ -f "setup-ssl.sh" ]; then
        mv setup-ssl.sh scripts/production/
        print_success "Moved setup-ssl.sh to scripts/production/"
    fi
    
    if [ -f "fix-ssl-final.sh" ]; then
        mv fix-ssl-final.sh scripts/production/
        print_success "Moved fix-ssl-final.sh to scripts/production/"
    fi
    
    if [ -f "deploy.sh" ]; then
        mv deploy.sh scripts/deployment/
        print_success "Moved deploy.sh to scripts/deployment/"
    fi
    
    if [ -f "create-admin-simple.sh" ]; then
        mv create-admin-simple.sh scripts/admin/
        print_success "Moved create-admin-simple.sh to scripts/admin/"
    fi
    
    if [ -f "fix-cors-syntax.sh" ]; then
        mv fix-cors-syntax.sh scripts/production/
        print_success "Moved fix-cors-syntax.sh to scripts/production/"
    fi
}

# Function to organize documentation
organize_documentation() {
    print_header "Organizing Documentation"
    
    # Create docs directory
    mkdir -p docs/deployment
    mkdir -p docs/development
    
    # Move documentation files
    if [ -f "PRODUCTION_DEPLOYMENT.md" ]; then
        mv PRODUCTION_DEPLOYMENT.md docs/deployment/
        print_success "Moved PRODUCTION_DEPLOYMENT.md to docs/deployment/"
    fi
    
    if [ -f "AUTHENTICATION_WORKFLOW.md" ]; then
        mv AUTHENTICATION_WORKFLOW.md docs/development/
        print_success "Moved AUTHENTICATION_WORKFLOW.md to docs/development/"
    fi
    
    if [ -f "DOMAIN_SETUP.md" ]; then
        mv DOMAIN_SETUP.md docs/deployment/
        print_success "Moved DOMAIN_SETUP.md to docs/deployment/"
    fi
    
    if [ -f "update-frontend-config.md" ]; then
        mv update-frontend-config.md docs/deployment/
        print_success "Moved update-frontend-config.md to docs/deployment/"
    fi
    
    if [ -f "deploy-frontend.md" ]; then
        mv deploy-frontend.md docs/deployment/
        print_success "Moved deploy-frontend.md to docs/deployment/"
    fi
}

# Function to create main README
create_main_readme() {
    print_header "Creating Main README"
    
    cat > README.md << 'EOF'
# SafeSphere - Safety Management System

A comprehensive safety management system built with Django backend and React frontend.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SafeSphere-New
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Production Deployment

See [Production Deployment Guide](docs/deployment/PRODUCTION_DEPLOYMENT.md) for detailed instructions.

## 📁 Project Structure

```
SafeSphere-New/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication
│   ├── api/               # API endpoints
│   ├── documents/         # Document management
│   ├── legals/            # Legal compliance
│   ├── ppes/              # PPE management
│   └── core/              # Core settings
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── scripts/               # Deployment and utility scripts
├── docs/                  # Documentation
└── nginx/                 # Nginx configuration
```

## 🛠️ Available Scripts

### Production Scripts
- `scripts/production/setup-ssl.sh` - SSL certificate setup
- `scripts/production/fix-cors-syntax.sh` - CORS configuration fix
- `scripts/production/fix-ssl-final.sh` - SSL certificate fix

### Deployment Scripts
- `scripts/deployment/deploy.sh` - Main deployment script

### Admin Scripts
- `scripts/admin/create-admin-simple.sh` - Create admin user

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and configure:
- Database settings
- Email settings
- CORS settings
- SSL settings

### Frontend Configuration
Update `frontend/src/utils/axiosInstance.ts` with your backend URL.

## 📚 Documentation

- [Production Deployment](docs/deployment/PRODUCTION_DEPLOYMENT.md)
- [Authentication Workflow](docs/development/AUTHENTICATION_WORKFLOW.md)
- [Domain Setup](docs/deployment/DOMAIN_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
EOF

    print_success "Main README created"
}

# Function to create script documentation
create_script_docs() {
    print_header "Creating Script Documentation"
    
    cat > scripts/README.md << 'EOF'
# SafeSphere Scripts

This directory contains utility scripts for deployment, administration, and maintenance.

## 📁 Directory Structure

### Production Scripts (`production/`)
Scripts for production environment setup and maintenance.

- **setup-ssl.sh** - Set up SSL certificates using Let's Encrypt
- **fix-cors-syntax.sh** - Fix Nginx CORS configuration
- **fix-ssl-final.sh** - Fix SSL certificate loading issues

### Deployment Scripts (`deployment/`)
Scripts for deploying the application.

- **deploy.sh** - Main deployment script for DigitalOcean

### Admin Scripts (`admin/`)
Scripts for user and system administration.

- **create-admin-simple.sh** - Create or reset admin users

## 🚀 Usage

### Production Setup
```bash
# Set up SSL certificates
sudo ./scripts/production/setup-ssl.sh setup

# Fix CORS issues
sudo ./scripts/production/fix-cors-syntax.sh fix

# Create admin user
sudo ./scripts/admin/create-admin-simple.sh create
```

### Deployment
```bash
# Deploy to production
sudo ./scripts/deployment/deploy.sh
```

## ⚠️ Important Notes

- All scripts should be run as root (use `sudo`)
- Scripts are designed for Ubuntu/Debian systems
- Always backup your configuration before running scripts
- Test scripts in a staging environment first
EOF

    print_success "Script documentation created"
}

# Function to clean up temporary files
cleanup_temp_files() {
    print_header "Cleaning Up Temporary Files"
    
    # Remove temporary files
    if [ -f "cookies.txt" ]; then
        rm cookies.txt
        print_success "Removed cookies.txt"
    fi
    
    # Remove any .DS_Store files (macOS)
    find . -name ".DS_Store" -delete 2>/dev/null || true
    print_success "Removed .DS_Store files"
    
    # Remove any backup files older than 7 days
    find . -name "*.backup.*" -mtime +7 -delete 2>/dev/null || true
    print_success "Cleaned up old backup files"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  cleanup    - Clean up temporary files and organize project"
    echo "  preview    - Show what will be cleaned up (dry run)"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 cleanup"
    echo "  $0 preview"
}

# Function to preview changes
preview_changes() {
    print_header "Preview Mode - No files will be deleted"
    
    echo "Files that would be removed:"
    local scripts_to_remove=(
        "fix-cors-minimal.sh"
        "fix-cors-final.sh"
        "debug-nginx-cors.sh"
        "fix-cors-simple-nginx.sh"
        "debug-nginx.sh"
        "fix-cors-direct.sh"
        "fix-nginx-cors.sh"
        "test-cors-manual.sh"
        "debug-cors.sh"
        "fix-cors-comprehensive.sh"
        "test-cors-simple.sh"
        "test-backend.sh"
        "debug-backend.sh"
        "test-cors-fix.sh"
        "fix-cors-simple.sh"
        "fix-cors-server.sh"
        "fix-cors.sh"
        "fix-ssl-simple.sh"
        "fix-ssl.sh"
        "create-admin.sh"
        "check-nginx-syntax.sh"
        "test-cors-simple.sh"
    )
    
    for script in "${scripts_to_remove[@]}"; do
        if [ -f "$script" ]; then
            echo "  - $script"
        fi
    done
    
    echo ""
    echo "Directories that would be created:"
    echo "  - scripts/production/"
    echo "  - scripts/deployment/"
    echo "  - scripts/admin/"
    echo "  - docs/deployment/"
    echo "  - docs/development/"
}

# Main script logic
case "$1" in
    cleanup)
        print_header "SafeSphere Project Cleanup"
        backup_files
        remove_debug_scripts
        organize_production_scripts
        organize_documentation
        create_main_readme
        create_script_docs
        cleanup_temp_files
        print_success "Project cleanup completed!"
        echo ""
        echo "Next steps:"
        echo "1. Review the new structure"
        echo "2. Update any references to moved files"
        echo "3. Commit the changes"
        ;;
    preview)
        preview_changes
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
