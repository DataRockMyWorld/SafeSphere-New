from django.contrib import admin
from .models import (
    LawCategory, LawResource, LawResourceChange,
    LegalRegisterEntry, LegalRegisterComment, LegalRegisterDocument, Position, LegislationTracker
)

@admin.register(LawCategory)
class LawCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    ordering = ('name',)

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
    list_display = ('name',)
    search_fields = ('name',)
    ordering = ('name',)

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
