# SafeSphere Production Deployment Guide

This guide will help you deploy SafeSphere to production on DigitalOcean.

## 🚀 Quick Start

1. **Create DigitalOcean Droplet**
2. **Set up environment variables**
3. **Deploy with Docker**

```bash
# Clone your repository
git clone <your-repo-url>
cd SafeSphere

# Create production environment file
cp env.example .env.prod
# Edit .env.prod with your production values

# Deploy
./deploy.sh start
```

## 📋 Prerequisites

### DigitalOcean Droplet Setup

1. **Create a Droplet**
   - Ubuntu 22.04 LTS
   - 2GB RAM minimum (4GB recommended)
   - 50GB SSD storage
   - Choose a datacenter close to your users

2. **Initial Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   
   # Install Git
   sudo apt install git -y
   ```

3. **Set up Firewall**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

## 🔧 Environment Configuration

### 1. Create Production Environment File

Copy the example environment file and configure it:

```bash
cp env.example .env.prod
```

### 2. Configure Environment Variables

Edit `.env.prod` with your production values:

```bash
# Django Settings
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your-ip-address

# Database Configuration
DB_NAME=safesphere_prod
DB_USER=safesphere_user
DB_PASSWORD=your-strong-database-password
DB_HOST=db
DB_PORT=5432

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=5
JWT_REFRESH_TOKEN_LIFETIME=1

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Security Settings
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Generate Secure Keys

```bash
# Generate Django secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Generate JWT secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 🐳 Docker Deployment

### 1. Build and Start Services

```bash
# Start all services
./deploy.sh start

# Check service status
./deploy.sh health

# View logs
./deploy.sh logs
```

### 2. Initialize Database

```bash
# Run migrations and create superuser
./deploy.sh init
```

### 3. SSL Certificate Setup

For production, you should use Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔍 Monitoring and Maintenance

### Health Checks

```bash
# Check service health
./deploy.sh health

# View specific service logs
./deploy.sh logs backend
./deploy.sh logs frontend
./deploy.sh logs nginx
```

### Database Backups

```bash
# Manual backup
./deploy.sh backup

# Automatic backups run daily
```

### Updates

```bash
# Update application
./deploy.sh update
```

## 📊 Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_documents_created_at ON documents_document(created_at);
CREATE INDEX idx_users_email ON accounts_user(email);
```

### 2. Redis Configuration

```bash
# Optimize Redis for production
docker-compose -f docker-compose.prod.yml exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 3. Nginx Optimization

The nginx configuration includes:
- Gzip compression
- Static file caching
- Rate limiting
- Security headers

## 🔒 Security Checklist

- [ ] Change default passwords
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Enable automatic security updates
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Implement rate limiting
- [ ] Set up log monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   # Check Docker logs
   docker-compose -f docker-compose.prod.yml logs
   
   # Check service status
   docker-compose -f docker-compose.prod.yml ps
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   ./deploy.sh logs db
   
   # Test database connection
   docker-compose -f docker-compose.prod.yml exec backend python manage.py dbshell
   ```

3. **Static files not loading**
   ```bash
   # Collect static files
   docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificates
   sudo certbot renew
   ```

### Log Locations

- **Application logs**: `/app/logs/safesphere.log`
- **Nginx logs**: `/var/log/nginx/`
- **Docker logs**: `docker-compose -f docker-compose.prod.yml logs`

## 📈 Scaling Considerations

### Vertical Scaling
- Upgrade droplet size for more CPU/RAM
- Add more workers in Gunicorn configuration
- Optimize database queries

### Horizontal Scaling
- Use load balancers
- Implement database read replicas
- Use CDN for static files
- Consider microservices architecture

## 🔄 Backup and Recovery

### Automated Backups
- Database backups run daily
- Backups retained for 7 days
- Stored in `./backups/` directory

### Manual Backup
```bash
# Create backup
./deploy.sh backup

# Restore from backup
docker-compose -f docker-compose.prod.yml exec db psql -U $DB_USER -d $DB_NAME < backup_file.sql
```

## 📞 Support

For issues and questions:
1. Check the logs: `./deploy.sh logs`
2. Verify health: `./deploy.sh health`
3. Review this documentation
4. Check DigitalOcean status page

## 🔄 Update Process

```bash
# 1. Pull latest changes
git pull origin main

# 2. Update and restart services
./deploy.sh update

# 3. Verify deployment
./deploy.sh health
```

## 📝 Maintenance Tasks

### Daily
- Check service health
- Monitor logs for errors
- Verify backups

### Weekly
- Review performance metrics
- Update system packages
- Check SSL certificate expiration

### Monthly
- Review security updates
- Analyze usage patterns
- Plan capacity needs 