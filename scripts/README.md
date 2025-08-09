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
