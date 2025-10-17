"""
Management command to seed checklist templates for all audit types.
"""
from django.core.management.base import BaseCommand
from audits.models import AuditType, AuditChecklistTemplate, AuditChecklistCategory, AuditChecklistQuestion


class Command(BaseCommand):
    help = 'Seeds checklist templates for all audit types with basic questions'

    def handle(self, *args, **kwargs):
        # Get all audit types
        audit_types = AuditType.objects.filter(is_active=True)
        
        for audit_type in audit_types:
            # Skip if template already exists
            if AuditChecklistTemplate.objects.filter(audit_type=audit_type, version='1.0').exists():
                self.stdout.write(self.style.WARNING(f'Template already exists for {audit_type.name}'))
                continue
            
            # Create basic template
            template = AuditChecklistTemplate.objects.create(
                audit_type=audit_type,
                name=f'{audit_type.name} Checklist v1.0',
                description=f'Standard checklist for {audit_type.name.lower()}',
                version='1.0',
                is_active=True
            )
            
            # Create basic categories (can be customized later via admin)
            basic_categories = [
                {
                    'section_number': 1,
                    'category_name': 'General Requirements',
                    'description': 'General audit requirements and compliance',
                    'questions': [
                        {'ref': '1.1', 'letter': 'a', 'text': 'Are all required documents available and up to date?'},
                        {'ref': '1.1', 'letter': 'b', 'text': 'Is the organization structure clearly defined?'},
                        {'ref': '1.1', 'letter': 'c', 'text': 'Are roles and responsibilities documented?'},
                    ]
                },
                {
                    'section_number': 2,
                    'category_name': 'Policy & Procedures',
                    'description': 'Policies and standard operating procedures',
                    'questions': [
                        {'ref': '2.1', 'letter': 'a', 'text': 'Are relevant policies in place and accessible?'},
                        {'ref': '2.1', 'letter': 'b', 'text': 'Are procedures followed consistently?'},
                        {'ref': '2.1', 'letter': 'c', 'text': 'Is there evidence of policy communication to staff?'},
                    ]
                },
                {
                    'section_number': 3,
                    'category_name': 'Training & Competence',
                    'description': 'Training programs and competence assurance',
                    'questions': [
                        {'ref': '3.1', 'letter': 'a', 'text': 'Are training records maintained for all personnel?'},
                        {'ref': '3.1', 'letter': 'b', 'text': 'Is competency verified before task assignment?'},
                        {'ref': '3.1', 'letter': 'c', 'text': 'Are refresher trainings conducted regularly?'},
                    ]
                },
                {
                    'section_number': 4,
                    'category_name': 'Monitoring & Measurement',
                    'description': 'Performance monitoring and measurement systems',
                    'questions': [
                        {'ref': '4.1', 'letter': 'a', 'text': 'Are performance indicators defined and tracked?'},
                        {'ref': '4.1', 'letter': 'b', 'text': 'Is monitoring data analyzed and acted upon?'},
                        {'ref': '4.1', 'letter': 'c', 'text': 'Are monitoring results communicated to stakeholders?'},
                    ]
                },
                {
                    'section_number': 5,
                    'category_name': 'Continuous Improvement',
                    'description': 'Improvement processes and corrective actions',
                    'questions': [
                        {'ref': '5.1', 'letter': 'a', 'text': 'Is there a process for identifying improvement opportunities?'},
                        {'ref': '5.1', 'letter': 'b', 'text': 'Are corrective actions tracked and verified?'},
                        {'ref': '5.1', 'letter': 'c', 'text': 'Is there evidence of lessons learned implementation?'},
                    ]
                },
            ]
            
            # Create categories and questions
            for cat_data in basic_categories:
                category = AuditChecklistCategory.objects.create(
                    template=template,
                    section_number=cat_data['section_number'],
                    category_name=cat_data['category_name'],
                    description=cat_data['description'],
                    order=cat_data['section_number']
                )
                
                # Create questions
                for idx, q_data in enumerate(cat_data['questions'], 1):
                    AuditChecklistQuestion.objects.create(
                        category=category,
                        subsection_name='',
                        reference_number=q_data['ref'],
                        question_letter=q_data['letter'],
                        question_text=q_data['text'],
                        expected_response_type='TEXT',
                        is_mandatory=True,
                        order=idx
                    )
            
            question_count = AuditChecklistQuestion.objects.filter(category__template=template).count()
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Created template for {audit_type.name} with 5 categories and {question_count} questions'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 All audit type templates created!'
                f'\nYou can customize them via: http://localhost:8000/admin/audits/auditchecklisttemplate/'
            )
        )

