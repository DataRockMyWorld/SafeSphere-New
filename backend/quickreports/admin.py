from django.contrib import admin
from .models import QuickReport


@admin.register(QuickReport)
class QuickReportAdmin(admin.ModelAdmin):
    list_display = ('report_number', 'report_type', 'title', 'severity', 'status', 'reported_by', 'incident_date', 'created_at')
    list_filter = ('report_type', 'severity', 'status', 'incident_date')
    search_fields = ('report_number', 'title', 'description', 'location')
    readonly_fields = ('report_number', 'created_at', 'updated_at', 'created_record')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Report Information', {
            'fields': ('report_number', 'report_type', 'title', 'severity', 'status')
        }),
        ('Incident Details', {
            'fields': ('description', 'location', 'incident_date', 'persons_involved', 'witnesses')
        }),
        ('Actions and Analysis', {
            'fields': ('immediate_actions_taken', 'contributing_factors')
        }),
        ('Attachments', {
            'fields': ('photo_evidence', 'additional_document')
        }),
        ('Workflow', {
            'fields': ('reported_by', 'reviewed_by', 'reviewed_at', 'review_comments', 'rejection_reason', 'created_record')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

