# Generated manually for ISO 45001 enhancements

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0013_make_title_required'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # =============================
        # Document Model Enhancements
        # =============================
        
        # Template clarity
        migrations.AddField(
            model_name='document',
            name='is_template',
            field=models.BooleanField(default=False, help_text='Explicit flag: This document is NOT a template (templates are in DocumentTemplate model)'),
        ),
        migrations.AddField(
            model_name='document',
            name='source_template',
            field=models.ForeignKey(
                blank=True,
                help_text='The template this document was created from',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='documents_created',
                to='documents.documenttemplate'
            ),
        ),
        
        # Document classification
        migrations.AddField(
            model_name='document',
            name='document_classification',
            field=models.CharField(
                choices=[
                    ('CONTROLLED', 'Controlled Document'),
                    ('UNCONTROLLED', 'Uncontrolled Document'),
                    ('REFERENCE', 'Reference Document'),
                    ('EXTERNAL', 'External Document'),
                ],
                default='CONTROLLED',
                help_text='Classification of this document for ISO 45001 compliance',
                max_length=20
            ),
        ),
        
        # Retention
        migrations.AddField(
            model_name='document',
            name='retention_period_years',
            field=models.IntegerField(
                blank=True,
                help_text='How long records created from this document should be retained (years)',
                null=True
            ),
        ),
        
        # Storage location
        migrations.AddField(
            model_name='document',
            name='storage_location',
            field=models.CharField(
                blank=True,
                help_text='Physical or electronic storage location',
                max_length=255
            ),
        ),
        
        # Access level
        migrations.AddField(
            model_name='document',
            name='access_level',
            field=models.CharField(
                choices=[
                    ('PUBLIC', 'Public'),
                    ('INTERNAL', 'Internal'),
                    ('RESTRICTED', 'Restricted'),
                    ('CONFIDENTIAL', 'Confidential'),
                ],
                default='INTERNAL',
                help_text='Access level for this document',
                max_length=20
            ),
        ),
        
        # Obsolete control
        migrations.AddField(
            model_name='document',
            name='is_obsolete',
            field=models.BooleanField(
                default=False,
                help_text='Mark document as obsolete when replaced by a new version'
            ),
        ),
        migrations.AddField(
            model_name='document',
            name='obsoleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='document',
            name='obsoleted_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='docs_obsoleted',
                to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name='document',
            name='replaced_by',
            field=models.ForeignKey(
                blank=True,
                help_text='New document version that replaces this one',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='replaces',
                to='documents.document'
            ),
        ),
        
        # Distribution list (ManyToMany)
        migrations.AddField(
            model_name='document',
            name='distribution_list',
            field=models.ManyToManyField(
                blank=True,
                help_text='Users who have access to this document',
                related_name='distributed_documents',
                to=settings.AUTH_USER_MODEL
            ),
        ),
        
        # =============================
        # Record Model Enhancements
        # =============================
        
        # Source document (replaces form_document)
        migrations.AddField(
            model_name='record',
            name='source_document',
            field=models.ForeignKey(
                blank=True,
                help_text='The approved form document this record was created from',
                limit_choices_to={'document_type': 'FORM', 'status': 'APPROVED'},
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='completed_records',
                to='documents.document'
            ),
        ),
        
        # Record classification
        migrations.AddField(
            model_name='record',
            name='record_classification',
            field=models.CharField(
                choices=[
                    ('LEGAL', 'Legal Requirement'),
                    ('OPERATIONAL', 'Operational Record'),
                    ('AUDIT', 'Audit Evidence'),
                    ('INCIDENT', 'Incident Record'),
                    ('TRAINING', 'Training Record'),
                    ('INSPECTION', 'Inspection Record'),
                    ('MAINTENANCE', 'Maintenance Record'),
                    ('HEALTH', 'Health Surveillance Record'),
                ],
                default='OPERATIONAL',
                help_text='Classification of this record for ISO 45001 compliance',
                max_length=20
            ),
        ),
        
        # Retention management
        migrations.AddField(
            model_name='record',
            name='retention_period_years',
            field=models.IntegerField(
                default=7,
                help_text='Number of years to retain this record (ISO 45001 requirement)'
            ),
        ),
        migrations.AddField(
            model_name='record',
            name='disposal_date',
            field=models.DateField(
                blank=True,
                help_text='Auto-calculated: created_at + retention_period_years',
                null=True
            ),
        ),
        
        # Location tracking
        migrations.AddField(
            model_name='record',
            name='storage_location',
            field=models.CharField(
                blank=True,
                help_text='Physical or electronic storage location',
                max_length=255
            ),
        ),
        migrations.AddField(
            model_name='record',
            name='storage_type',
            field=models.CharField(
                choices=[
                    ('ELECTRONIC', 'Electronic'),
                    ('PHYSICAL', 'Physical'),
                    ('HYBRID', 'Hybrid'),
                ],
                default='ELECTRONIC',
                help_text='Type of storage for this record',
                max_length=20
            ),
        ),
        
        # Context information
        migrations.AddField(
            model_name='record',
            name='department',
            field=models.CharField(
                blank=True,
                choices=[
                    ('HSSE', 'HSSE'),
                    ('OPERATIONS', 'Operations'),
                    ('FINANCE', 'Finance'),
                    ('MARKETING', 'Marketing'),
                ],
                help_text='Department that created this record',
                max_length=50
            ),
        ),
        migrations.AddField(
            model_name='record',
            name='facility_location',
            field=models.CharField(
                blank=True,
                help_text='Facility or site location where this record applies',
                max_length=255
            ),
        ),
        
        # Immutability
        migrations.AddField(
            model_name='record',
            name='is_locked',
            field=models.BooleanField(
                default=False,
                help_text='Lock record after approval to prevent modification (ISO 45001 requirement)'
            ),
        ),
        migrations.AddField(
            model_name='record',
            name='locked_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='record',
            name='locked_by',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='records_locked',
                to=settings.AUTH_USER_MODEL
            ),
        ),
        
        # Correction tracking
        migrations.AddField(
            model_name='record',
            name='correction_version',
            field=models.IntegerField(
                default=1,
                help_text='Version number if this is a correction of a previous record'
            ),
        ),
        migrations.AddField(
            model_name='record',
            name='parent_record',
            field=models.ForeignKey(
                blank=True,
                help_text='Link to original record if this is a correction',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='corrections',
                to='documents.record'
            ),
        ),
        
        # Access restrictions
        migrations.AddField(
            model_name='record',
            name='access_restrictions',
            field=models.JSONField(blank=True, default=dict, help_text='JSON defining who can access this record (roles, departments, etc.)'),
        ),
        
        # =============================
        # New Supporting Models
        # =============================
        
        # DocumentDistribution model
        migrations.CreateModel(
            name='DocumentDistribution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('distributed_at', models.DateTimeField(auto_now_add=True)),
                ('acknowledged', models.BooleanField(default=False, help_text='User has acknowledged receipt')),
                ('acknowledged_at', models.DateTimeField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, help_text='Additional notes about this distribution')),
                ('distributed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='distributions_made', to=settings.AUTH_USER_MODEL)),
                ('document', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='distributions', to='documents.document')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='document_distributions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Document Distribution',
                'verbose_name_plural': 'Document Distributions',
                'ordering': ['-distributed_at'],
                'unique_together': {('document', 'user')},
            },
        ),
        
        # RecordDisposal model
        migrations.CreateModel(
            name='RecordDisposal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('disposal_date', models.DateField(help_text='Date when record was disposed')),
                ('disposal_method', models.CharField(
                    choices=[
                        ('DIGITAL_DELETE', 'Digital Deletion'),
                        ('PHYSICAL_DESTROY', 'Physical Destruction'),
                        ('ARCHIVE', 'Archive'),
                        ('TRANSFER', 'Transfer to External Storage'),
                    ],
                    help_text='Method used to dispose of the record',
                    max_length=50
                )),
                ('disposal_certificate', models.FileField(blank=True, help_text='Certificate or proof of disposal', null=True, upload_to='disposals/')),
                ('notes', models.TextField(blank=True, help_text='Additional notes about the disposal process')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('disposed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='records_disposed', to=settings.AUTH_USER_MODEL)),
                ('record', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='disposals', to='documents.record')),
            ],
            options={
                'verbose_name': 'Record Disposal',
                'verbose_name_plural': 'Record Disposals',
                'ordering': ['-disposal_date'],
            },
        ),
    ]
