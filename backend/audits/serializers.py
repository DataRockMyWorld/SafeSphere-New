"""
Serializers for Audit Management System.
"""
from rest_framework import serializers
from audits.models import (
    AuditScoringCriteria, AuditType, AuditChecklistTemplate, AuditChecklistCategory, 
    AuditChecklistQuestion, AuditQuestionResponse, ISOClause45001, AuditPlan, 
    AuditChecklist, AuditChecklistResponse, AuditFinding, CAPA, AuditEvidence, 
    AuditReport, CAPAProgressUpdate, AuditMeeting, AuditComment, CompanySettings
)
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


# =============================
# Scoring Criteria Serializers
# =============================
class AuditScoringCriteriaSerializer(serializers.ModelSerializer):
    """Serializer for scoring criteria."""
    
    class Meta:
        model = AuditScoringCriteria
        fields = ['id', 'finding_type', 'display_name', 'color_code', 'score_percentage', 
                  'definition', 'action_required', 'examples', 'is_active']


# =============================
# Audit Type Serializers
# =============================
class AuditTypeSerializer(serializers.ModelSerializer):
    """Serializer for audit types."""
    
    class Meta:
        model = AuditType
        fields = ['id', 'name', 'code', 'description', 'is_active']


# =============================
# Checklist Template Serializers
# =============================
class AuditChecklistQuestionSerializer(serializers.ModelSerializer):
    """Serializer for checklist questions."""
    
    full_reference = serializers.ReadOnlyField()
    
    class Meta:
        model = AuditChecklistQuestion
        fields = [
            'id', 'subsection_name', 'reference_number', 'question_letter',
            'question_text', 'expected_response_type', 'is_mandatory', 'order',
            'weight', 'help_text', 'full_reference'
        ]


class AuditChecklistCategorySerializer(serializers.ModelSerializer):
    """Serializer for checklist categories."""
    
    questions = AuditChecklistQuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    total_weight_check = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditChecklistCategory
        fields = [
            'id', 'section_number', 'category_name', 'description', 
            'order', 'weight', 'questions', 'question_count', 'total_weight_check'
        ]
    
    def get_question_count(self, obj):
        return obj.questions.count()
    
    def get_total_weight_check(self, obj):
        """Check if question weights sum to 100%"""
        total = sum(q.weight for q in obj.questions.all())
        return {
            'total': float(total),
            'valid': abs(float(total) - 100.0) < 0.01  # Allow small floating point errors
        }


class AuditChecklistTemplateSerializer(serializers.ModelSerializer):
    """Serializer for checklist templates."""
    
    audit_type_detail = AuditTypeSerializer(source='audit_type', read_only=True)
    categories = AuditChecklistCategorySerializer(many=True, read_only=True)
    total_questions = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditChecklistTemplate
        fields = [
            'id', 'audit_type', 'audit_type_detail', 'name', 'description',
            'version', 'is_active', 'categories', 'total_questions', 'created_at'
        ]
    
    def get_total_questions(self, obj):
        return AuditChecklistQuestion.objects.filter(category__template=obj).count()


class AuditQuestionResponseSerializer(serializers.ModelSerializer):
    """Serializer for question responses."""
    
    question_detail = AuditChecklistQuestionSerializer(source='question', read_only=True)
    
    class Meta:
        model = AuditQuestionResponse
        fields = [
            'id', 'question', 'question_detail', 'answer_text', 
            'compliance_status', 'notes', 'evidence_files'
        ]


# =============================
# ISO Clause Serializers
# =============================
class ISOClause45001Serializer(serializers.ModelSerializer):
    """Serializer for ISO 45001 clauses."""
    
    sub_clauses = serializers.SerializerMethodField()
    full_path = serializers.ReadOnlyField(source='get_full_path')
    
    class Meta:
        model = ISOClause45001
        fields = [
            'id', 'clause_number', 'title', 'description', 'parent_clause',
            'requirements', 'is_mandatory', 'risk_category', 'guidance_notes',
            'sub_clauses', 'full_path'
        ]
    
    def get_sub_clauses(self, obj):
        """Get sub-clauses recursively."""
        if obj.sub_clauses.exists():
            return ISOClause45001Serializer(obj.sub_clauses.all(), many=True).data
        return []


