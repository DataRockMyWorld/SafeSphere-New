from django.core.management.base import BaseCommand
from ppes.models import PPEPurchase, PPEInventory, PPECategory
from django.db import transaction
from django.db import models

class Command(BaseCommand):
    help = 'Update PPEInventory records based on all existing purchases.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Updating PPEInventory records from purchases...'))
        with transaction.atomic():
            for category in PPECategory.objects.all():
                total_received = PPEPurchase.objects.filter(ppe_category=category).aggregate(total=models.Sum('quantity'))['total'] or 0
                inventory, created = PPEInventory.objects.get_or_create(
                    ppe_category=category,
                    defaults={
                        'total_received': 0,
                        'total_issued': 0,
                        'total_damaged': 0,
                        'total_expired': 0,
                        'current_stock': 0
                    }
                )
                inventory.total_received = total_received
                inventory.update_stock_levels()
                inventory.save()
                self.stdout.write(self.style.SUCCESS(f'Updated inventory for {category.name}: total_received={total_received}'))
        self.stdout.write(self.style.SUCCESS('All inventory records updated.')) 