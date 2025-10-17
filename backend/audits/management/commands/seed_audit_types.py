"""
Management command to seed default audit types.
"""
from django.core.management.base import BaseCommand
from audits.models import AuditType


class Command(BaseCommand):
    help = 'Seeds the database with default audit types'

    def handle(self, *args, **kwargs):
        audit_types = [
            {
                'name': 'System Audit',
                'code': 'SYSTEM',
                'description': 'Comprehensive audit of the entire management system',
            },
            {
                'name': 'Compliance Audit',
                'code': 'COMPLIANCE',
                'description': 'Audit to verify compliance with regulatory requirements and standards',
            },
            {
                'name': 'Security Audit',
                'code': 'SECURITY',
                'description': 'Audit focusing on security controls and protocols',
            },
        ]

        created_count = 0
        updated_count = 0

        for audit_type_data in audit_types:
            audit_type, created = AuditType.objects.get_or_create(
                code=audit_type_data['code'],
                defaults={
                    'name': audit_type_data['name'],
                    'description': audit_type_data['description'],
                    'is_active': True,
                }
            )

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created audit type: {audit_type.name}')
                )
            else:
                # Update existing audit type
                audit_type.name = audit_type_data['name']
                audit_type.description = audit_type_data['description']
                audit_type.is_active = True
                audit_type.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated audit type: {audit_type.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSeeding complete! Created: {created_count}, Updated: {updated_count}'
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                'You can add more audit types via the Django admin panel.'
            )
        )

