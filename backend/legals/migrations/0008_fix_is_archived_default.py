# Generated manually to fix is_archived field default values

from django.db import migrations


def set_default_is_archived(apps, schema_editor):
    """Set is_archived to False for all existing documents"""
    LegalRegisterDocument = apps.get_model('legals', 'LegalRegisterDocument')
    
    # Update all documents that have NULL is_archived
    LegalRegisterDocument.objects.filter(is_archived__isnull=True).update(is_archived=False)


class Migration(migrations.Migration):

    dependencies = [
        ('legals', '0007_seed_ghana_hsse_laws'),
    ]

    operations = [
        migrations.RunPython(set_default_is_archived, migrations.RunPython.noop),
    ]

