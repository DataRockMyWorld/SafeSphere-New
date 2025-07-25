from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_countries.fields import CountryField
from datetime import timedelta

User = get_user_model()

class PPECategory(models.Model):
    """Model for different types of PPE."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    lifespan_months = models.PositiveIntegerField(help_text="Lifespan in months")
    default_image = models.ImageField(upload_to='ppe_categories/', blank=True, null=True)
    low_stock_threshold = models.PositiveIntegerField(default=5, help_text="Alert when stock falls below this number")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def calculate_expiry_date(self, issue_date=None):
        """Calculate expiry date based on lifespan."""
        if issue_date is None:
            issue_date = timezone.now().date()
        return issue_date + timedelta(days=30 * self.lifespan_months)

    class Meta:
        verbose_name_plural = "PPE Categories"
        ordering = ['name']


class Vendor(models.Model):
    """Model for PPE vendors/suppliers."""
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    country = CountryField(blank=True)
    vendor_documents = models.FileField(upload_to='vendor_documents/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class PPEPurchase(models.Model):
    """Model for tracking PPE purchases."""
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('SHIPPED', 'Shipped'),
        ('RECEIVED', 'Received'),
        ('CANCELLED', 'Cancelled'),
    )

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='purchases')
    ppe_category = models.ForeignKey(PPECategory, on_delete=models.CASCADE, related_name='purchases')
    quantity = models.PositiveIntegerField()
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    purchase_date = models.DateField()
    expected_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)
    purchase_order_number = models.CharField(max_length=50, blank=True, unique=True)
    invoice_number = models.CharField(max_length=50, blank=True)
    receipt_document = models.FileField(upload_to='ppe_purchase_receipts/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='ppe_purchases_received')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ppe_category.name} - {self.quantity} units - {self.vendor.name} - {self.status}"

    def save(self, *args, **kwargs):
        # Calculate total cost if not provided
        if not self.total_cost:
            self.total_cost = self.quantity * self.cost_per_unit
        
        # Generate PO number if not provided
        if not self.purchase_order_number:
            self.purchase_order_number = self.generate_po_number()
        
        super().save(*args, **kwargs)

    def generate_po_number(self):
        """Generate a unique PO number with format: PO-YYYY-XXXX"""
        from datetime import datetime
        
        current_year = datetime.now().year
        
        # Get the last PO number for this year
        last_po = PPEPurchase.objects.filter(
            purchase_order_number__startswith=f'PO-{current_year}-'
        ).order_by('-purchase_order_number').first()
        
        if last_po:
            # Extract the number part and increment
            try:
                last_number = int(last_po.purchase_order_number.split('-')[-1])
                new_number = last_number + 1
            except (ValueError, IndexError):
                new_number = 1
        else:
            new_number = 1
        
        # Format: PO-YYYY-XXXX (4-digit number)
        return f'PO-{current_year}-{new_number:04d}'

    @property
    def is_received(self):
        """Check if purchase has been received."""
        return self.status == 'RECEIVED'

    @property
    def can_receive(self):
        """Check if purchase can be received."""
        return self.status in ['CONFIRMED', 'SHIPPED']

    class Meta:
        ordering = ['-purchase_date']


class PPEInventory(models.Model):
    """Model for tracking current PPE inventory levels."""
    ppe_category = models.OneToOneField(PPECategory, on_delete=models.CASCADE, related_name='inventory')
    total_received = models.PositiveIntegerField(default=0)
    total_issued = models.PositiveIntegerField(default=0)
    total_damaged = models.PositiveIntegerField(default=0)
    total_expired = models.PositiveIntegerField(default=0)
    current_stock = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ppe_category.name} - Stock: {self.current_stock}"

    @property
    def is_low_stock(self):
        """Check if stock is below threshold."""
        return self.current_stock <= self.ppe_category.low_stock_threshold

    def update_stock_levels(self):
        """Update current stock based on received, issued, damaged, and expired."""
        self.current_stock = self.total_received - self.total_issued - self.total_damaged - self.total_expired
        self.save()

    class Meta:
        verbose_name_plural = "PPE Inventories"


class PPEIssue(models.Model):
    """Model for tracking PPE issued to employees."""
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('EXPIRED', 'Expired'),
        ('DAMAGED', 'Damaged'),
        ('RETURNED', 'Returned'),
        ('TRANSFERRED', 'Transferred'),
    )

    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ppe_issues')
    ppe_category = models.ForeignKey(PPECategory, on_delete=models.CASCADE, related_name='issues')
    quantity = models.PositiveIntegerField(default=1)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='ppe_issues_made')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.get_full_name} - {self.ppe_category.name} - {self.status}"

    def save(self, *args, **kwargs):
        # Calculate expiry date if not provided
        if not self.expiry_date:
            self.expiry_date = self.issue_date + timedelta(days=30 * self.ppe_category.lifespan_months)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        """Check if PPE is expired."""
        return timezone.now().date() > self.expiry_date

    @property
    def days_until_expiry(self):
        """Calculate days until expiry."""
        return (self.expiry_date - timezone.now().date()).days

    class Meta:
        ordering = ['-issue_date']


class PPERequest(models.Model):
    """Model for employee PPE requests."""
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ISSUED', 'Issued'),
    )

    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ppe_requests')
    ppe_category = models.ForeignKey(PPECategory, on_delete=models.CASCADE, related_name='requests')
    quantity = models.PositiveIntegerField(default=1)
    reason = models.TextField()
    urgency = models.CharField(max_length=20, choices=[
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ], default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ppe_requests_approved')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.get_full_name} - {self.ppe_category.name} - {self.status}"

    class Meta:
        ordering = ['-created_at']


class PPEDamageReport(models.Model):
    """Model for reporting damaged PPE."""
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ppe_damage_reports')
    ppe_issue = models.ForeignKey(PPEIssue, on_delete=models.CASCADE, related_name='damage_reports')
    damage_description = models.TextField()
    damage_date = models.DateField()
    damage_image = models.ImageField(upload_to='ppe_damage_reports/', blank=True, null=True)
    reported_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ppe_damage_reports_reviewed')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    is_approved = models.BooleanField(null=True, blank=True)
    replacement_issued = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.employee.get_full_name} - {self.ppe_issue.ppe_category.name} - {self.damage_date}"

    class Meta:
        ordering = ['-reported_at']


class PPETransfer(models.Model):
    """Model for tracking PPE transfers between employees."""
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
    )

    from_employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ppe_transfers_from')
    to_employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ppe_transfers_to')
    ppe_issue = models.ForeignKey(PPEIssue, on_delete=models.CASCADE, related_name='transfers')
    transfer_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ppe_transfers_approved')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.from_employee.get_full_name} → {self.to_employee.get_full_name} - {self.ppe_issue.ppe_category.name}"

    class Meta:
        ordering = ['-created_at']


class PPEReturn(models.Model):
    """Model for tracking PPE returns."""
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ppe_returns')
    ppe_issue = models.ForeignKey(PPEIssue, on_delete=models.CASCADE, related_name='returns')
    return_date = models.DateField()
    return_reason = models.TextField()
    condition = models.CharField(max_length=20, choices=[
        ('GOOD', 'Good'),
        ('FAIR', 'Fair'),
        ('POOR', 'Poor'),
        ('DAMAGED', 'Damaged'),
    ])
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='ppe_returns_received')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.get_full_name} - {self.ppe_issue.ppe_category.name} - {self.return_date}"

    class Meta:
        ordering = ['-return_date']


class PPEPurchaseReceipt(models.Model):
    """Model for tracking when purchase orders are received."""
    purchase = models.OneToOneField(PPEPurchase, on_delete=models.CASCADE, related_name='receipt')
    received_quantity = models.PositiveIntegerField()
    received_date = models.DateField()
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='ppe_receipts_processed')
    quality_check_passed = models.BooleanField(default=True)
    damaged_quantity = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Receipt for {self.purchase.purchase_order_number} - {self.received_quantity} units"

    def save(self, *args, **kwargs):
        # Update the purchase status to RECEIVED
        if not self.purchase.is_received:
            self.purchase.status = 'RECEIVED'
            self.purchase.actual_delivery_date = self.received_date
            self.purchase.received_by = self.received_by
            self.purchase.save()
        
        # Update inventory with received quantity (minus damaged)
        net_quantity = self.received_quantity - self.damaged_quantity
        if net_quantity > 0:
            inventory, created = PPEInventory.objects.get_or_create(
                ppe_category=self.purchase.ppe_category,
                defaults={
                    'total_received': net_quantity,
                    'current_stock': net_quantity
                }
            )
            if not created:
                inventory.total_received += net_quantity
                inventory.current_stock += net_quantity
                inventory.save()
        
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-received_date']
