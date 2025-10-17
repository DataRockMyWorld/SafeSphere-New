"""
Comprehensive tests for PPE models and inventory management.
Tests cover inventory calculations, PO generation, expiry tracking, and concurrency.
"""
import pytest
from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from ppes.models import (
    PPECategory, Vendor, PPEPurchase, PPEInventory, PPEIssue,
    PPERequest, PPEDamageReport, PPETransfer, PPEReturn, PPEPurchaseReceipt
)
from datetime import date, timedelta
from decimal import Decimal
from freezegun import freeze_time

User = get_user_model()


class PPECategoryTests(TestCase):
    """Tests for PPECategory model."""
    
    def test_create_ppe_category(self):
        """Test creating a PPE category."""
        category = PPECategory.objects.create(
            name='Hard Hat',
            description='Protective headgear',
            lifespan_months=12,
            low_stock_threshold=10
        )
        
        assert category.name == 'Hard Hat'
        assert category.lifespan_months == 12
        assert category.is_active is True
    
    def test_calculate_expiry_date_from_issue_date(self):
        """Test calculating expiry date from issue date."""
        category = PPECategory.objects.create(
            name='Safety Boots',
            lifespan_months=18
        )
        
        issue_date = date(2025, 1, 1)
        expiry_date = category.calculate_expiry_date(issue_date)
        
        # 18 months = 540 days (approx)
        expected = issue_date + timedelta(days=30 * 18)
        assert expiry_date == expected
    
    def test_calculate_expiry_date_defaults_to_today(self):
        """Test expiry calculation defaults to today if no date provided."""
        category = PPECategory.objects.create(
            name='Gloves',
            lifespan_months=6
        )
        
        expiry_date = category.calculate_expiry_date()
        
        expected = date.today() + timedelta(days=30 * 6)
        assert expiry_date == expected


class VendorTests(TestCase):
    """Tests for Vendor model."""
    
    def test_create_vendor(self):
        """Test creating a vendor."""
        vendor = Vendor.objects.create(
            name='Safety Supplies Ltd',
            contact_person='John Doe',
            phone_number='+233123456789',
            email='contact@safetysupplies.com'
        )
        
        assert vendor.name == 'Safety Supplies Ltd'
        assert vendor.is_active is True
    
    def test_vendor_str_returns_name(self):
        """Test vendor string representation."""
        vendor = Vendor.objects.create(
            name='Safety Supplies Ltd',
            phone_number='+233123456789'
        )
        
        assert str(vendor) == 'Safety Supplies Ltd'


