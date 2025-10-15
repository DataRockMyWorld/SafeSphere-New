# Generated manually to seed Ghana HSSE laws

from django.db import migrations


def seed_ghana_hsse_laws(apps, schema_editor):
    """Seed default Ghana HSSE laws and regulations"""
    LawResource = apps.get_model('legals', 'LawResource')
    LawCategory = apps.get_model('legals', 'LawCategory')
    
    # Get categories
    try:
        health_safety = LawCategory.objects.get(name='Health and Safety')
        environmental = LawCategory.objects.get(name='Environmental Protection')
        labor = LawCategory.objects.get(name='Labor and Employment')
        fire_safety = LawCategory.objects.get(name='Fire Safety')
        hazmat = LawCategory.objects.get(name='Hazardous Materials')
    except LawCategory.DoesNotExist:
        # If categories don't exist, skip seeding
        return
    
    ghana_laws = [
        {
            'title': 'Labour Act, 2003',
            'act_number': 'Act 651',
            'country': 'GH',
            'category': labor,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Labour Department of Ghana',
            'authority_contact': 'Ministry of Employment and Labour Relations',
            'effective_date': '2003-03-07',
            'summary': 'Comprehensive labour legislation covering employment relationships, working conditions, occupational safety and health, and dispute resolution.',
            'key_provisions': '''
- Part XV: Occupational Safety and Health
- Section 118: Employer's duty to ensure safe workplace
- Section 119: Worker's right to refuse unsafe work
- Section 120: Safety and health committees
- Section 121: Accident reporting requirements
            ''',
            'penalties': 'Fine not exceeding 1000 penalty units or imprisonment up to 3 years',
            'applicability': 'All employers and workers in Ghana, with specific exemptions',
            'official_url': 'https://www.ilo.org/dyn/natlex/docs/ELECTRONIC/64092/99945/F1005045299/GHA64092.pdf',
        },
        {
            'title': 'Factories, Offices and Shops Act, 1970',
            'act_number': 'Act 328',
            'country': 'GH',
            'category': health_safety,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Chief Factory Inspector, Labour Department',
            'authority_contact': 'Ministry of Employment and Labour Relations',
            'effective_date': '1970-04-01',
            'summary': 'Regulates safety, health and welfare in factories, offices and shops. Covers workplace standards, machinery safety, and working conditions.',
            'key_provisions': '''
- Section 5: Registration of factories
- Section 14: Cleanliness requirements
- Section 16: Ventilation standards
- Section 24: Machinery safety guards
- Section 29: First aid provisions
- Section 87: Factory inspections
            ''',
            'penalties': 'Fine and/or imprisonment for contraventions',
            'applicability': 'Factories, offices, and shops employing workers',
            'official_url': '',
            'amendment_history': 'Amended by Act 651 (Labour Act) provisions',
        },
        {
            'title': 'Environmental Protection Agency Act, 1994',
            'act_number': 'Act 490',
            'country': 'GH',
            'category': environmental,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Environmental Protection Agency (EPA)',
            'authority_contact': 'EPA Ghana, P.O. Box MB 326, Accra',
            'effective_date': '1994-12-31',
            'summary': 'Establishes EPA and provides framework for environmental protection and management. Requires environmental permits and impact assessments.',
            'key_provisions': '''
- Section 12: Environmental Impact Assessment (EIA) required
- Section 14: Environmental permits mandatory
- Section 15: Pollution control measures
- Section 20: Hazardous waste management
- Section 22: Public participation requirements
            ''',
            'penalties': 'Fine not less than GHS 5,000 or imprisonment not exceeding 2 years, or both',
            'applicability': 'All undertakings with potential environmental impact',
            'official_url': '',
        },
        {
            'title': 'Minerals and Mining Act, 2006',
            'act_number': 'Act 703',
            'country': 'GH',
            'category': health_safety,
            'jurisdiction': 'industrial',
            'is_repealed': False,
            'enforcement_authority': 'Minerals Commission and Inspectorate Division',
            'authority_contact': 'Minerals Commission of Ghana',
            'effective_date': '2006-03-15',
            'summary': 'Regulates mining operations including health, safety and environmental obligations specific to mining sector.',
            'key_provisions': '''
- Section 74: Health and safety obligations
- Section 75: Mine rescue and emergency preparedness
- Section 76: Compensation for mining accidents
- Section 95: Environmental management plans required
- Section 96: Mine closure and rehabilitation
            ''',
            'penalties': 'Substantial fines and potential license revocation',
            'applicability': 'All mining operations and mineral processing',
            'official_url': '',
        },
        {
            'title': 'Workmen\'s Compensation Act, 1987',
            'act_number': 'Act 187 (PNDCL 187)',
            'country': 'GH',
            'category': health_safety,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Labour Department',
            'authority_contact': 'Ministry of Employment and Labour Relations',
            'effective_date': '1987-06-10',
            'summary': 'Provides compensation for workers who suffer injuries or occupational diseases arising out of and in the course of employment.',
            'key_provisions': '''
- Section 1: Employer liability for workplace injuries
- Section 4: Compensation for death
- Section 5: Compensation for permanent disability
- Section 8: Occupational disease coverage
- Schedule 2: List of occupational diseases
            ''',
            'penalties': 'Failure to maintain insurance: Fine and/or imprisonment',
            'applicability': 'All employers with one or more employees',
            'official_url': '',
        },
        {
            'title': 'Hazardous and Electronic Waste Control and Management Act, 2016',
            'act_number': 'Act 917',
            'country': 'GH',
            'category': hazmat,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Environmental Protection Agency (EPA)',
            'authority_contact': 'EPA Ghana',
            'effective_date': '2016-06-15',
            'summary': 'Regulates the generation, collection, treatment, recycling, recovery and final disposal of hazardous and electronic waste.',
            'key_provisions': '''
- Section 8: Prohibition on importation of hazardous waste
- Section 11: Licensing requirements for waste handlers
- Section 14: Manifest system for tracking waste
- Section 22: Emergency response requirements
- Section 28: Record keeping obligations
            ''',
            'penalties': 'Fine between GHS 12,000-60,000 or imprisonment 5-10 years, or both',
            'applicability': 'Generators, transporters, and processors of hazardous waste',
            'official_url': '',
        },
        {
            'title': 'Fire Precaution (Premises) Regulations, 2003',
            'act_number': 'L.I. 1724',
            'country': 'GH',
            'category': fire_safety,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Ghana National Fire Service',
            'authority_contact': 'GNFS Headquarters, Accra',
            'effective_date': '2003-06-01',
            'summary': 'Prescribes fire safety measures for premises including fire prevention, fire-fighting equipment, and emergency evacuation procedures.',
            'key_provisions': '''
- Regulation 4: Fire certificate requirements
- Regulation 9: Maintenance of fire-fighting equipment
- Regulation 11: Fire drills and evacuation plans
- Regulation 14: Inspection requirements
- Regulation 18: Record keeping
            ''',
            'penalties': 'Fine and/or imprisonment for non-compliance',
            'applicability': 'Public buildings, workplaces, places of assembly',
            'official_url': '',
        },
        {
            'title': 'Environmental Assessment Regulations, 1999',
            'act_number': 'L.I. 1652',
            'country': 'GH',
            'category': environmental,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Environmental Protection Agency (EPA)',
            'authority_contact': 'EPA Ghana',
            'effective_date': '1999-06-22',
            'summary': 'Provides procedures for environmental impact assessment of undertakings that may have adverse effects on the environment.',
            'key_provisions': '''
- Regulation 5: List of undertakings requiring EIA
- Regulation 15: EIA report requirements
- Regulation 18: Public hearing procedures
- Regulation 21: Environmental permits
- Regulation 25: Monitoring and compliance
            ''',
            'penalties': 'As per EPA Act 490',
            'applicability': 'Projects requiring environmental permits',
            'official_url': '',
        },
        {
            'title': 'Occupational Safety and Health Policy, 2020',
            'act_number': 'Policy Document',
            'country': 'GH',
            'category': health_safety,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Labour Department, Occupational Safety and Health Division',
            'authority_contact': 'Ministry of Employment and Labour Relations',
            'effective_date': '2020-01-01',
            'summary': 'National policy framework for occupational safety and health, providing guidance for workplace safety management.',
            'key_provisions': '''
- Worker protection standards
- Employer responsibilities
- Safety management systems
- Hazard identification and risk assessment
- Training and awareness requirements
            ''',
            'penalties': 'Enforced through Labour Act provisions',
            'applicability': 'All workplaces in Ghana',
            'official_url': '',
        },
        {
            'title': 'Water Resources Commission Act, 1996',
            'act_number': 'Act 522',
            'country': 'GH',
            'category': environmental,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Water Resources Commission',
            'authority_contact': 'WRC Ghana, Accra',
            'effective_date': '1996-08-01',
            'summary': 'Regulates water use, prevents pollution of water bodies, and requires permits for water abstraction and discharge.',
            'key_provisions': '''
- Section 13: Water use permits required
- Section 15: Prohibition on water pollution
- Section 16: Effluent discharge standards
- Section 22: Monitoring and reporting
            ''',
            'penalties': 'Fine and/or imprisonment for violations',
            'applicability': 'Industries abstracting or discharging water',
            'official_url': '',
        },
        {
            'title': 'Pesticides Control and Management Act, 1996',
            'act_number': 'Act 528',
            'country': 'GH',
            'category': hazmat,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'EPA - Pesticides and Chemicals Division',
            'authority_contact': 'EPA Ghana',
            'effective_date': '1996-08-14',
            'summary': 'Controls the importation, manufacture, sale, storage and use of pesticides to protect human health and the environment.',
            'key_provisions': '''
- Section 5: Registration of pesticides
- Section 10: Storage requirements
- Section 13: Licensing of dealers
- Section 17: Safe use requirements
- Section 20: Emergency response
            ''',
            'penalties': 'Fine and/or imprisonment',
            'applicability': 'Importers, manufacturers, dealers and users of pesticides',
            'official_url': '',
        },
        {
            'title': 'Mining (Health, Safety and Technical) Regulations, 2012',
            'act_number': 'L.I. 2182',
            'country': 'GH',
            'category': health_safety,
            'jurisdiction': 'industrial',
            'is_repealed': False,
            'enforcement_authority': 'Inspectorate Division, Minerals Commission',
            'authority_contact': 'Minerals Commission',
            'effective_date': '2012-11-01',
            'summary': 'Detailed regulations for health and safety in mining operations including ground control, ventilation, explosives, and emergency preparedness.',
            'key_provisions': '''
- Regulation 12: Health and safety management system
- Regulation 45: Ground control in underground mines
- Regulation 78: Ventilation requirements
- Regulation 120: Explosives handling
- Regulation 145: Emergency preparedness plans
- Regulation 160: Accident investigation
            ''',
            'penalties': 'Fines and potential mine closure',
            'applicability': 'All mining operations (surface and underground)',
            'official_url': '',
        },
        {
            'title': 'Chemicals Act, 2000',
            'act_number': 'Act 586',
            'country': 'GH',
            'category': hazmat,
            'jurisdiction': 'national',
            'is_repealed': False,
            'enforcement_authority': 'Environmental Protection Agency',
            'authority_contact': 'EPA Ghana - Chemicals Control Division',
            'effective_date': '2000-12-20',
            'summary': 'Provides for the management of chemicals including manufacture, importation, exportation, sale, storage, transportation and use.',
            'key_provisions': '''
- Section 5: Chemical registration
- Section 8: Import/export permits
- Section 14: Labeling requirements
- Section 18: Safety data sheets (SDS)
- Section 24: Storage and handling standards
- Section 30: Emergency planning
            ''',
            'penalties': 'Fine not exceeding 5000 penalty units or imprisonment not exceeding 5 years',
            'applicability': 'All persons dealing with industrial chemicals',
            'official_url': '',
        },
    ]
    
    for law_data in ghana_laws:
        LawResource.objects.get_or_create(
            title=law_data['title'],
            act_number=law_data['act_number'],
            defaults=law_data
        )


def remove_ghana_hsse_laws(apps, schema_editor):
    """Remove seeded Ghana laws if migration is reversed"""
    LawResource = apps.get_model('legals', 'LawResource')
    
    law_titles = [
        'Labour Act, 2003',
        'Factories, Offices and Shops Act, 1970',
        'Environmental Protection Agency Act, 1994',
        'Minerals and Mining Act, 2006',
        'Workmen\'s Compensation Act, 1987',
        'Hazardous and Electronic Waste Control and Management Act, 2016',
        'Fire Precaution (Premises) Regulations, 2003',
        'Environmental Assessment Regulations, 1999',
        'Occupational Safety and Health Policy, 2020',
        'Water Resources Commission Act, 1996',
        'Pesticides Control and Management Act, 1996',
        'Mining (Health, Safety and Technical) Regulations, 2012',
        'Chemicals Act, 2000',
    ]
    
    LawResource.objects.filter(title__in=law_titles, country='GH').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('legals', '0006_enhance_law_library'),
    ]

    operations = [
        migrations.RunPython(seed_ghana_hsse_laws, remove_ghana_hsse_laws),
    ]

