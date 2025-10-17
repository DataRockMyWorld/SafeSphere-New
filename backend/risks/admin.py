"""
Django admin configuration for Risk Management System.
"""
from django.contrib import admin
from risks.models import (
    RiskAssessment, RiskHazard, RiskExposure, ControlBarrier,
    RiskTreatmentAction, RiskReview, RiskAttachment, RiskMatrixConfig
)


# =============================
# Inline Admins
# =============================
class RiskHazardInline(admin.TabularInline):
    model = RiskHazard
    extra = 1
    fields = ['hazard_type', 'hazard_description', 'event_description', 'causes', 'consequences', 'impact_type', 'order']


class RiskExposureInline(admin.StackedInline):
    model = RiskExposure
    extra = 0
    max_num = 1
    fields = ['affected_personnel', 'number_exposed', 'exposure_frequency', 'exposure_duration', 'vulnerable_groups']


class ControlBarrierInline(admin.TabularInline):
    model = ControlBarrier
    extra = 1
    fields = ['barrier_type', 'description', 'hierarchy_level', 'effectiveness_rating', 'condition', 'barrier_owner', 'order']
    autocomplete_fields = ['barrier_owner']


class RiskTreatmentActionInline(admin.TabularInline):
    model = RiskTreatmentAction
    extra = 1
    fields = ['action_description', 'barrier_type', 'hierarchy_level', 'responsible_person', 'target_date', 'status', 'order']
    autocomplete_fields = ['responsible_person']


class RiskReviewInline(admin.TabularInline):
    model = RiskReview
    extra = 0
    fields = ['review_date', 'reviewed_by', 'changes_made', 'controls_effective', 'next_review_date']
    readonly_fields = ['created_at']
    autocomplete_fields = ['reviewed_by']


class RiskAttachmentInline(admin.TabularInline):
    model = RiskAttachment
    extra = 0
    fields = ['file', 'file_type', 'description']
    readonly_fields = ['uploaded_by', 'uploaded_at']


# =============================
# Main Admins
# =============================
@admin.register(RiskAssessment)
class RiskAssessmentAdmin(admin.ModelAdmin):
    """Admin for risk assessments."""
    
    list_display = [
        'event_number', 'location', 'process_area', 'risk_category',
        'initial_risk_display', 'residual_risk_display',
        'status', 'assessed_by', 'assessment_date', 'next_review_date'
    ]
    list_filter = [
        'status', 'risk_category', 'activity_type',
        'risk_acceptable', 'alarp_required', 'assessment_date'
    ]
    search_fields = [
        'event_number', 'location', 'process_area', 'activity_description'
    ]
    readonly_fields = [
        'event_number', 'created_at', 'updated_at',
        'initial_risk_level', 'residual_risk_level',
        'initial_risk_rating', 'residual_risk_rating',
        'is_overdue_for_review', 'days_until_review'
    ]
    autocomplete_fields = ['assessed_by', 'approved_by', 'risk_owner']
    
    fieldsets = (
        ('Identification', {
            'fields': ('event_number', 'status', 'version')
        }),
        ('Metadata', {
            'fields': (
                'assessment_date', 'assessed_by', 'approved_by', 'approval_date',
                'review_date', 'next_review_date'
            )
        }),
        ('Activity Details', {
            'fields': (
                'location', 'process_area', 'activity_description',
                'risk_category', 'activity_type', 'risk_owner'
            )
        }),
        ('Initial Risk (Without Controls)', {
            'fields': (
                'initial_probability', 'initial_severity',
                'initial_risk_level', 'initial_risk_rating'
            )
        }),
        ('Residual Risk (With Existing Controls)', {
            'fields': (
                'residual_probability', 'residual_severity',
                'residual_risk_level', 'residual_risk_rating'
            )
        }),
        ('Risk Evaluation', {
            'fields': (
                'risk_acceptable', 'alarp_required', 'alarp_justification',
                'management_decision'
            )
        }),
        ('Compliance', {
            'fields': ('iso_45001_clauses', 'legal_requirements', 'company_procedures'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('comments', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [
        RiskHazardInline,
        RiskExposureInline,
        ControlBarrierInline,
        RiskTreatmentActionInline,
        RiskReviewInline,
        RiskAttachmentInline,
    ]
    
    def initial_risk_display(self, obj):
        """Display initial risk with color."""
        rating = obj.initial_risk_rating
        level = obj.initial_risk_level
        return f"{level} - {rating}"
    initial_risk_display.short_description = 'Initial Risk'
    
    def residual_risk_display(self, obj):
        """Display residual risk with color."""
        rating = obj.residual_risk_rating
        level = obj.residual_risk_level
        return f"{level} - {rating}"
    residual_risk_display.short_description = 'Residual Risk'


@admin.register(RiskMatrixConfig)
class RiskMatrixConfigAdmin(admin.ModelAdmin):
    """Admin for risk matrix configuration."""
    
    list_display = ['matrix_size', 'low_threshold', 'medium_threshold', 'updated_at']
    fields = [
        'matrix_size', 'probability_definitions', 'severity_definitions',
        'low_threshold', 'medium_threshold',
        'low_risk_color', 'medium_risk_color', 'high_risk_color'
    ]
    
    def has_add_permission(self, request):
        # Only allow one instance
        return not RiskMatrixConfig.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion
        return False


# Register remaining models without inlines
@admin.register(RiskHazard)
class RiskHazardAdmin(admin.ModelAdmin):
    list_display = ['risk_assessment', 'hazard_type', 'hazard_description', 'impact_type']
    list_filter = ['hazard_type', 'impact_type']
    search_fields = ['hazard_description', 'event_description']


@admin.register(ControlBarrier)
class ControlBarrierAdmin(admin.ModelAdmin):
    list_display = ['risk_assessment', 'barrier_type', 'description', 'hierarchy_level', 'effectiveness_rating', 'condition']
    list_filter = ['barrier_type', 'hierarchy_level', 'effectiveness_rating', 'condition']
    search_fields = ['description']


@admin.register(RiskTreatmentAction)
class RiskTreatmentActionAdmin(admin.ModelAdmin):
    list_display = ['risk_assessment', 'action_description', 'responsible_person', 'target_date', 'status']
    list_filter = ['status', 'barrier_type', 'hierarchy_level']
    search_fields = ['action_description']
    autocomplete_fields = ['responsible_person', 'verified_by', 'linked_capa']


@admin.register(RiskReview)
class RiskReviewAdmin(admin.ModelAdmin):
    list_display = ['risk_assessment', 'review_date', 'reviewed_by', 'controls_effective']
    list_filter = ['review_date', 'controls_effective', 'new_hazards_identified']
    search_fields = ['changes_made']


@admin.register(RiskAttachment)
class RiskAttachmentAdmin(admin.ModelAdmin):
    list_display = ['risk_assessment', 'file_type', 'description', 'uploaded_by', 'uploaded_at']
    list_filter = ['file_type', 'uploaded_at']
    readonly_fields = ['uploaded_by', 'uploaded_at']