class PPEPurchaseTests(TestCase):
    """Tests for PPEPurchase model."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        
        self.vendor = Vendor.objects.create(
            name='Safety Supplies Ltd',
            phone_number='+233123456789'
        )
        
        self.category = PPECategory.objects.create(
            name='Hard Hat',
            lifespan_months=12
        )
    
    def test_create_purchase(self):
        """Test creating a PPE purchase."""
        purchase = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=100,
            cost_per_unit=Decimal('50.00'),
            total_cost=Decimal('5000.00'),
            purchase_date=date.today()
        )
        
        assert purchase.status == 'PENDING'
        assert purchase.quantity == 100
    
    def test_purchase_auto_calculates_total_cost(self):
        """Test purchase automatically calculates total cost."""
        purchase = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=50,
            cost_per_unit=Decimal('25.00'),
            purchase_date=date.today()
        )
        
        assert purchase.total_cost == Decimal('1250.00')
    
    @freeze_time("2025-01-15")
    def test_purchase_auto_generates_po_number(self):
        """Test purchase automatically generates PO number."""
        purchase = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=50,
            cost_per_unit=Decimal('25.00'),
            purchase_date=date.today()
        )
        
        assert purchase.purchase_order_number.startswith('PO-2025-')
    
    @freeze_time("2025-01-15")
    def test_po_number_increments_sequentially(self):
        """Test PO numbers increment sequentially."""
        purchase1 = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=50,
            cost_per_unit=Decimal('25.00'),
            purchase_date=date.today()
        )
        
        purchase2 = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=30,
            cost_per_unit=Decimal('20.00'),
            purchase_date=date.today()
        )
        
        assert purchase1.purchase_order_number == 'PO-2025-0001'
        assert purchase2.purchase_order_number == 'PO-2025-0002'
    
    def test_is_received_property(self):
        """Test is_received property."""
        purchase = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=50,
            cost_per_unit=Decimal('25.00'),
            purchase_date=date.today(),
            status='RECEIVED'
        )
        
        assert purchase.is_received is True
    
    def test_can_receive_property(self):
        """Test can_receive property."""
        purchase_confirmed = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=50,
            cost_per_unit=Decimal('25.00'),
            purchase_date=date.today(),
            status='CONFIRMED'
        )
        
        purchase_pending = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=30,
            cost_per_unit=Decimal('20.00'),
            purchase_date=date.today(),
            status='PENDING'
        )
        
        assert purchase_confirmed.can_receive is True
        assert purchase_pending.can_receive is False


class PPEInventoryTests(TestCase):
    """Tests for PPEInventory model and calculations."""
    
    def setUp(self):
        """Set up test data."""
        self.category = PPECategory.objects.create(
            name='Safety Goggles',
            lifespan_months=12,
            low_stock_threshold=20
        )
    
    def test_create_inventory(self):
        """Test creating inventory record."""
        inventory = PPEInventory.objects.create(
            ppe_category=self.category,
            total_received=100,
            total_issued=30,
            total_damaged=5,
            total_expired=10,
            current_stock=55
        )
        
        assert inventory.current_stock == 55
    
    def test_is_low_stock_when_below_threshold(self):
        """Test is_low_stock returns True when below threshold."""
        inventory = PPEInventory.objects.create(
            ppe_category=self.category,
            current_stock=15  # Below threshold of 20
        )
        
        assert inventory.is_low_stock is True
    
    def test_is_low_stock_when_above_threshold(self):
        """Test is_low_stock returns False when above threshold."""
        inventory = PPEInventory.objects.create(
            ppe_category=self.category,
            current_stock=25  # Above threshold of 20
        )
        
        assert inventory.is_low_stock is False
    
    def test_update_stock_levels_calculates_correctly(self):
        """Test update_stock_levels calculates current stock correctly."""
        inventory = PPEInventory.objects.create(
            ppe_category=self.category,
            total_received=200,
            total_issued=80,
            total_damaged=10,
            total_expired=5,
            current_stock=0  # Wrong value
        )
        
        inventory.update_stock_levels()
        
        # 200 - 80 - 10 - 5 = 105
        assert inventory.current_stock == 105
    
    def test_inventory_calculation_with_zero_values(self):
        """Test inventory calculation with all zeros."""
        inventory = PPEInventory.objects.create(
            ppe_category=self.category,
            total_received=0,
            total_issued=0,
            total_damaged=0,
            total_expired=0
        )
        
        inventory.update_stock_levels()
        
        assert inventory.current_stock == 0
    
    def test_inventory_calculation_negative_result_handled(self):
        """Test inventory handles negative results (over-issued scenario)."""
        inventory = PPEInventory.objects.create(
            ppe_category=self.category,
            total_received=100,
            total_issued=120,  # More issued than received
            total_damaged=0,
            total_expired=0
        )
        
        inventory.update_stock_levels()
        
        # Should handle negative (data inconsistency)
        assert inventory.current_stock == -20


class PPEIssueTests(TestCase):
    """Tests for PPE issue tracking."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='employee@example.com',
            first_name='Test',
            last_name='Employee',
            phone_number='1234567890',
            password='testpass123'
        )
        
        self.issuer = User.objects.create_user(
            email='issuer@example.com',
            first_name='PPE',
            last_name='Manager',
            phone_number='0987654321',
            password='testpass123'
        )
        
        self.category = PPECategory.objects.create(
            name='Safety Vest',
            lifespan_months=24
        )
    
    def test_create_ppe_issue(self):
        """Test creating a PPE issue."""
        issue = PPEIssue.objects.create(
            employee=self.user,
            ppe_category=self.category,
            quantity=1,
            issue_date=date.today(),
            expiry_date=date.today() + timedelta(days=730),
            issued_by=self.issuer
        )
        
        assert issue.status == 'ACTIVE'
        assert issue.employee == self.user
    
    def test_issue_auto_calculates_expiry_date(self):
        """Test issue automatically calculates expiry date."""
        issue_date = date(2025, 1, 1)
        
        issue = PPEIssue.objects.create(
            employee=self.user,
            ppe_category=self.category,
            quantity=1,
            issue_date=issue_date,
            issued_by=self.issuer
            # No expiry_date provided
        )
        
        expected_expiry = issue_date + timedelta(days=30 * 24)
        assert issue.expiry_date == expected_expiry
    
    @freeze_time("2025-06-01")
    def test_is_expired_returns_true_when_expired(self):
        """Test is_expired returns True for expired PPE."""
        issue = PPEIssue.objects.create(
            employee=self.user,
            ppe_category=self.category,
            quantity=1,
            issue_date=date(2023, 1, 1),
            expiry_date=date(2025, 5, 1),  # Expired
            issued_by=self.issuer
        )
        
        assert issue.is_expired is True
    
    @freeze_time("2025-06-01")
    def test_is_expired_returns_false_when_not_expired(self):
        """Test is_expired returns False for valid PPE."""
        issue = PPEIssue.objects.create(
            employee=self.user,
            ppe_category=self.category,
            quantity=1,
            issue_date=date(2025, 1, 1),
            expiry_date=date(2025, 12, 31),  # Not expired
            issued_by=self.issuer
        )
        
        assert issue.is_expired is False
    
    @freeze_time("2025-06-01")
    def test_days_until_expiry_calculation(self):
        """Test days_until_expiry calculates correctly."""
        issue = PPEIssue.objects.create(
            employee=self.user,
            ppe_category=self.category,
            quantity=1,
            issue_date=date(2025, 1, 1),
            expiry_date=date(2025, 6, 11),  # 10 days from now
            issued_by=self.issuer
        )
        
        assert issue.days_until_expiry == 10
    
    @freeze_time("2025-06-01")
    def test_days_until_expiry_negative_when_expired(self):
        """Test days_until_expiry is negative for expired PPE."""
        issue = PPEIssue.objects.create(
            employee=self.user,
            ppe_category=self.category,
            quantity=1,
            issue_date=date(2025, 1, 1),
            expiry_date=date(2025, 5, 25),  # 7 days ago
            issued_by=self.issuer
        )
        
        assert issue.days_until_expiry == -7


