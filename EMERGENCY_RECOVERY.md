# Emergency Recovery Guide

## App Down - Quick Recovery
1. SSH into server: ssh root@64.226.70.172
2. Check services: docker-compose -f docker-compose.ssl.yml ps
3. Restart if needed: docker-compose -f docker-compose.ssl.yml restart
4. Check logs: docker logs safesphere-nginx-1

## Port Conflicts
1. Check what's using ports: netstat -tlnp | grep :80
2. Stop conflicting services: sudo systemctl stop nginx
3. Start Docker services: docker-compose -f docker-compose.ssl.yml up -d

## Contact: [Your Contact Info]
