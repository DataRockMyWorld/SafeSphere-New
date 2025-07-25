from rest_framework import serializers
from .models import (
    PPECategory, Vendor, PPEPurchase, PPEInventory, PPEIssue, 
    PPERequest, PPEDamageReport, PPETransfer, PPEReturn, PPEPurchaseReceipt
)
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model in PPE context."""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'position', 'department']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class PPECategorySerializer(serializers.ModelSerializer):
    """Serializer for PPE Category."""
    default_image_url = serializers.SerializerMethodField()
    current_stock = serializers.SerializerMethodField()
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = PPECategory
        fields = '__all__'
    
    def get_default_image_url(self, obj):
        if obj.default_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.default_image.url)
            return obj.default_image.url
        return None
    
    def get_current_stock(self, obj):
        try:
            return obj.inventory.current_stock
        except PPEInventory.DoesNotExist:
            return 0
    
    def get_is_low_stock(self, obj):
        try:
            return obj.inventory.is_low_stock
        except PPEInventory.DoesNotExist:
            return False


class VendorSerializer(serializers.ModelSerializer):
    """Serializer for Vendor."""
    vendor_documents_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = '__all__'
    
    def get_vendor_documents_url(self, obj):
        if obj.vendor_documents:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.vendor_documents.url)
            return obj.vendor_documents.url
        return None


class PPEPurchaseSerializer(serializers.ModelSerializer):
    """Serializer for PPE Purchase."""
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    ppe_category_name = serializers.CharField(source='ppe_category.name', read_only=True)
    received_by_name = serializers.CharField(source='received_by.get_full_name', read_only=True)
    receipt_document_url = serializers.SerializerMethodField()
    is_received = serializers.SerializerMethodField()
    can_receive = serializers.SerializerMethodField()
    
    class Meta:
        model = PPEPurchase
        fields = '__all__'
        read_only_fields = ['purchase_order_number', 'total_cost', 'status', 'actual_delivery_date', 'received_by']
    
    def get_receipt_document_url(self, obj):
        if obj.receipt_document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt_document.url)
            return obj.receipt_document.url
        return None
    
    def get_is_received(self, obj):
        """Get the is_received property value."""
        return obj.is_received
    
    def get_can_receive(self, obj):
        """Get the can_receive property value."""
        return obj.can_receive
    
    def validate(self, data):
        """Validate purchase data."""
        if data.get('quantity', 0) <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        
        if data.get('cost_per_unit', 0) <= 0:
            raise serializers.ValidationError("Cost per unit must be greater than 0.")
        
        return data


class PPEPurchaseReceiptSerializer(serializers.ModelSerializer):
    """Serializer for PPE Purchase Receipt."""
    purchase_order_number = serializers.CharField(source='purchase.purchase_order_number', read_only=True)
    vendor_name = serializers.CharField(source='purchase.vendor.name', read_only=True)
    ppe_category_name = serializers.CharField(source='purchase.ppe_category.name', read_only=True)
    received_by_name = serializers.CharField(source='received_by.get_full_name', read_only=True)
    
    class Meta:
        model = PPEPurchaseReceipt
        fields = '__all__'
        read_only_fields = ['purchase']
    
    def validate(self, data):
        """Validate receipt data."""
        purchase = data.get('purchase')
        received_quantity = data.get('received_quantity', 0)
        damaged_quantity = data.get('damaged_quantity', 0)
        
        if received_quantity <= 0:
            raise serializers.ValidationError("Received quantity must be greater than 0.")
        
        if damaged_quantity > received_quantity:
            raise serializers.ValidationError("Damaged quantity cannot exceed received quantity.")
        
        if purchase and received_quantity > purchase.quantity:
            raise serializers.ValidationError("Received quantity cannot exceed ordered quantity.")
        
        return data


class PPEInventorySerializer(serializers.ModelSerializer):
    """Serializer for PPE Inventory."""
    ppe_category_name = serializers.CharField(source='ppe_category.name', read_only=True)
    ppe_category = PPECategorySerializer(read_only=True)
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = PPEInventory
        fields = [
            'id', 'ppe_category', 'ppe_category_name', 'total_received', 
            'total_issued', 'total_damaged', 'total_expired', 'current_stock', 
            'last_updated', 'is_low_stock'
        ]
    
    def get_is_low_stock(self, obj):
        """Get the is_low_stock property value."""
        return obj.is_low_stock


class PPEIssueSerializer(serializers.ModelSerializer):
    """Serializer for PPE Issue."""
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    ppe_category_name = serializers.CharField(source='ppe_category.name', read_only=True)
    issued_by_name = serializers.CharField(source='issued_by.get_full_name', read_only=True)
    is_expired = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    
    class Meta:
        model = PPEIssue
        fields = [
            'id', 'employee', 'employee_name', 'ppe_category', 'ppe_category_name',
            'quantity', 'issue_date', 'expiry_date', 'issued_by', 'issued_by_name',
            'status', 'notes', 'created_at', 'updated_at', 'is_expired', 'days_until_expiry'
        ]
    
    def get_is_expired(self, obj):
        """Get the is_expired property value."""
        return obj.is_expired
    
    def get_days_until_expiry(self, obj):
        """Get the days_until_expiry property value."""
        return obj.days_until_expiry
    
    def validate(self, data):
        """Validate issue data."""
        if data.get('quantity', 0) <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        
        # Check if there's enough stock
        ppe_category = data.get('ppe_category')
        if ppe_category:
            try:
                inventory = ppe_category.inventory
                if inventory.current_stock < data.get('quantity', 0):
                    raise serializers.ValidationError(
                        f"Insufficient stock. Available: {inventory.current_stock}, Requested: {data.get('quantity', 0)}"
                    )
            except PPEInventory.DoesNotExist:
                raise serializers.ValidationError("No inventory found for this PPE category.")
        
        return data


class PPERequestSerializer(serializers.ModelSerializer):
    """Serializer for PPE Request."""
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    ppe_category_name = serializers.CharField(source='ppe_category.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = PPERequest
        fields = '__all__'
        read_only_fields = ['employee', 'status', 'approved_by', 'approved_at', 'rejection_reason']
    
    def validate(self, data):
        """Validate request data."""
        if data.get('quantity', 0) <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        
        return data


class PPERequestApprovalSerializer(serializers.ModelSerializer):
    """Serializer for PPE Request approval/rejection."""
    
    class Meta:
        model = PPERequest
        fields = ['status', 'rejection_reason']
    
    def validate(self, data):
        """Validate approval data."""
        status = data.get('status')
        rejection_reason = data.get('rejection_reason')
        
        if status == 'REJECTED' and not rejection_reason:
            raise serializers.ValidationError("Rejection reason is required when rejecting a request.")
        
        return data


class PPEDamageReportSerializer(serializers.ModelSerializer):
    """Serializer for PPE Damage Report."""
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    ppe_category_name = serializers.CharField(source='ppe_issue.ppe_category.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    damage_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PPEDamageReport
        fields = '__all__'
        read_only_fields = ['reviewed_by', 'reviewed_at', 'is_approved', 'replacement_issued']
    
    def get_damage_image_url(self, obj):
        if obj.damage_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.damage_image.url)
            return obj.damage_image.url
        return None


class PPEDamageReportReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviewing PPE Damage Report."""
    
    class Meta:
        model = PPEDamageReport
        fields = ['is_approved', 'replacement_issued']


