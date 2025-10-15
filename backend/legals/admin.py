from django.contrib import admin
from .models import (
    LawCategory, LawResource, LawResourceChange,
    LegalRegisterEntry, LegalRegisterComment, LegalRegisterDocument, Position, LegislationTracker
)

@admin.register(LawCategory)
class LawCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'resource_count', 'created_date')
    search_fields = ('name', 'description')
    ordering = ('name',)
    list_per_page = 20
    
    def resource_count(self, obj):
        """Show count of laws in this category"""
        return obj.resources.count()
    resource_count.short_description = 'Number of Laws'
    
    def created_date(self, obj):
        """Show when category was created"""
        if hasattr(obj, 'created_at'):
            return obj.created_at.strftime('%Y-%m-%d')
        return 'N/A'
    created_date.short_description = 'Created'
    
    fieldsets = (
        ('Category Information', {
            'fields': ('name', 'description')
        }),
    )

@admin.register(LawResource)
class LawResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'country', 'jurisdiction', 'is_repealed', 'created_at')
    list_filter = ('category', 'country', 'jurisdiction', 'is_repealed')
    search_fields = ('title', 'summary')
    ordering = ('-created_at',)

@admin.register(LegalRegisterEntry)
class LegalRegisterEntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'owner_department', 'compliance_status', 'last_updated')
    list_filter = ('category', 'owner_department', 'compliance_status', 'country')
    search_fields = ('title', 'regulatory_requirement', 'legal_obligation')
    ordering = ('-last_updated',)

@admin.register(LegalRegisterComment)
class LegalRegisterCommentAdmin(admin.ModelAdmin):
    list_display = ('entry', 'author', 'created_at')
    search_fields = ('entry__title', 'author__username', 'comment')
    ordering = ('-created_at',)

@admin.register(LegalRegisterDocument)
class LegalRegisterDocumentAdmin(admin.ModelAdmin):
    list_display = ('entry', 'document', 'uploaded_at')
    search_fields = ('entry__title',)
    ordering = ('-uploaded_at',)

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('name', 'assignment_count')
    search_fields = ('name',)
    ordering = ('name',)
    list_per_page = 20
    
    def assignment_count(self, obj):
        """Show count of obligations assigned to this position"""
        return obj.legal_register_assignments.count()
    assignment_count.short_description = 'Assigned Obligations'
    
    fieldsets = (
        ('Position Information', {
            'fields': ('name',),
            'description': 'HSSE positions that can be assigned compliance obligations'
        }),
    )

@admin.register(LegislationTracker)
class LegislationTrackerAdmin(admin.ModelAdmin):
    list_display = ('permit', 'license_number', 'issuing_authority', 'status', 'expiring_date')
    list_filter = ('status', 'issuing_authority')
    search_fields = ('permit', 'license_number', 'issuing_authority')
    ordering = ('-expiring_date',)

@admin.register(LawResourceChange)
class LawResourceChangeAdmin(admin.ModelAdmin):
    list_display = ('resource', 'changed_by', 'changed_at')
    search_fields = ('resource__title', 'changed_by__username', 'change_description')
    ordering = ('-changed_at',)
