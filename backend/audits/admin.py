"""
Django admin configuration for Audit Management System.
"""
from django.contrib import admin
from audits.models import (
    AuditScoringCriteria, AuditType, AuditChecklistTemplate, AuditChecklistCategory, 
    AuditChecklistQuestion, AuditQuestionResponse, ISOClause45001, AuditPlan, 
    AuditChecklist, AuditChecklistResponse, AuditFinding, CAPA, AuditEvidence, 
    AuditReport, CAPAProgressUpdate, AuditMeeting, AuditComment, CompanySettings
)


@admin.register(AuditScoringCriteria)
class AuditScoringCriteriaAdmin(admin.ModelAdmin):
    """Admin for audit scoring criteria."""
    
    list_display = ['display_name', 'finding_type', 'score_percentage', 'color_code', 'is_active']
    list_filter = ['is_active', 'color_code']
    search_fields = ['display_name', 'definition']
    readonly_fields = ['finding_type']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('finding_type', 'display_name', 'color_code', 'score_percentage')
        }),
        ('Definition & Guidelines', {
            'fields': ('definition', 'action_required', 'examples')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(AuditType)
class AuditTypeAdmin(admin.ModelAdmin):
    """Admin for configurable audit types."""
    
    list_display = ['name', 'code', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'description')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# =============================
# Checklist Template Admin
# =============================
class AuditChecklistQuestionInline(admin.TabularInline):
    """Inline for adding questions to categories."""
    model = AuditChecklistQuestion
    extra = 1
    fields = ['subsection_name', 'reference_number', 'question_letter', 'question_text', 'weight', 'expected_response_type', 'is_mandatory', 'order']
    ordering = ['order', 'reference_number', 'question_letter']


class AuditChecklistCategoryInline(admin.TabularInline):
    """Inline for adding categories to templates."""
    model = AuditChecklistCategory
    extra = 1
    fields = ['section_number', 'category_name', 'weight', 'description', 'order']
    ordering = ['order', 'section_number']
    show_change_link = True


@admin.register(AuditChecklistTemplate)
class AuditChecklistTemplateAdmin(admin.ModelAdmin):
    """Admin for audit checklist templates."""
    
    list_display = ['name', 'audit_type', 'version', 'is_active', 'created_at']
    list_filter = ['audit_type', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'audit_type__name']
    ordering = ['audit_type', '-version']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [AuditChecklistCategoryInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('audit_type', 'name', 'description', 'version')
        }),
        ('Status', {
            'fields': ('is_active', 'created_by')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(AuditChecklistCategory)
class AuditChecklistCategoryAdmin(admin.ModelAdmin):
    """Admin for audit checklist categories."""
    
    list_display = ['section_number', 'category_name', 'template', 'weight', 'order', 'question_count']
    list_filter = ['template']
    search_fields = ['category_name', 'description']
    ordering = ['template', 'order', 'section_number']
    inlines = [AuditChecklistQuestionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('template', 'section_number', 'category_name', 'description')
        }),
        ('Weighting & Ordering', {
            'fields': ('weight', 'order'),
            'description': 'Weight must sum to 100% across all categories in the template'
        }),
    )
    
    def question_count(self, obj):
        return obj.questions.count()
    question_count.short_description = 'Questions'


@admin.register(AuditChecklistQuestion)
class AuditChecklistQuestionAdmin(admin.ModelAdmin):
    """Admin for audit checklist questions."""
    
    list_display = ['full_reference', 'question_text_short', 'category', 'weight', 'expected_response_type', 'is_mandatory']
    list_filter = ['category__template', 'expected_response_type', 'is_mandatory']
    search_fields = ['question_text', 'reference_number', 'subsection_name']
    ordering = ['category', 'order', 'reference_number', 'question_letter']
    
    fieldsets = (
        ('Question Details', {
            'fields': ('category', 'subsection_name', 'reference_number', 'question_letter', 'question_text')
        }),
        ('Response Configuration', {
            'fields': ('expected_response_type', 'is_mandatory', 'help_text')
        }),
        ('Weighting & Ordering', {
            'fields': ('weight', 'order'),
            'description': 'Weight must sum to 100% across all questions in the category'
        }),
    )
    
    def question_text_short(self, obj):
        return obj.question_text[:80] + '...' if len(obj.question_text) > 80 else obj.question_text
    question_text_short.short_description = 'Question'


@admin.register(AuditQuestionResponse)
class AuditQuestionResponseAdmin(admin.ModelAdmin):
    """Admin for audit question responses."""
    
    list_display = ['finding', 'question', 'compliance_status', 'created_at']
    list_filter = ['compliance_status', 'created_at']
    search_fields = ['finding__finding_code', 'question__question_text', 'answer_text']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Response Details', {
            'fields': ('finding', 'question', 'answer_text', 'compliance_status')
        }),
        ('Additional Information', {
            'fields': ('notes', 'evidence_files')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ISOClause45001)
class ISOClause45001Admin(admin.ModelAdmin):
    """Admin for ISO 45001 clauses."""
    
    list_display = ['clause_number', 'title', 'parent_clause', 'is_mandatory', 'risk_category']
    list_filter = ['is_mandatory', 'risk_category']
    search_fields = ['clause_number', 'title', 'description']
    ordering = ['clause_number']


@admin.register(AuditPlan)
class AuditPlanAdmin(admin.ModelAdmin):
    """Admin for audit plans."""
    
    list_display = ['audit_code', 'title', 'audit_type', 'status', 'planned_start_date', 'lead_auditor']
    list_filter = ['audit_type', 'status', 'planned_start_date']
    search_fields = ['audit_code', 'title', 'scope_description']
    readonly_fields = ['audit_code', 'created_at', 'updated_at']
    filter_horizontal = ['audit_team', 'iso_clauses']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('audit_code', 'title', 'audit_type', 'status')
        }),
        ('Scope', {
            'fields': ('scope_description', 'departments', 'processes', 'locations', 'iso_clauses')
        }),
        ('Schedule', {
            'fields': ('planned_start_date', 'planned_end_date', 'actual_start_date', 'actual_end_date')
        }),
        ('Team', {
            'fields': ('lead_auditor', 'audit_team')
        }),
        ('Details', {
            'fields': ('objectives', 'methodology', 'audit_criteria')
        }),
        ('Workflow', {
            'fields': ('created_by', 'approved_by', 'approved_at')
        }),
    )


