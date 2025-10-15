# Generated manually to seed default HSSE categories

from django.db import migrations


def create_default_categories(apps, schema_editor):
    """Create default HSSE compliance categories"""
    LawCategory = apps.get_model('legals', 'LawCategory')
    
    default_categories = [
        {
            'name': 'Health and Safety',
            'description': 'Workplace health and safety regulations, accident prevention, and employee wellness requirements'
        },
        {
            'name': 'Environmental Protection',
            'description': 'Environmental laws, emissions control, waste management, and pollution prevention'
        },
        {
            'name': 'Security',
            'description': 'Physical security, cybersecurity, and asset protection regulations'
        },
        {
            'name': 'Occupational Health',
            'description': 'Worker health monitoring, medical surveillance, and occupational disease prevention'
        },
        {
            'name': 'Fire Safety',
            'description': 'Fire prevention, fire protection systems, and emergency response regulations'
        },
        {
            'name': 'Hazardous Materials',
            'description': 'Chemical safety, hazardous material handling, storage, and disposal regulations'
        },
        {
            'name': 'Labor and Employment',
            'description': 'Employment law, working conditions, and labor rights compliance'
        },
        {
            'name': 'Emergency Preparedness',
            'description': 'Emergency response planning, business continuity, and disaster management'
        },
        {
            'name': 'Permits and Licenses',
            'description': 'Operating permits, environmental licenses, and regulatory authorizations'
        },
        {
            'name': 'Training and Certification',
            'description': 'Mandatory training requirements and professional certifications'
        },
        {
            'name': 'Reporting and Documentation',
            'description': 'Regulatory reporting requirements and record-keeping obligations'
        },
        {
            'name': 'Risk Assessment',
            'description': 'Risk assessment requirements and hazard identification regulations'
        },
    ]
    
    for category_data in default_categories:
        LawCategory.objects.get_or_create(
            name=category_data['name'],
            defaults={'description': category_data['description']}
        )


def remove_default_categories(apps, schema_editor):
    """Remove default categories if migration is reversed"""
    LawCategory = apps.get_model('legals', 'LawCategory')
    
    default_category_names = [
        'Health and Safety',
        'Environmental Protection',
        'Security',
        'Occupational Health',
        'Fire Safety',
        'Hazardous Materials',
        'Labor and Employment',
        'Emergency Preparedness',
        'Permits and Licenses',
        'Training and Certification',
        'Reporting and Documentation',
        'Risk Assessment',
    ]
    
    LawCategory.objects.filter(name__in=default_category_names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('legals', '0002_alter_lawcategory_options_alter_lawcategory_name'),
    ]

    operations = [
        migrations.RunPython(create_default_categories, remove_default_categories),
    ]

