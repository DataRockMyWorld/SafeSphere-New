# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0006_migrate_audit_type_data'),
    ]

    operations = [
        # Remove the old audit_type_old field
        migrations.RemoveField(
            model_name='auditplan',
            name='audit_type_old',
        ),
        # Make audit_type non-nullable
        migrations.AlterField(
            model_name='auditplan',
            name='audit_type',
            field=models.ForeignKey(
                help_text='Type of audit',
                on_delete=django.db.models.deletion.PROTECT,
                related_name='audits',
                to='audits.audittype'
            ),
        ),
    ]

