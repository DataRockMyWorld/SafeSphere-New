import os
import subprocess
from datetime import datetime, timedelta
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

@shared_task
def backup_database():
    """
    Create a database backup
    """
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backup_dir, exist_ok=True)
        
        backup_file = os.path.join(backup_dir, f'backup_{timestamp}.sql')
        
        # Database connection details from environment
        db_name = os.environ.get('DB_NAME')
        db_user = os.environ.get('DB_USER')
        db_password = os.environ.get('DB_PASSWORD')
        db_host = os.environ.get('DB_HOST', 'localhost')
        db_port = os.environ.get('DB_PORT', '5432')
        
        # Create backup command
        cmd = [
            'pg_dump',
            f'--host={db_host}',
            f'--port={db_port}',
            f'--username={db_user}',
            f'--dbname={db_name}',
            '--no-password',
            '--format=custom',
            f'--file={backup_file}'
        ]
        
        # Set environment variable for password
        env = os.environ.copy()
        env['PGPASSWORD'] = db_password
        
        # Execute backup
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"Database backup created successfully: {backup_file}")
            
            # Clean up old backups (keep last 7 days)
            cleanup_old_backups()
            
            return f"Backup completed: {backup_file}"
        else:
            print(f"Backup failed: {result.stderr}")
            return f"Backup failed: {result.stderr}"
            
    except Exception as e:
        print(f"Backup error: {str(e)}")
        return f"Backup error: {str(e)}"

@shared_task
def cleanup_old_backups():
    """
    Remove backups older than 7 days
    """
    try:
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        if not os.path.exists(backup_dir):
            return "Backup directory does not exist"
        
        cutoff_date = timezone.now() - timedelta(days=7)
        removed_count = 0
        
        for filename in os.listdir(backup_dir):
            if filename.startswith('backup_') and filename.endswith('.sql'):
                file_path = os.path.join(backup_dir, filename)
                file_time = datetime.fromtimestamp(os.path.getctime(file_path))
                
                if file_time < cutoff_date:
                    os.remove(file_path)
                    removed_count += 1
        
        print(f"Cleaned up {removed_count} old backup files")
        return f"Cleaned up {removed_count} old backup files"
        
    except Exception as e:
        print(f"Cleanup error: {str(e)}")
        return f"Cleanup error: {str(e)}"

@shared_task
def send_system_health_report():
    """
    Send a system health report via email
    """
    try:
        from django.db import connection
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Collect system metrics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Database connection test
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0]
        
        # System info
        import psutil
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Create report
        report = f"""
        SafeSphere System Health Report
        Generated: {timezone.now()}
        
        User Statistics:
        - Total Users: {total_users}
        - Active Users: {active_users}
        
        System Resources:
        - CPU Usage: {cpu_percent}%
        - Memory Usage: {memory.percent}%
        - Disk Usage: {disk.percent}%
        
        Database:
        - Version: {db_version}
        
        This is an automated report.
        """
        
        # Send email to admin
        admin_emails = User.objects.filter(is_superuser=True).values_list('email', flat=True)
        
        if admin_emails:
            send_mail(
                subject='SafeSphere System Health Report',
                message=report,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=list(admin_emails),
                fail_silently=False,
            )
        
        return "Health report sent successfully"
        
    except Exception as e:
        print(f"Health report error: {str(e)}")
        return f"Health report error: {str(e)}"

@shared_task
def cleanup_expired_sessions():
    """
    Clean up expired sessions
    """
    try:
        from django.contrib.sessions.models import Session
        
        # Delete expired sessions
        Session.objects.filter(expire_date__lt=timezone.now()).delete()
        
        return "Expired sessions cleaned up"
        
    except Exception as e:
        print(f"Session cleanup error: {str(e)}")
        return f"Session cleanup error: {str(e)}"

@shared_task
def test_celery_connection():
    """
    Test Celery connection and return status
    """
    return "Celery is working correctly" 