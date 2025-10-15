# Generated manually to add review cycle and archive functionality

from django.db import migrations, models
from datetime import timedelta


class Migration(migrations.Migration):

    dependencies = [
        ('legals', '0004_seed_default_positions'),
    ]

    operations = [
        # Add review cycle fields to LegalRegisterEntry
        migrations.AddField(
            model_name='legalregisterentry',
            name='last_review_date',
            field=models.DateField(null=True, blank=True, help_text='Date of last compliance review'),
        ),
        migrations.AddField(
            model_name='legalregisterentry',
            name='next_review_date',
            field=models.DateField(null=True, blank=True, help_text='Date when next review is due'),
        ),
        migrations.AddField(
            model_name='legalregisterentry',
            name='review_period_days',
            field=models.IntegerField(default=365, help_text='Review cycle in days (default: 365 for yearly)'),
        ),
        migrations.AddField(
            model_name='legalregisterentry',
            name='review_notes',
            field=models.TextField(blank=True, help_text='Notes from latest review'),
        ),
        
        # Add archive fields to LegalRegisterDocument
        migrations.AddField(
            model_name='legalregisterdocument',
            name='is_archived',
            field=models.BooleanField(default=False, help_text='Whether this document is archived'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='legalregisterdocument',
            name='archived_at',
            field=models.DateTimeField(null=True, blank=True, help_text='When this document was archived'),
        ),
        migrations.AddField(
            model_name='legalregisterdocument',
            name='review_year',
            field=models.IntegerField(null=True, blank=True, help_text='Year this evidence is associated with'),
        ),
        migrations.AddField(
            model_name='legalregisterdocument',
            name='document_type',
            field=models.CharField(
                max_length=50,
                blank=True,
                help_text='Type of evidence (e.g., Certificate, Inspection Report, Training Record)',
            ),
        ),
        migrations.AddField(
            model_name='legalregisterdocument',
            name='description',
            field=models.TextField(blank=True, help_text='Description of the evidence document'),
        ),
    ]

