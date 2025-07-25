from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import PPEPurchase, PPEInventory, PPEIssue
from django.db import models


@receiver(post_save, sender=PPEPurchase)
def update_inventory_on_purchase(sender, instance, created, **kwargs):
    """Update inventory when a purchase is created or updated."""
    try:
        # Get or create inventory for this PPE category
        inventory, created_inventory = PPEInventory.objects.get_or_create(
            ppe_category=instance.ppe_category,
            defaults={
                'total_received': 0,
                'total_issued': 0,
                'total_damaged': 0,
                'total_expired': 0,
                'current_stock': 0
            }
        )
        
        # Calculate total received from all purchases for this category
        total_received = PPEPurchase.objects.filter(
            ppe_category=instance.ppe_category
        ).aggregate(total=models.Sum('quantity'))['total'] or 0
        
        # Update inventory
        inventory.total_received = total_received
        inventory.update_stock_levels()
        
    except Exception as e:
        print(f"Error updating inventory for purchase {instance.id}: {e}")


@receiver(post_delete, sender=PPEPurchase)
def update_inventory_on_purchase_delete(sender, instance, **kwargs):
    """Update inventory when a purchase is deleted."""
    try:
        inventory = PPEInventory.objects.get(ppe_category=instance.ppe_category)
        
        # Recalculate total received
        total_received = PPEPurchase.objects.filter(
            ppe_category=instance.ppe_category
        ).aggregate(total=models.Sum('quantity'))['total'] or 0
        
        inventory.total_received = total_received
        inventory.update_stock_levels()
        
    except PPEInventory.DoesNotExist:
        pass
    except Exception as e:
        print(f"Error updating inventory after purchase deletion: {e}")


@receiver(post_save, sender=PPEIssue)
def update_inventory_on_issue(sender, instance, created, **kwargs):
    """Update inventory when PPE is issued."""
    try:
        inventory = PPEInventory.objects.get(ppe_category=instance.ppe_category)
        
        # Calculate total issued from all active issues for this category
        total_issued = PPEIssue.objects.filter(
            ppe_category=instance.ppe_category,
            status='ACTIVE'
        ).aggregate(total=models.Sum('quantity'))['total'] or 0
        
        inventory.total_issued = total_issued
        inventory.update_stock_levels()
        
    except PPEInventory.DoesNotExist:
        pass
    except Exception as e:
        print(f"Error updating inventory for issue {instance.id}: {e}")


@receiver(post_delete, sender=PPEIssue)
def update_inventory_on_issue_delete(sender, instance, **kwargs):
    """Update inventory when PPE issue is deleted."""
    try:
        inventory = PPEInventory.objects.get(ppe_category=instance.ppe_category)
        
        # Recalculate total issued
        total_issued = PPEIssue.objects.filter(
            ppe_category=instance.ppe_category,
            status='ACTIVE'
        ).aggregate(total=models.Sum('quantity'))['total'] or 0
        
        inventory.total_issued = total_issued
        inventory.update_stock_levels()
        
    except PPEInventory.DoesNotExist:
        pass
    except Exception as e:
        print(f"Error updating inventory after issue deletion: {e}") 