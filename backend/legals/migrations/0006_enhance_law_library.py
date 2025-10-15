# Generated manually to enhance Law Library functionality

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('legals', '0005_add_review_cycle_and_archive'),
    ]

    operations = [
        # Add enhanced fields to LawResource
        migrations.AddField(
            model_name='lawresource',
            name='act_number',
            field=models.CharField(
                max_length=100,
                blank=True,
                help_text='Official Act/Law number (e.g., Act 490 of 1993)'
            ),
        ),
        migrations.AddField(
            model_name='lawresource',
            name='effective_date',
            field=models.DateField(
                null=True,
                blank=True,
                help_text='Date when this law became effective'
            ),
        ),
        migrations.AddField(
            model_name='lawresource',
            name='enactment_date',
            field=models.DateField(
                null=True,
                blank=True,
                help_text='Date when this law was enacted'
            ),
        ),
        migrations.AddField(
            model_name='lawresource',
            name='enforcement_authority',
            field=models.CharField(
                max_length=255,
                blank=True,
                help_text='Authority responsible for enforcement (e.g., EPA, Labour Department)'
            ),
        ),
        migrations.AddField(
            model_name='lawresource',
            name='authority_contact',
            field=models.CharField(
                max_length=255,
                blank=True,
                help_text='Contact information for enforcement authority'
            ),
        ),
        migrations.AddField(
            model_name='lawresource',
            name='amendment_history',
            field=models.TextField(
                blank=True,
                help_text='History of amendments to this law'
            ),
        ),
        migrations.AddField(
            model_name='lawresource',
            name='key_provisions',
            field=models.TextField(
                blank=True,
                help_text='Key provisions and requirements from this law'
            ),
        ),
        migrations.AddField(
            model_name='lawresource',
            name='penalties',
            field=models.TextField(
                blank=True,
                help_text='Penalties for non-compliance'
            ),
        ),
        migrations.AddField(
            model_name='lawresource',
            name='applicability',
            field=models.TextField(
                blank=True,
                help_text='Who/what this law applies to (e.g., mining operations, all workplaces)'
            ),
        ),
        migrations.AddField(
            model_name='lawresource',
            name='official_url',
            field=models.URLField(
                blank=True,
                help_text='Link to official government source'
            ),
        ),
    ]

