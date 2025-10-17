"""
Factory classes for generating test data for PPE app.
"""
import factory
from factory.django import DjangoModelFactory
from decimal import Decimal
from datetime import date, timedelta
from ppes.models import (
    PPECategory, Vendor, PPEPurchase, PPEInventory, PPEIssue,
    PPERequest, PPEDamageReport, PPETransfer, PPEReturn, PPEPurchaseReceipt
)
from accounts.factories import UserFactory


class PPECategoryFactory(DjangoModelFactory):
    """Factory for creating PPECategory instances."""
    
    class Meta:
        model = PPECategory
    
    name = factory.Sequence(lambda n: f'PPE Category {n}')
    description = factory.Faker('paragraph', nb_sentences=2)
    lifespan_months = factory.Faker('random_int', min=6, max=24)
    low_stock_threshold = factory.Faker('random_int', min=5, max=20)
    is_active = True


class HardHatFactory(PPECategoryFactory):
    """Factory for creating Hard Hat PPE category."""
    
    name = 'Hard Hat'
    lifespan_months = 12
    low_stock_threshold = 10


class SafetyBootsFactory(PPECategoryFactory):
    """Factory for creating Safety Boots PPE category."""
    
    name = 'Safety Boots'
    lifespan_months = 18
    low_stock_threshold = 15


class SafetyGlovesFactory(PPECategoryFactory):
    """Factory for creating Safety Gloves PPE category."""
    
    name = 'Safety Gloves'
    lifespan_months = 6
    low_stock_threshold = 20


class VendorFactory(DjangoModelFactory):
    """Factory for creating Vendor instances."""
    
    class Meta:
        model = Vendor
    
    name = factory.Faker('company')
    contact_person = factory.Faker('name')
    phone_number = factory.Faker('phone_number')
    email = factory.Faker('email')
    address = factory.Faker('address')
    is_active = True


class PPEPurchaseFactory(DjangoModelFactory):
    """Factory for creating PPEPurchase instances."""
    
    class Meta:
        model = PPEPurchase
    
    vendor = factory.SubFactory(VendorFactory)
    ppe_category = factory.SubFactory(PPECategoryFactory)
    quantity = factory.Faker('random_int', min=10, max=200)
    cost_per_unit = factory.LazyFunction(lambda: Decimal(str(factory.Faker('random_int', min=10, max=200).generate({}))))
    purchase_date = factory.LazyFunction(date.today)
    status = 'PENDING'
    
    # Don't set total_cost or purchase_order_number - let the model generate them


class ConfirmedPurchaseFactory(PPEPurchaseFactory):
    """Factory for creating confirmed purchases."""
    
    status = 'CONFIRMED'


class ReceivedPurchaseFactory(PPEPurchaseFactory):
    """Factory for creating received purchases."""
    
    status = 'RECEIVED'
    received_by = factory.SubFactory(UserFactory)
    actual_delivery_date = factory.LazyFunction(date.today)


class PPEInventoryFactory(DjangoModelFactory):
    """Factory for creating PPEInventory instances."""
    
    class Meta:
        model = PPEInventory
    
    ppe_category = factory.SubFactory(PPECategoryFactory)
    total_received = factory.Faker('random_int', min=0, max=500)
    total_issued = factory.Faker('random_int', min=0, max=400)
    total_damaged = factory.Faker('random_int', min=0, max=50)
    total_expired = factory.Faker('random_int', min=0, max=50)
    current_stock = factory.LazyAttribute(
        lambda obj: obj.total_received - obj.total_issued - obj.total_damaged - obj.total_expired
    )


class PPEIssueFactory(DjangoModelFactory):
    """Factory for creating PPEIssue instances."""
    
    class Meta:
        model = PPEIssue
    
    employee = factory.SubFactory(UserFactory)
    ppe_category = factory.SubFactory(PPECategoryFactory)
    quantity = 1
    issue_date = factory.LazyFunction(date.today)
    expiry_date = factory.LazyAttribute(
        lambda obj: obj.issue_date + timedelta(days=30 * obj.ppe_category.lifespan_months)
    )
    issued_by = factory.SubFactory(UserFactory)
    status = 'ACTIVE'


class ExpiredPPEIssueFactory(PPEIssueFactory):
    """Factory for creating expired PPE issues."""
    
    status = 'EXPIRED'
    issue_date = factory.LazyFunction(lambda: date.today() - timedelta(days=365))
    expiry_date = factory.LazyFunction(lambda: date.today() - timedelta(days=30))


class PPERequestFactory(DjangoModelFactory):
    """Factory for creating PPERequest instances."""
    
    class Meta:
        model = PPERequest
    
    employee = factory.SubFactory(UserFactory)
    ppe_category = factory.SubFactory(PPECategoryFactory)
    quantity = 1
    reason = factory.Faker('paragraph', nb_sentences=2)
    urgency = 'MEDIUM'
    status = 'PENDING'


class UrgentPPERequestFactory(PPERequestFactory):
    """Factory for creating urgent PPE requests."""
    
    urgency = 'URGENT'
    reason = 'Immediate replacement required due to damage'


class ApprovedPPERequestFactory(PPERequestFactory):
    """Factory for creating approved PPE requests."""
    
    status = 'APPROVED'
    approved_by = factory.SubFactory(UserFactory)
    approved_at = factory.Faker('date_time_this_year')


class PPEDamageReportFactory(DjangoModelFactory):
    """Factory for creating PPEDamageReport instances."""
    
    class Meta:
        model = PPEDamageReport
    
    employee = factory.SubFactory(UserFactory)
    ppe_issue = factory.SubFactory(PPEIssueFactory)
    damage_description = factory.Faker('paragraph', nb_sentences=2)
    damage_date = factory.LazyFunction(date.today)
    replacement_issued = False


class PPETransferFactory(DjangoModelFactory):
    """Factory for creating PPETransfer instances."""
    
    class Meta:
        model = PPETransfer
    
    from_employee = factory.SubFactory(UserFactory)
    to_employee = factory.SubFactory(UserFactory)
    ppe_issue = factory.SubFactory(PPEIssueFactory)
    transfer_date = factory.LazyFunction(date.today)
    reason = factory.Faker('sentence')
    status = 'PENDING'


class ApprovedPPETransferFactory(PPETransferFactory):
    """Factory for creating approved PPE transfers."""
    
    status = 'APPROVED'
    approved_by = factory.SubFactory(UserFactory)
    approved_at = factory.Faker('date_time_this_year')


class PPEReturnFactory(DjangoModelFactory):
    """Factory for creating PPEReturn instances."""
    
    class Meta:
        model = PPEReturn
    
    employee = factory.SubFactory(UserFactory)
    ppe_issue = factory.SubFactory(PPEIssueFactory)
    return_date = factory.LazyFunction(date.today)
    return_reason = factory.Faker('sentence')
    condition = 'GOOD'
    received_by = factory.SubFactory(UserFactory)


class PPEPurchaseReceiptFactory(DjangoModelFactory):
    """Factory for creating PPEPurchaseReceipt instances."""
    
    class Meta:
        model = PPEPurchaseReceipt
    
    purchase = factory.SubFactory(ConfirmedPurchaseFactory)
    received_quantity = factory.LazyAttribute(lambda obj: obj.purchase.quantity)
    received_date = factory.LazyFunction(date.today)
    received_by = factory.SubFactory(UserFactory)
    quality_check_passed = True
    damaged_quantity = 0

