# Generated manually

from django.db import migrations


def create_default_audit_types(apps, schema_editor):
    """Create default audit types."""
    AuditType = apps.get_model('audits', 'AuditType')
    
    audit_types = [
        {
            'name': 'System Audit',
            'code': 'SYSTEM',
            'description': 'Comprehensive audit of the entire management system',
        },
        {
            'name': 'Compliance Audit',
            'code': 'COMPLIANCE',
            'description': 'Audit to verify compliance with regulatory requirements and standards',
        },
        {
            'name': 'Security Audit',
            'code': 'SECURITY',
            'description': 'Audit focusing on security controls and protocols',
        },
        # Legacy types for migration
        {
            'name': 'Internal Audit',
            'code': 'INTERNAL',
            'description': 'Internal organizational audit',
        },
        {
            'name': 'External Audit',
            'code': 'EXTERNAL',
            'description': 'External third-party audit',
        },
        {
            'name': 'Surveillance Audit',
            'code': 'SURVEILLANCE',
            'description': 'Periodic surveillance audit',
        },
        {
            'name': 'Certification Audit',
            'code': 'CERTIFICATION',
            'description': 'Initial certification audit',
        },
        {
            'name': 'Re-certification Audit',
            'code': 'RE_CERTIFICATION',
            'description': 'Re-certification audit',
        },
    ]
    
    for audit_type_data in audit_types:
        AuditType.objects.get_or_create(
            code=audit_type_data['code'],
            defaults={
                'name': audit_type_data['name'],
                'description': audit_type_data['description'],
                'is_active': True,
            }
        )


def reverse_audit_types(apps, schema_editor):
    """Remove audit types."""
    AuditType = apps.get_model('audits', 'AuditType')
    AuditType.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0003_create_audittype'),
    ]

    operations = [
        migrations.RunPython(create_default_audit_types, reverse_audit_types),
    ]