# =============================
# Audit Plan Serializers
# =============================
class AuditPlanListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for audit plan lists."""
    
    audit_type_name = serializers.CharField(source='audit_type.name', read_only=True)
    lead_auditor_name = serializers.CharField(source='lead_auditor.get_full_name', read_only=True)
    iso_clause_count = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()
    days_until_start = serializers.ReadOnlyField()
    
    class Meta:
        model = AuditPlan
        fields = [
            'id', 'audit_code', 'title', 'audit_type', 'audit_type_name', 'status',
            'planned_start_date', 'planned_end_date', 'lead_auditor_name',
            'iso_clause_count', 'is_overdue', 'days_until_start',
            'created_at'
        ]
    
    def get_iso_clause_count(self, obj):
        return obj.iso_clauses.count()


class AuditPlanDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for audit plans."""
    
    audit_type_detail = AuditTypeSerializer(source='audit_type', read_only=True)
    lead_auditor = UserSerializer(read_only=True)
    audit_team = UserSerializer(many=True, read_only=True)
    iso_clauses = ISOClause45001Serializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    
    # IDs for write operations
    audit_type_id = serializers.PrimaryKeyRelatedField(
        queryset=AuditType.objects.filter(is_active=True),
        source='audit_type',
        write_only=True,
        required=True,
        allow_null=False,
        error_messages={
            'required': 'Audit type is required.',
            'does_not_exist': 'Invalid audit type selected.',
            'incorrect_type': 'Audit type must be a valid ID.',
        }
    )
    lead_auditor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='lead_auditor', 
        write_only=True,
        required=False,
        allow_null=True,
        allow_empty=True
    )
    audit_team_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        many=True, 
        source='audit_team', 
        write_only=True,
        required=False,
        allow_empty=True
    )
    iso_clause_ids = serializers.PrimaryKeyRelatedField(
        queryset=ISOClause45001.objects.all(), 
        many=True, 
        source='iso_clauses', 
        write_only=True,
        required=True,
        error_messages={
            'required': 'At least one ISO clause must be selected.',
            'empty': 'At least one ISO clause must be selected.',
        }
    )
    
    # Computed fields
    is_overdue = serializers.ReadOnlyField()
    days_until_start = serializers.ReadOnlyField()
    duration_days = serializers.ReadOnlyField()
    
    class Meta:
        model = AuditPlan
        fields = '__all__'
        read_only_fields = [
            'id', 'audit_code', 'created_at', 'updated_at',
            'audit_type', 'lead_auditor', 'audit_team', 'iso_clauses'  # Read-only, use _id fields for writing
        ]


# =============================
# Audit Checklist Serializers
# =============================
class AuditChecklistSerializer(serializers.ModelSerializer):
    """Serializer for audit checklist items."""
    
    iso_clause_detail = ISOClause45001Serializer(source='iso_clause', read_only=True)
    has_response = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditChecklist
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_has_response(self, obj):
        """Check if checklist item has been responded to."""
        return obj.responses.exists()


class AuditChecklistResponseSerializer(serializers.ModelSerializer):
    """Serializer for checklist responses."""
    
    auditor = UserSerializer(read_only=True)
    interviewed_person = UserSerializer(read_only=True)
    checklist_item_detail = AuditChecklistSerializer(source='checklist_item', read_only=True)
    evidence_files = serializers.SerializerMethodField()
    
    # IDs for write operations
    interviewed_person_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='interviewed_person', 
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = AuditChecklistResponse
        fields = '__all__'
        read_only_fields = ['id', 'auditor', 'response_date', 'updated_at']
    
    def get_evidence_files(self, obj):
        """Get evidence files attached to this response."""
        evidence = obj.evidence.all()
        return AuditEvidenceSerializer(evidence, many=True).data


