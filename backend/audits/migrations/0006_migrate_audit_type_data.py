# Generated manually

from django.db import migrations


def migrate_audit_types(apps, schema_editor):
    """Migrate old audit_type strings to new AuditType ForeignKeys."""
    AuditPlan = apps.get_model('audits', 'AuditPlan')
    AuditType = apps.get_model('audits', 'AuditType')
    
    # Mapping of old values to new codes
    type_mapping = {
        'INTERNAL': 'INTERNAL',
        'EXTERNAL': 'EXTERNAL',
        'SURVEILLANCE': 'SURVEILLANCE',
        'CERTIFICATION': 'CERTIFICATION',
        'RE_CERTIFICATION': 'RE_CERTIFICATION',
    }
    
    for audit_plan in AuditPlan.objects.all():
        old_type = audit_plan.audit_type_old
        if old_type in type_mapping:
            try:
                audit_type = AuditType.objects.get(code=type_mapping[old_type])
                audit_plan.audit_type = audit_type
                audit_plan.save(update_fields=['audit_type'])
            except AuditType.DoesNotExist:
                # If type doesn't exist, default to SYSTEM
                audit_type = AuditType.objects.get(code='SYSTEM')
                audit_plan.audit_type = audit_type
                audit_plan.save(update_fields=['audit_type'])


def reverse_migration(apps, schema_editor):
    """Reverse the migration."""
    AuditPlan = apps.get_model('audits', 'AuditPlan')
    
    for audit_plan in AuditPlan.objects.all():
        if audit_plan.audit_type:
            audit_plan.audit_type_old = audit_plan.audit_type.code
            audit_plan.save(update_fields=['audit_type_old'])


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0005_add_audit_type_fk'),
    ]

    operations = [
        migrations.RunPython(migrate_audit_types, reverse_migration),
    ]