class PPETransferSerializer(serializers.ModelSerializer):
    """Serializer for PPE Transfer."""
    from_employee_name = serializers.CharField(source='from_employee.get_full_name', read_only=True)
    to_employee_name = serializers.CharField(source='to_employee.get_full_name', read_only=True)
    ppe_category_name = serializers.CharField(source='ppe_issue.ppe_category.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = PPETransfer
        fields = [
            'id', 'from_employee', 'from_employee_name', 'to_employee', 'to_employee_name',
            'ppe_issue', 'ppe_category_name', 'transfer_date', 'reason', 'status',
            'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'approved_by', 'approved_at', 'rejection_reason']
    
    def validate(self, data):
        """Validate transfer data."""
        from_employee = data.get('from_employee')
        to_employee = data.get('to_employee')
        
        if from_employee == to_employee:
            raise serializers.ValidationError("Cannot transfer PPE to the same employee.")
        
        return data


class PPETransferApprovalSerializer(serializers.ModelSerializer):
    """Serializer for PPE Transfer approval/rejection."""
    
    class Meta:
        model = PPETransfer
        fields = ['status', 'rejection_reason']
    
    def validate(self, data):
        """Validate approval data."""
        status = data.get('status')
        rejection_reason = data.get('rejection_reason')
        
        if status == 'REJECTED' and not rejection_reason:
            raise serializers.ValidationError("Rejection reason is required when rejecting a transfer.")
        
        return data


class PPEReturnSerializer(serializers.ModelSerializer):
    """Serializer for PPE Return."""
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    ppe_category_name = serializers.CharField(source='ppe_issue.ppe_category.name', read_only=True)
    received_by_name = serializers.CharField(source='received_by.get_full_name', read_only=True)
    
    class Meta:
        model = PPEReturn
        fields = [
            'id', 'employee', 'employee_name', 'ppe_issue', 'ppe_category_name',
            'return_date', 'return_reason', 'condition', 'received_by', 'received_by_name',
            'notes', 'created_at'
        ]


# Dashboard and Reporting Serializers
class PPEStockPositionSerializer(serializers.Serializer):
    """Serializer for PPE stock position summary."""
    ppe_category = PPECategorySerializer()
    total_received = serializers.IntegerField()
    total_issued = serializers.IntegerField()
    total_damaged = serializers.IntegerField()
    total_expired = serializers.IntegerField()
    current_stock = serializers.IntegerField()
    is_low_stock = serializers.BooleanField()


class PPEMovementSerializer(serializers.Serializer):
    """Serializer for PPE movement summary."""
    ppe_category = PPECategorySerializer()
    total_received = serializers.IntegerField()
    total_issued = serializers.IntegerField()
    movement_period = serializers.CharField()  # e.g., "This Month", "Last Month"


class PPEMostRequestedSerializer(serializers.Serializer):
    """Serializer for most requested PPE items."""
    ppe_category = PPECategorySerializer()
    request_count = serializers.IntegerField()
    total_quantity_requested = serializers.IntegerField()


class PPECostAnalysisSerializer(serializers.Serializer):
    """Serializer for PPE cost analysis."""
    ppe_category = PPECategorySerializer()
    total_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_cost_per_unit = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_units_purchased = serializers.IntegerField()


class PPEExpiryAlertSerializer(serializers.Serializer):
    """Serializer for PPE expiry alerts."""
    ppe_issue = PPEIssueSerializer()
    days_until_expiry = serializers.IntegerField()
    is_expired = serializers.BooleanField()


class PPELowStockAlertSerializer(serializers.Serializer):
    """Serializer for PPE low stock alerts."""
    ppe_category = PPECategorySerializer()
    current_stock = serializers.IntegerField()
    threshold = serializers.IntegerField()


class PPEUserStockSerializer(serializers.Serializer):
    """Serializer for user's current PPE stock."""
    employee = UserSerializer()
    ppe_items = PPEIssueSerializer(many=True)
    total_items = serializers.IntegerField()


# Bulk Operation Serializers
class BulkPPEIssueSerializer(serializers.Serializer):
    """Serializer for bulk PPE issuance."""
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of employee IDs"
    )
    ppe_category_id = serializers.IntegerField()
    quantity_per_employee = serializers.IntegerField(default=1)
    issue_date = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True)


class BulkPPERequestApprovalSerializer(serializers.Serializer):
    """Serializer for bulk PPE request approval."""
    request_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of request IDs to approve"
    )
    status = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True) 