class PPERequestTests(TestCase):
    """Tests for PPE request workflow."""
    
    def setUp(self):
        """Set up test data."""
        self.employee = User.objects.create_user(
            email='employee@example.com',
            first_name='Test',
            last_name='Employee',
            phone_number='1234567890',
            password='testpass123'
        )
        
        self.approver = User.objects.create_user(
            email='manager@example.com',
            first_name='PPE',
            last_name='Manager',
            phone_number='0987654321',
            password='testpass123',
            position='HSSE MANAGER'
        )
        
        self.category = PPECategory.objects.create(
            name='Safety Helmet',
            lifespan_months=12
        )
    
    def test_create_ppe_request(self):
        """Test creating a PPE request."""
        request = PPERequest.objects.create(
            employee=self.employee,
            ppe_category=self.category,
            quantity=1,
            reason='Current helmet damaged',
            urgency='HIGH'
        )
        
        assert request.status == 'PENDING'
        assert request.urgency == 'HIGH'
    
    def test_approve_ppe_request(self):
        """Test approving a PPE request."""
        request = PPERequest.objects.create(
            employee=self.employee,
            ppe_category=self.category,
            quantity=1,
            reason='Need PPE'
        )
        
        request.status = 'APPROVED'
        request.approved_by = self.approver
        request.approved_at = timezone.now()
        request.save()
        
        assert request.status == 'APPROVED'
        assert request.approved_by == self.approver
    
    def test_reject_ppe_request_with_reason(self):
        """Test rejecting a PPE request with reason."""
        request = PPERequest.objects.create(
            employee=self.employee,
            ppe_category=self.category,
            quantity=1,
            reason='Need PPE'
        )
        
        request.status = 'REJECTED'
        request.rejection_reason = 'Insufficient justification'
        request.save()
        
        assert request.status == 'REJECTED'
        assert request.rejection_reason == 'Insufficient justification'


