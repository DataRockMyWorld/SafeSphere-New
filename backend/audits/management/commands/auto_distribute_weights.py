"""
Management command to automatically distribute weights equally across categories and questions.
"""
from django.core.management.base import BaseCommand
from audits.models import AuditChecklistTemplate, AuditChecklistCategory, AuditChecklistQuestion
from decimal import Decimal


class Command(BaseCommand):
    help = 'Automatically distribute weights equally across all categories and questions'

    def handle(self, *args, **kwargs):
        templates = AuditChecklistTemplate.objects.filter(is_active=True)
        
        for template in templates:
            self.stdout.write(f'\n📋 Processing: {template.name}')
            
            # Distribute category weights equally
            categories = template.categories.all()
            if categories:
                category_weight = Decimal('100') / len(categories)
                for category in categories:
                    category.weight = category_weight
                    category.save()
                
                self.stdout.write(f'   ✅ {len(categories)} categories @ {category_weight:.2f}% each')
                
                # Distribute question weights equally within each category
                for category in categories:
                    questions = category.questions.all()
                    if questions:
                        question_weight = Decimal('100') / len(questions)
                        for question in questions:
                            question.weight = question_weight
                            question.save()
                        
                        self.stdout.write(
                            f'      Category {category.section_number}: '
                            f'{len(questions)} questions @ {question_weight:.2f}% each'
                        )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Weight distribution complete!'
                f'\n\n  All categories weighted equally within template'
                f'\n  All questions weighted equally within category'
                f'\n  You can manually adjust weights in admin if needed'
            )
        )

