"""
Management command to validate that all weights sum to 100%.
"""
from django.core.management.base import BaseCommand
from audits.models import AuditChecklistTemplate, AuditChecklistCategory


class Command(BaseCommand):
    help = 'Validate that all weights sum to 100% in all templates'

    def handle(self, *args, **kwargs):
        templates = AuditChecklistTemplate.objects.filter(is_active=True)
        
        total_issues = 0
        
        for template in templates:
            self.stdout.write(f'\n📋 Validating: {template.name}')
            
            # Validate category weights
            is_valid, message = template.validate_weights()
            if not is_valid:
                self.stdout.write(self.style.ERROR(f'   ❌ Template: {message}'))
                total_issues += 1
            else:
                self.stdout.write(self.style.SUCCESS(f'   ✅ Template weights OK'))
            
            # Validate question weights in each category
            for category in template.categories.all():
                is_valid, message = category.validate_weights()
                if not is_valid:
                    self.stdout.write(
                        self.style.ERROR(f'   ❌ Category {category.section_number}: {message}')
                    )
                    total_issues += 1
        
        if total_issues == 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n🎉 All weights validated successfully!'
                    f'\n   No issues found.'
                    f'\n   System is ready for accurate scoring.'
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    f'\n⚠️  Found {total_issues} weight issues'
                    f'\n   Run: python manage.py auto_distribute_weights'
                    f'\n   To fix automatically.'
                )
            )