@admin.register(AuditChecklist)
class AuditChecklistAdmin(admin.ModelAdmin):
    """Admin for audit checklist items."""
    
    list_display = ['audit_plan', 'sequence_order', 'question_text_short', 'iso_clause', 'is_mandatory', 'weight']
    list_filter = ['audit_plan', 'iso_clause', 'question_type', 'is_mandatory']
    search_fields = ['question_text', 'expected_evidence']
    ordering = ['audit_plan', 'sequence_order']
    
    def question_text_short(self, obj):
        return obj.question_text[:50] + '...' if len(obj.question_text) > 50 else obj.question_text
    question_text_short.short_description = 'Question'


@admin.register(AuditChecklistResponse)
class AuditChecklistResponseAdmin(admin.ModelAdmin):
    """Admin for checklist responses."""
    
    list_display = ['checklist_item', 'conformity_status', 'auditor', 'response_date']
    list_filter = ['conformity_status', 'response_date', 'auditor']
    search_fields = ['notes', 'evidence_description']
    readonly_fields = ['response_date', 'updated_at']


@admin.register(AuditFinding)
class AuditFindingAdmin(admin.ModelAdmin):
    """Admin for audit findings."""
    
    list_display = ['finding_code', 'title', 'finding_type', 'severity', 'status', 'department_affected', 'identified_date']
    list_filter = ['finding_type', 'severity', 'status', 'impact_assessment', 'requires_immediate_action']
    search_fields = ['finding_code', 'title', 'description', 'department_affected']
    readonly_fields = ['finding_code', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Identification', {
            'fields': ('finding_code', 'audit_plan', 'iso_clause', 'checklist_response')
        }),
        ('Finding Details', {
            'fields': ('finding_type', 'severity', 'title', 'description')
        }),
        ('Root Cause', {
            'fields': ('root_cause_analysis',)
        }),
        ('Impact', {
            'fields': ('impact_assessment', 'risk_level', 'department_affected', 'process_affected', 'location')
        }),
        ('Status', {
            'fields': ('status', 'requires_immediate_action')
        }),
        ('Metadata', {
            'fields': ('identified_by', 'identified_date', 'created_at', 'updated_at')
        }),
    )