# =============================
# Finding Serializers
# =============================
class AuditFindingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for finding lists."""
    
    iso_clause_number = serializers.CharField(source='iso_clause.clause_number', read_only=True)
    audit_code = serializers.CharField(source='audit_plan.audit_code', read_only=True)
    audit_type_name = serializers.CharField(source='audit_plan.audit_type.name', read_only=True)
    has_capa = serializers.ReadOnlyField()
    all_capas_closed = serializers.ReadOnlyField()
    capa_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditFinding
        fields = [
            'id', 'finding_code', 'finding_type', 'severity', 'title',
            'status', 'department_affected', 'identified_date', 'audit_date',
            'attendees', 'iso_clause_number', 'audit_code', 'audit_type_name',
            'has_capa', 'all_capas_closed', 'capa_count', 'requires_immediate_action'
        ]
    
    def get_capa_count(self, obj):
        return obj.capas.count()


class AuditFindingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for findings."""
    
    iso_clause = ISOClause45001Serializer(read_only=True)
    audit_plan = AuditPlanListSerializer(read_only=True)
    identified_by = UserSerializer(read_only=True)
    evidence_files = serializers.SerializerMethodField()
    capas = serializers.SerializerMethodField()
    question_responses_detail = AuditQuestionResponseSerializer(
        source='question_responses',
        many=True,
        read_only=True
    )
    
    # IDs for write operations
    iso_clause_id = serializers.PrimaryKeyRelatedField(
        queryset=ISOClause45001.objects.all(), 
        source='iso_clause', 
        write_only=True
    )
    audit_plan_id = serializers.PrimaryKeyRelatedField(
        queryset=AuditPlan.objects.all(), 
        source='audit_plan', 
        write_only=True
    )
    
    # Write-only field for question responses
    question_responses_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    has_capa = serializers.ReadOnlyField()
    all_capas_closed = serializers.ReadOnlyField()
    
    class Meta:
        model = AuditFinding
        fields = '__all__'
        read_only_fields = ['id', 'finding_code', 'identified_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create finding and question responses atomically."""
        from django.db import transaction
        
        question_responses_data = validated_data.pop('question_responses_data', [])
        
        try:
            with transaction.atomic():
                # Set identified_by to current user
                if 'identified_by' not in validated_data and hasattr(self.context.get('request'), 'user'):
                    validated_data['identified_by'] = self.context['request'].user
                
                finding = super().create(validated_data)
                
                # Create question responses
                for response_data in question_responses_data:
                    AuditQuestionResponse.objects.create(
                        finding=finding,
                        question_id=response_data.get('question_id'),
                        answer_text=response_data.get('answer_text', ''),
                        compliance_status=response_data.get('compliance_status', 'COMPLIANT'),
                        notes=response_data.get('notes', ''),
                        evidence_files=response_data.get('evidence_files', [])
                    )
                
                return finding
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create finding: {str(e)}")
    
    def get_evidence_files(self, obj):
        """Get evidence files for this finding."""
        evidence = obj.evidence.all()
        return AuditEvidenceSerializer(evidence, many=True).data
    
    def get_capas(self, obj):
        """Get CAPAs for this finding."""
        from audits.serializers import CAPAListSerializer
        capas = obj.capas.all()
        return CAPAListSerializer(capas, many=True).data


# =============================
# CAPA Serializers
# =============================
class CAPAListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for CAPA lists."""
    
    finding_code = serializers.CharField(source='finding.finding_code', read_only=True)
    responsible_person_name = serializers.CharField(source='responsible_person.get_full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_overdue = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = CAPA
        fields = [
            'id', 'action_code', 'title', 'action_type', 'priority', 'status',
            'target_completion_date', 'progress_percentage',
            'finding_code', 'responsible_person_name', 'is_overdue',
            'days_overdue', 'days_remaining', 'created_at'
        ]


class CAPADetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for CAPAs."""
    
    finding = AuditFindingListSerializer(read_only=True)
    responsible_person = UserSerializer(read_only=True)
    assigned_by = UserSerializer(read_only=True)
    verified_by = UserSerializer(read_only=True)
    progress_updates = serializers.SerializerMethodField()
    evidence_files = serializers.SerializerMethodField()
    
    # IDs for write operations
    finding_id = serializers.PrimaryKeyRelatedField(
        queryset=AuditFinding.objects.all(), 
        source='finding', 
        write_only=True
    )
    responsible_person_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='responsible_person', 
        write_only=True
    )
    
    is_overdue = serializers.ReadOnlyField()
    days_overdue = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = CAPA
        fields = '__all__'
        read_only_fields = ['id', 'action_code', 'assigned_by', 'assigned_date', 'created_at', 'updated_at']
    
    def get_progress_updates(self, obj):
        """Get progress updates for this CAPA."""
        updates = obj.progress_updates.all()
        return CAPAProgressUpdateSerializer(updates, many=True).data
    
    def get_evidence_files(self, obj):
        """Get evidence files for this CAPA."""
        evidence = obj.evidence.all()
        return AuditEvidenceSerializer(evidence, many=True).data