class PPEPurchaseReceiptTests(TestCase):
    """Tests for PPE purchase receipt and inventory updates."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='receiver@example.com',
            first_name='Warehouse',
            last_name='Manager',
            phone_number='1234567890',
            password='testpass123'
        )
        
        self.vendor = Vendor.objects.create(
            name='Safety Supplies Ltd',
            phone_number='+233123456789'
        )
        
        self.category = PPECategory.objects.create(
            name='Safety Boots',
            lifespan_months=18
        )
        
        self.purchase = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=100,
            cost_per_unit=Decimal('75.00'),
            purchase_date=date.today(),
            status='CONFIRMED'
        )
    
    def test_create_purchase_receipt_updates_purchase_status(self):
        """Test creating receipt updates purchase status to RECEIVED."""
        receipt = PPEPurchaseReceipt.objects.create(
            purchase=self.purchase,
            received_quantity=100,
            received_date=date.today(),
            received_by=self.user,
            quality_check_passed=True
        )
        
        self.purchase.refresh_from_db()
        assert self.purchase.status == 'RECEIVED'
        assert self.purchase.actual_delivery_date == date.today()
    
    def test_create_receipt_updates_inventory(self):
        """Test creating receipt updates inventory levels."""
        receipt = PPEPurchaseReceipt.objects.create(
            purchase=self.purchase,
            received_quantity=100,
            received_date=date.today(),
            received_by=self.user
        )
        
        inventory = PPEInventory.objects.get(ppe_category=self.category)
        assert inventory.total_received == 100
        assert inventory.current_stock == 100
    
    def test_receipt_with_damaged_items_updates_inventory_correctly(self):
        """Test receipt with damaged items updates inventory correctly."""
        receipt = PPEPurchaseReceipt.objects.create(
            purchase=self.purchase,
            received_quantity=100,
            damaged_quantity=10,
            received_date=date.today(),
            received_by=self.user
        )
        
        inventory = PPEInventory.objects.get(ppe_category=self.category)
        # Should add 90 (100 - 10 damaged)
        assert inventory.total_received == 90
        assert inventory.current_stock == 90
    
    def test_multiple_receipts_accumulate_inventory(self):
        """Test multiple receipts accumulate inventory correctly."""
        # Create first receipt
        receipt1 = PPEPurchaseReceipt.objects.create(
            purchase=self.purchase,
            received_quantity=100,
            received_date=date.today(),
            received_by=self.user
        )
        
        # Create second purchase and receipt
        purchase2 = PPEPurchase.objects.create(
            vendor=self.vendor,
            ppe_category=self.category,
            quantity=50,
            cost_per_unit=Decimal('75.00'),
            purchase_date=date.today(),
            status='CONFIRMED'
        )
        
        receipt2 = PPEPurchaseReceipt.objects.create(
            purchase=purchase2,
            received_quantity=50,
            received_date=date.today(),
            received_by=self.user
        )
        
        inventory = PPEInventory.objects.get(ppe_category=self.category)
        assert inventory.total_received == 150
        assert inventory.current_stock == 150


class PPEConcurrencyTests(TransactionTestCase):
    """Tests for concurrent PPE operations (race conditions)."""
    
    def setUp(self):
        """Set up test data."""
        self.category = PPECategory.objects.create(
            name='Safety Gloves',
            lifespan_months=6
        )
        
        self.inventory = PPEInventory.objects.create(
            ppe_category=self.category,
            total_received=100,
            current_stock=100
        )
    
    def test_concurrent_inventory_updates(self):
        """Test concurrent inventory updates maintain consistency."""
        # Simulate two concurrent issues
        def issue_ppe():
            with transaction.atomic():
                inventory = PPEInventory.objects.select_for_update().get(
                    ppe_category=self.category
                )
                inventory.total_issued += 10
                inventory.current_stock -= 10
                inventory.save()
        
        # Execute updates
        issue_ppe()
        issue_ppe()
        
        self.inventory.refresh_from_db()
        assert self.inventory.total_issued == 20
        assert self.inventory.current_stock == 80


class PPEEdgeCasesTests(TestCase):
    """Tests for edge cases and boundary conditions."""
    
    def test_zero_quantity_purchase(self):
        """Test handling of zero quantity purchase."""
        category = PPECategory.objects.create(name='Test', lifespan_months=12)
        vendor = Vendor.objects.create(name='Test Vendor', phone_number='123')
        
        # This should ideally be prevented by validation
        purchase = PPEPurchase.objects.create(
            vendor=vendor,
            ppe_category=category,
            quantity=0,
            cost_per_unit=Decimal('10.00'),
            purchase_date=date.today()
        )
        
        assert purchase.total_cost == Decimal('0.00')
    
    def test_negative_inventory_scenario(self):
        """Test handling when issued exceeds received (data inconsistency)."""
        category = PPECategory.objects.create(name='Test', lifespan_months=12)
        
        inventory = PPEInventory.objects.create(
            ppe_category=category,
            total_received=50,
            total_issued=70  # More than received
        )
        
        inventory.update_stock_levels()
        
        # Should allow negative (indicates problem)
        assert inventory.current_stock == -20
    
    def test_very_large_quantities(self):
        """Test handling of very large quantities."""
        category = PPECategory.objects.create(name='Test', lifespan_months=12)
        vendor = Vendor.objects.create(name='Test Vendor', phone_number='123')
        
        purchase = PPEPurchase.objects.create(
            vendor=vendor,
            ppe_category=category,
            quantity=1000000,
            cost_per_unit=Decimal('0.50'),
            purchase_date=date.today()
        )
        
        assert purchase.total_cost == Decimal('500000.00')
    
    @freeze_time("2025-01-01")
    def test_issue_on_same_day_as_expiry(self):
        """Test PPE issued on exact expiry date."""
        user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123'
        )
        
        category = PPECategory.objects.create(name='Test', lifespan_months=12)
        
        issue = PPEIssue.objects.create(
            employee=user,
            ppe_category=category,
            issue_date=date(2025, 1, 1),
            expiry_date=date(2025, 1, 1),
            issued_by=user
        )
        
        assert issue.days_until_expiry == 0
        # Should be considered expired (>) not (>=)
        assert issue.is_expired is False

