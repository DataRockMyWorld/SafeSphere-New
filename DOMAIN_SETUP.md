# SafeSphere Domain Setup Guide

This guide will help you set up SSL certificates for your domain `safespheres.info` and `www.safespheres.info` on your DigitalOcean droplet.

## 🚀 Quick Setup

1. **Ensure your domain is pointing to your droplet**
2. **Run the SSL setup script**
3. **Update your environment variables**

```bash
# Make sure your domain DNS is configured
# Then run the SSL setup
sudo ./setup-ssl.sh setup
```

## 📋 Prerequisites

### 1. Domain DNS Configuration

Make sure your domain `safespheres.info` is pointing to your DigitalOcean droplet:

```bash
# Check your droplet's IP address
curl ifconfig.me

# Check if domain is pointing to your server
dig safespheres.info
```

**DNS Records to configure:**
- `A` record: `safespheres.info` → Your droplet IP
- `A` record: `www.safespheres.info` → Your droplet IP
- `CNAME` record: `www.safespheres.info` → `safespheres.info` (alternative)

### 2. Server Requirements

- Ubuntu 22.04 LTS
- Docker and Docker Compose installed
- Ports 80 and 443 open
- Root access or sudo privileges

## 🔧 Step-by-Step Setup

### Step 1: Verify Domain Configuration

```bash
# Check if domain is pointing to your server
./setup-ssl.sh test
```

### Step 2: Set Up SSL Certificates

```bash
# Complete SSL setup (recommended)
sudo ./setup-ssl.sh setup

# Or step by step:
sudo ./setup-ssl.sh install
sudo ./setup-ssl.sh obtain
```

### Step 3: Update Environment Variables

```bash
# Copy the example environment file
cp env.example .env.prod

# Edit with your production values
nano .env.prod
```

**Important environment variables to update:**
```bash
# Django Settings
SECRET_KEY=your-generated-secret-key
ALLOWED_HOSTS=safespheres.info,www.safespheres.info,your-ip-address

# Email Configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=admin@safespheres.info

# Frontend URL
FRONTEND_URL=https://safespheres.info

# CORS Settings
CORS_ALLOWED_ORIGINS=https://safespheres.info,https://www.safespheres.info
CSRF_TRUSTED_ORIGINS=https://safespheres.info,https://www.safespheres.info
```

### Step 4: Deploy Your Application

```bash
# Start all services
./deploy.sh start

# Initialize database
./deploy.sh init

# Check health
./deploy.sh health
```

## 🔍 Verification

### 1. Test SSL Certificate

```bash
# Test SSL configuration
./setup-ssl.sh test

# Or manually test
curl -I https://safespheres.info/health
```

### 2. Check Certificate Details

```bash
# View certificate information
sudo certbot certificates

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/safespheres.info/cert.pem -text -noout | grep "Not After"
```

### 3. Test All Endpoints

```bash
# Test API endpoints
curl https://safespheres.info/api/health/
curl https://www.safespheres.info/api/health/

# Test admin interface
curl https://safespheres.info/admin/
```

## 🔄 Certificate Renewal

SSL certificates from Let's Encrypt are valid for 90 days. The setup script configures automatic renewal:

```bash
# Manual renewal
sudo ./setup-ssl.sh renew

# Check renewal status
sudo certbot renew --dry-run
```

**Auto-renewal is configured to run daily via cron.**

## 🛠️ Troubleshooting

### Common Issues

1. **Domain not pointing to server**
   ```bash
   # Check DNS propagation
   dig safespheres.info
   nslookup safespheres.info
   ```

2. **Port 80/443 not accessible**
   ```bash
   # Check firewall
   sudo ufw status
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **Certificate not obtained**
   ```bash
   # Check certbot logs
   sudo certbot certificates
   sudo journalctl -u certbot
   ```

4. **Nginx not starting**
   ```bash
   # Check nginx configuration
   docker-compose -f docker-compose.prod.yml logs nginx
   ```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### DNS Issues

```bash
# Check if domain resolves
dig safespheres.info
dig www.safespheres.info

# Check from different locations
curl -I http://safespheres.info
```

## 📊 Monitoring

### SSL Certificate Monitoring

```bash
# Check certificate expiration
echo | openssl s_client -servername safespheres.info -connect safespheres.info:443 2>/dev/null | openssl x509 -noout -dates

# Monitor certificate renewal
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Application Monitoring

```bash
# Check service health
./deploy.sh health

# View logs
./deploy.sh logs

# Monitor nginx access logs
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/access.log
```

## 🔒 Security Checklist

- [ ] SSL certificates installed and working
- [ ] Automatic renewal configured
- [ ] HTTPS redirects working
- [ ] Security headers configured
- [ ] Firewall rules in place
- [ ] Environment variables secured
- [ ] Database credentials strong
- [ ] Admin interface protected

## 📞 Support

If you encounter issues:

1. **Check the logs:**
   ```bash
   ./deploy.sh logs
   sudo journalctl -u certbot
   ```

2. **Verify configuration:**
   ```bash
   ./setup-ssl.sh test
   ./deploy.sh health
   ```

3. **Common solutions:**
   - Restart services: `./deploy.sh restart`
   - Renew certificates: `sudo ./setup-ssl.sh renew`
   - Check DNS: `dig safespheres.info`

## 🔄 Maintenance

### Daily
- Monitor certificate expiration
- Check service health
- Review error logs

### Weekly
- Test SSL configuration
- Verify backups
- Check performance

### Monthly
- Review security updates
- Test certificate renewal
- Update documentation

## 📝 Notes

- SSL certificates are stored in `/etc/letsencrypt/live/safespheres.info/`
- Nginx configuration is in `nginx/nginx.conf`
- Auto-renewal runs daily via cron
- Certificates are valid for 90 days
- Let's Encrypt has rate limits (50 certificates per week per domain)

Your SafeSphere application should now be accessible at:
- **https://safespheres.info**
- **https://www.safespheres.info**
