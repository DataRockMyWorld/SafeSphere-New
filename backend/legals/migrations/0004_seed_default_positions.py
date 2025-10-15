# Generated manually to seed default HSSE positions

from django.db import migrations


def create_default_positions(apps, schema_editor):
    """Create default HSSE positions"""
    Position = apps.get_model('legals', 'Position')
    
    default_positions = [
        'HSSE Manager',
        'Safety Officer',
        'Environmental Officer',
        'Security Manager',
        'Operations Manager',
        'Facility Manager',
        'Compliance Officer',
        'Risk Manager',
        'Training Coordinator',
        'Emergency Response Coordinator',
        'Site Supervisor',
        'Department Head',
    ]
    
    for position_name in default_positions:
        Position.objects.get_or_create(name=position_name)


def remove_default_positions(apps, schema_editor):
    """Remove default positions if migration is reversed"""
    Position = apps.get_model('legals', 'Position')
    
    default_positions = [
        'HSSE Manager',
        'Safety Officer',
        'Environmental Officer',
        'Security Manager',
        'Operations Manager',
        'Facility Manager',
        'Compliance Officer',
        'Risk Manager',
        'Training Coordinator',
        'Emergency Response Coordinator',
        'Site Supervisor',
        'Department Head',
    ]
    
    Position.objects.filter(name__in=default_positions).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('legals', '0003_seed_default_categories'),
    ]

    operations = [
        migrations.RunPython(create_default_positions, remove_default_positions),
    ]

