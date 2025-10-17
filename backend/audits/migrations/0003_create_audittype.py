# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0002_alter_auditplan_audit_criteria_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='AuditType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='e.g., System Audit, Compliance Audit', max_length=100, unique=True)),
                ('code', models.CharField(help_text='Short code for the audit type', max_length=20, unique=True)),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Audit Type',
                'verbose_name_plural': 'Audit Types',
                'ordering': ['name'],
            },
        ),
    ]