# =============================
# Evidence Serializers
# =============================
class AuditEvidenceSerializer(serializers.ModelSerializer):
    """Serializer for audit evidence."""
    
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditEvidence
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at', 'file_size']
    
    def get_file_url(self, obj):
        """Get full URL for file."""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_size_mb(self, obj):
        """Get file size in MB."""
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0


# =============================
# Report Serializers
# =============================
class AuditReportSerializer(serializers.ModelSerializer):
    """Serializer for audit reports."""
    
    audit_plan = AuditPlanListSerializer(read_only=True)
    prepared_by = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    
    total_findings = serializers.ReadOnlyField()
    
    # ID for write
    audit_plan_id = serializers.PrimaryKeyRelatedField(
        queryset=AuditPlan.objects.all(), 
        source='audit_plan', 
        write_only=True
    )
    
    class Meta:
        model = AuditReport
        fields = '__all__'
        read_only_fields = [
            'id', 'report_code', 'prepared_by', 'major_ncs_count', 
            'minor_ncs_count', 'observations_count', 'opportunities_count',
            'created_at', 'updated_at'
        ]


# =============================
# Progress Update Serializers
# =============================
class CAPAProgressUpdateSerializer(serializers.ModelSerializer):
    """Serializer for CAPA progress updates."""
    
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = CAPAProgressUpdate
        fields = '__all__'
        read_only_fields = ['id', 'updated_by', 'update_date']


# =============================
# Meeting Serializers
# =============================
class AuditMeetingSerializer(serializers.ModelSerializer):
    """Serializer for audit meetings."""
    
    attendees = UserSerializer(many=True, read_only=True)
    chairperson = UserSerializer(read_only=True)
    
    # IDs for write
    attendee_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        many=True, 
        source='attendees', 
        write_only=True
    )
    chairperson_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        source='chairperson', 
        write_only=True
    )
    
    class Meta:
        model = AuditMeeting
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


# =============================
# Comment Serializers
# =============================
class AuditCommentSerializer(serializers.ModelSerializer):
    """Serializer for audit comments."""
    
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditComment
        fields = '__all__'
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        """Get replies to this comment."""
        if obj.replies.exists():
            return AuditCommentSerializer(obj.replies.all(), many=True).data
        return []


# =============================
# Dashboard Serializers
# =============================
class AuditDashboardSerializer(serializers.Serializer):
    """Serializer for audit dashboard metrics."""
    
    # Overall metrics
    total_audits = serializers.IntegerField()
    audits_this_year = serializers.IntegerField()
    completed_audits = serializers.IntegerField()
    in_progress_audits = serializers.IntegerField()
    scheduled_audits = serializers.IntegerField()
    
    # Findings
    total_findings = serializers.IntegerField()
    open_findings = serializers.IntegerField()
    major_ncs = serializers.IntegerField()
    minor_ncs = serializers.IntegerField()
    observations = serializers.IntegerField()
    
    # CAPAs
    total_capas = serializers.IntegerField()
    open_capas = serializers.IntegerField()
    overdue_capas = serializers.IntegerField()
    capa_completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Compliance
    average_compliance_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    compliance_trend = serializers.ListField()
    
    # By ISO Clause
    findings_by_clause = serializers.DictField()
    compliance_by_clause = serializers.DictField()
    
    # Recent activity
    upcoming_audits = AuditPlanListSerializer(many=True)
    recent_findings = AuditFindingListSerializer(many=True)
    overdue_capas_list = CAPAListSerializer(many=True)


# =============================
# Bulk Operations Serializers
# =============================
class BulkCAPAAssignSerializer(serializers.Serializer):
    """Serializer for bulk CAPA assignment."""
    
    finding_ids = serializers.ListField(
        child=serializers.UUIDField()
    )
    responsible_person_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )
    target_date = serializers.DateField()
    action_plan = serializers.CharField()


class AuditTemplateSerializer(serializers.Serializer):
    """Serializer for creating audit from template."""
    
    template_name = serializers.CharField()
    title = serializers.CharField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    iso_clause_ids = serializers.ListField(
        child=serializers.IntegerField()
    )



# =============================
# Company Settings Serializers
# =============================
class CompanySettingsSerializer(serializers.ModelSerializer):
    """Serializer for company settings."""
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanySettings
        fields = ['id', 'company_name', 'company_logo', 'logo_url', 'address', 'phone', 'email', 'website', 'updated_at']
        read_only_fields = ['id', 'updated_at']
    
    def get_logo_url(self, obj):
        if obj.company_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company_logo.url)
        return None