@admin.register(CAPA)
class CAPAAdmin(admin.ModelAdmin):
    """Admin for CAPAs."""
    
    list_display = ['action_code', 'title', 'action_type', 'priority', 'status', 'responsible_person', 'target_completion_date', 'is_overdue']
    list_filter = ['action_type', 'priority', 'status', 'verification_method']
    search_fields = ['action_code', 'title', 'description']
    readonly_fields = ['action_code', 'assigned_date', 'created_at', 'updated_at', 'is_overdue', 'days_overdue']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('action_code', 'finding', 'action_type', 'title', 'description')
        }),
        ('Root Cause & Plan', {
            'fields': ('root_cause', 'action_plan')
        }),
        ('Assignment', {
            'fields': ('responsible_person', 'assigned_by', 'assigned_date', 'acknowledged_date')
        }),
        ('Timeline', {
            'fields': ('target_completion_date', 'actual_completion_date', 'is_overdue', 'days_overdue')
        }),
        ('Priority & Status', {
            'fields': ('priority', 'status', 'progress_percentage')
        }),
        ('Resources', {
            'fields': ('resources_required', 'cost_estimate')
        }),
        ('Verification', {
            'fields': ('effectiveness_criteria', 'verification_method', 'verification_date', 
                      'verified_by', 'verification_notes', 'is_effective')
        }),
        ('Extensions', {
            'fields': ('extension_requests',)
        }),
    )


@admin.register(AuditEvidence)
class AuditEvidenceAdmin(admin.ModelAdmin):
    """Admin for audit evidence."""
    
    list_display = ['title', 'file_type', 'uploaded_by', 'uploaded_at', 'audit_plan', 'finding']
    list_filter = ['file_type', 'is_confidential', 'uploaded_at']
    search_fields = ['title', 'description']
    readonly_fields = ['uploaded_at', 'file_size']


@admin.register(AuditReport)
class AuditReportAdmin(admin.ModelAdmin):
    """Admin for audit reports."""
    
    list_display = ['report_code', 'audit_plan', 'overall_conformity_score', 'status', 'report_date']
    list_filter = ['status', 'report_date']
    search_fields = ['report_code', 'executive_summary']
    readonly_fields = ['report_code', 'total_findings', 'major_ncs_count', 'minor_ncs_count', 
                      'observations_count', 'opportunities_count', 'created_at', 'updated_at']


@admin.register(CAPAProgressUpdate)
class CAPAProgressUpdateAdmin(admin.ModelAdmin):
    """Admin for CAPA progress updates."""
    
    list_display = ['capa', 'progress_percentage', 'updated_by', 'update_date']
    list_filter = ['update_date']
    search_fields = ['update_text', 'capa__action_code']
    readonly_fields = ['update_date']


@admin.register(AuditMeeting)
class AuditMeetingAdmin(admin.ModelAdmin):
    """Admin for audit meetings."""
    
    list_display = ['audit_plan', 'meeting_type', 'meeting_date', 'chairperson']
    list_filter = ['meeting_type', 'meeting_date']
    search_fields = ['audit_plan__audit_code', 'minutes']
    filter_horizontal = ['attendees']


@admin.register(AuditComment)
class AuditCommentAdmin(admin.ModelAdmin):
    """Admin for audit comments."""
    
    list_display = ['author', 'created_at', 'audit_plan', 'finding', 'capa']
    list_filter = ['created_at']
    search_fields = ['comment_text', 'author__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    """Admin for company settings."""
    list_display = ['company_name', 'email', 'phone', 'updated_at']
    fields = ['company_name', 'company_logo', 'address', 'phone', 'email', 'website']
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not CompanySettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion
        return False
