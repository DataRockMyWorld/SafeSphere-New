import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('safesphere')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Configuration
app.conf.update(
    # Broker settings
    broker_url=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    result_backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
    
    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Worker settings
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    
    # Beat settings (for periodic tasks)
    beat_schedule={
        'cleanup-expired-tokens': {
            'task': 'accounts.tasks.cleanup_expired_tokens',
            'schedule': 3600.0,  # Every hour
        },
        'send-daily-reports': {
            'task': 'documents.tasks.send_daily_reports',
            'schedule': 86400.0,  # Daily
        },
        'backup-database': {
            'task': 'core.tasks.backup_database',
            'schedule': 86400.0,  # Daily
        },
    },
    
    # Task routing
    task_routes={
        'accounts.tasks.*': {'queue': 'accounts'},
        'documents.tasks.*': {'queue': 'documents'},
        'ppes.tasks.*': {'queue': 'ppes'},
        'core.tasks.*': {'queue': 'core'},
    },
    
    # Queue definitions
    task_default_queue='default',
    task_queues={
        'default': {},
        'accounts': {},
        'documents': {},
        'ppes': {},
        'core': {},
    },
    
    # Error handling
    task_reject_on_worker_lost=True,
    task_acks_late=True,
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
)

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 