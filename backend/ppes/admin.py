from django.contrib import admin
from .models import (
    PPECategory, Vendor, PPEPurchase, PPEInventory, PPEIssue, 
    PPERequest, PPEDamageReport, PPETransfer, PPEReturn
)


@admin.register(PPECategory)
class PPECategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'lifespan_months', 'low_stock_threshold', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'phone_number', 'email', 'country', 'is_active', 'created_at']
    list_filter = ['is_active', 'country', 'created_at']
    search_fields = ['name', 'contact_person', 'email', 'phone_number']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'contact_person', 'phone_number', 'email')
        }),
        ('Location', {
            'fields': ('address', 'country')
        }),
        ('Documents', {
            'fields': ('vendor_documents',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PPEPurchase)
class PPEPurchaseAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'ppe_category', 'quantity', 'cost_per_unit', 'total_cost', 'purchase_date', 'received_by']
    list_filter = ['purchase_date', 'vendor', 'ppe_category', 'received_by']
    search_fields = ['vendor__name', 'ppe_category__name', 'purchase_order_number', 'invoice_number']
    ordering = ['-purchase_date']
    readonly_fields = ['total_cost', 'created_at', 'updated_at']
    autocomplete_fields = ['vendor', 'ppe_category', 'received_by']
    date_hierarchy = 'purchase_date'


@admin.register(PPEInventory)
class PPEInventoryAdmin(admin.ModelAdmin):
    list_display = ['ppe_category', 'current_stock', 'total_received', 'total_issued', 'total_damaged', 'total_expired', 'is_low_stock', 'last_updated']
    list_filter = ['last_updated', 'ppe_category']
    search_fields = ['ppe_category__name']
    ordering = ['ppe_category__name']
    readonly_fields = ['last_updated']
    list_editable = ['current_stock']


@admin.register(PPEIssue)
class PPEIssueAdmin(admin.ModelAdmin):
    list_display = ['employee', 'ppe_category', 'quantity', 'issue_date', 'expiry_date', 'status', 'issued_by']
    list_filter = ['status', 'issue_date', 'expiry_date', 'ppe_category', 'issued_by']
    search_fields = ['employee__first_name', 'employee__last_name', 'ppe_category__name']
    ordering = ['-issue_date']
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['employee', 'ppe_category', 'issued_by']
    date_hierarchy = 'issue_date'


@admin.register(PPERequest)
class PPERequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'ppe_category', 'quantity', 'urgency', 'status', 'created_at']
    list_filter = ['status', 'urgency', 'created_at', 'ppe_category']
    search_fields = ['employee__first_name', 'employee__last_name', 'ppe_category__name', 'reason']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['employee', 'ppe_category', 'approved_by']
    actions = ['approve_requests', 'reject_requests']

    def approve_requests(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            status='APPROVED',
            approved_by=request.user,
            approved_at=timezone.now()
        )
        self.message_user(request, f'{updated} requests were approved.')
    approve_requests.short_description = "Approve selected requests"

    def reject_requests(self, request, queryset):
        updated = queryset.update(status='REJECTED')
        self.message_user(request, f'{updated} requests were rejected.')
    reject_requests.short_description = "Reject selected requests"


@admin.register(PPEDamageReport)
class PPEDamageReportAdmin(admin.ModelAdmin):
    list_display = ['employee', 'ppe_issue', 'damage_date', 'replacement_issued', 'reviewed_by', 'is_approved']
    list_filter = ['damage_date', 'replacement_issued', 'is_approved', 'reviewed_by']
    search_fields = ['employee__first_name', 'employee__last_name', 'damage_description']
    ordering = ['-reported_at']
    readonly_fields = ['reported_at']
    autocomplete_fields = ['employee', 'ppe_issue', 'reviewed_by']
    date_hierarchy = 'damage_date'


@admin.register(PPETransfer)
class PPETransferAdmin(admin.ModelAdmin):
    list_display = ['from_employee', 'to_employee', 'ppe_issue', 'transfer_date', 'status', 'approved_by']
    list_filter = ['status', 'transfer_date', 'approved_by']
    search_fields = ['from_employee__first_name', 'from_employee__last_name', 'to_employee__first_name', 'to_employee__last_name']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    autocomplete_fields = ['from_employee', 'to_employee', 'ppe_issue', 'approved_by']
    date_hierarchy = 'transfer_date'


@admin.register(PPEReturn)
class PPEReturnAdmin(admin.ModelAdmin):
    list_display = ['employee', 'ppe_issue', 'return_date', 'condition', 'received_by']
    list_filter = ['return_date', 'condition', 'received_by']
    search_fields = ['employee__first_name', 'employee__last_name', 'return_reason']
    ordering = ['-return_date']
    readonly_fields = ['created_at']
    autocomplete_fields = ['employee', 'ppe_issue', 'received_by']
    date_hierarchy = 'return_date'


# Customize admin site
admin.site.site_header = "SafeSphere PPE Management"
admin.site.site_title = "SafeSphere Admin"
admin.site.index_title = "PPE Management Administration"
