"""
Management command to send CAPA deadline reminders.
Run daily via cron or Celery Beat.
"""
from django.core.management.base import BaseCommand
from audits.models import CAPA
from audits.services import send_capa_deadline_approaching, send_capa_overdue_reminder
from datetime import date


class Command(BaseCommand):
    help = 'Send reminder emails for CAPAs approaching deadline or overdue'

    def handle(self, *args, **kwargs):
        # Get all active CAPAs
        capas = CAPA.objects.filter(
            status__in=['ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS']
        ).select_related('responsible_person', 'assigned_by', 'finding')
        
        sent_count = 0
        overdue_count = 0
        due_soon_count = 0
        
        for capa in capas:
            # Check if overdue
            if capa.is_overdue:
                if send_capa_overdue_reminder(capa):
                    sent_count += 1
                    overdue_count += 1
                    self.stdout.write(
                        self.style.ERROR(f'🚨 Overdue reminder: {capa.action_code} ({capa.days_overdue} days overdue)')
                    )
            
            # Check if due within 7 days
            elif capa.days_remaining <= 7:
                if send_capa_deadline_approaching(capa, capa.days_remaining):
                    sent_count += 1
                    due_soon_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'⏰ Due soon reminder: {capa.action_code} ({capa.days_remaining} days remaining)')
                    )
            
            # Check if due within 1 day (urgent)
            elif capa.days_remaining == 1:
                if send_capa_deadline_approaching(capa, 1):
                    sent_count += 1
                    self.stdout.write(
                        self.style.ERROR(f'🚨 URGENT: {capa.action_code} (due tomorrow!)')
                    )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n📧 CAPA Reminder Summary:'
                f'\n   Total reminders sent: {sent_count}'
                f'\n   Overdue reminders: {overdue_count}'
                f'\n   Due soon reminders: {due_soon_count}'
                f'\n\n✅ Reminder job complete!'
            )
        )
        
        if sent_count == 0:
            self.stdout.write(
                self.style.SUCCESS('✅ No reminders needed - all CAPAs on track!')
            )

