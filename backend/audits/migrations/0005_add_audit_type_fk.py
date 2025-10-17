# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0004_seed_audit_types'),
    ]

    operations = [
        # Rename old audit_type field to audit_type_old
        migrations.RenameField(
            model_name='auditplan',
            old_name='audit_type',
            new_name='audit_type_old',
        ),
        # Add new audit_type ForeignKey field (nullable for now)
        migrations.AddField(
            model_name='auditplan',
            name='audit_type',
            field=models.ForeignKey(
                null=True,
                blank=True,
                help_text='Type of audit',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='audits',
                to='audits.audittype'
            ),
        ),
    ]

