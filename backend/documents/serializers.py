from rest_framework import serializers
from .models import (
    ISOClause, Tag, Document, ApprovalWorkflow, 
    ChangeRequest, DocumentTemplate, Record, DocumentFolder,
    DocumentDistribution, RecordDisposal
)
from accounts.serializers import UserMeSerializer
from accounts.models import User

def validate_file_type(value):
    """
    Validate uploaded file type and size.
    
    Allowed formats:
    - PDF (strongly recommended for all final/approved documents)
    - Word (.doc, .docx) - for editable templates and draft documents
    - Excel (.xls, .xlsx) - for data sheets, checklists, matrices
    - Images (.jpg, .jpeg, .png) - for evidence, photos, diagrams
    
    Note: For ISO compliance and long-term archival, PDF is the gold standard.
    Other formats are useful during the drafting/editing phase.
    """
    if value:
        ext = value.name.split('.')[-1].lower()
        allowed_extensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file format. Allowed formats are: PDF (recommended), Word, Excel, and Images (JPG, PNG)."
            )
        # Check file size (limit to 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB.")
    return value

# =============================
# Serializers
# =============================
class ISOClauseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ISOClause
        fields = '__all__'


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class DocumentSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    iso_clauses = ISOClauseSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    obsoleted_by_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    file = serializers.FileField(validators=[validate_file_type])
    distribution_list = serializers.SerializerMethodField()
    distribution_list_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        write_only=True,
        required=False,
        source='distribution_list'
    )

    class Meta:
        model = Document
        fields = [
            # Basic fields
            'id', 'title', 'description', 'document_type', 'category',
            'content', 'tags', 'file', 'file_url', 'iso_clauses', 'version', 'revision_number',
            'status', 'expiry_date', 'next_review_date', 'created_by',
            'created_by_name', 'created_at', 'updated_at', 'verified_by',
            'verified_by_name', 'verified_at', 'approved_by', 'approved_by_name',
            'approved_at', 'rejection_reason', 'is_active', 'template', 'metadata',
            # ISO 45001: Template clarity
            'is_template', 'source_template',
            # ISO 45001: Classification
            'document_classification',
            # ISO 45001: Distribution
            'distribution_list', 'distribution_list_ids',
            # ISO 45001: Retention
            'retention_period_years',
            # ISO 45001: Location
            'storage_location',
            # ISO 45001: Access
            'access_level',
            # ISO 45001: Obsolete control
            'is_obsolete', 'obsoleted_at', 'obsoleted_by_name', 'replaced_by'
        ]
        read_only_fields = [
            'created_by', 'created_at', 'updated_at', 'verified_by',
            'verified_at', 'approved_by', 'approved_at', 'version',
            'revision_number', 'status', 'is_template', 'obsoleted_at'
        ]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name if obj.created_by else None

    def get_verified_by_name(self, obj):
        return obj.verified_by.get_full_name if obj.verified_by else None

    def get_approved_by_name(self, obj):
        return obj.approved_by.get_full_name if obj.approved_by else None
    
    def get_obsoleted_by_name(self, obj):
        return obj.obsoleted_by.get_full_name if obj.obsoleted_by else None
    
    def get_distribution_list(self, obj):
        """Get list of users who have access to this document."""
        return [
            {
                'id': user.id,
                'full_name': user.get_full_name,
                'email': user.email,
                'position': user.position
            }
            for user in obj.distribution_list.all()
        ]

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        # Ensure is_template is False for new documents
        validated_data['is_template'] = False
        return super().create(validated_data)


class ApprovalWorkflowSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalWorkflow
        fields = ['id', 'document', 'position', 'action', 'performed_by', 'performed_by_name', 'timestamp', 'comment']

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return obj.performed_by.get_full_name
        return None


class ChangeRequestSerializer(serializers.ModelSerializer):
    requested_by = UserMeSerializer(read_only=True)
    responded_by = UserMeSerializer(read_only=True)
    document = DocumentSerializer(read_only=True)
    document_id = serializers.UUIDField(write_only=True, required=True)
    
    class Meta:
        model = ChangeRequest
        fields = [
            'id', 'document', 'document_id', 'requested_by', 'reason', 'status', 
            'admin_response', 'created_at', 'responded_at', 'responded_by'
        ]
        read_only_fields = ['created_at', 'responded_at', 'responded_by']

    def create(self, validated_data):
        # Extract document_id and set it as document
        document_id = validated_data.pop('document_id')
        validated_data['document_id'] = document_id
        return super().create(validated_data)


class DocumentTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = DocumentTemplate
        fields = [
            'id', 'name', 'description', 'document_type', 'department',
            'version', 'is_active', 'sections', 'required_fields',
            'validation_rules', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'approved_by', 'approved_by_name',
            'approved_at', 'document_count'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'approved_by', 'approved_at']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name if obj.created_by else None

    def get_approved_by_name(self, obj):
        return obj.approved_by.get_full_name if obj.approved_by else None

    def get_document_count(self, obj):
        return obj.documents.count()


class CreateDocumentFromTemplateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False, default=dict)

    def validate(self, data):
        template = self.context.get('template')
        if not template:
            raise serializers.ValidationError("Template is required")
        
        # Validate metadata against template rules
        errors = template.validate_document(Document(metadata=data.get('metadata', {})))
        if errors:
            raise serializers.ValidationError({"metadata": errors})
        
        return data

# =============================
# Record Serializers
# =============================

class RecordSerializer(serializers.ModelSerializer):
    submitted_by = UserMeSerializer(read_only=True)
    reviewed_by = UserMeSerializer(read_only=True)
    locked_by = UserMeSerializer(read_only=True)
    form_document = DocumentSerializer(read_only=True)
    form_document_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    source_document = DocumentSerializer(read_only=True)
    source_document_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    parent_record = serializers.SerializerMethodField()
    submitted_file = serializers.FileField(validators=[validate_file_type])
    submitted_file_url = serializers.SerializerMethodField()
    days_until_disposal = serializers.SerializerMethodField()

    class Meta:
        model = Record
        fields = [
            # Basic fields
            'id', 'record_number', 'title', 'notes', 
            # Document links
            'form_document', 'form_document_id', 'source_document', 'source_document_id',
            # User fields
            'submitted_by', 'reviewed_by', 'locked_by',
            # File
            'submitted_file', 'submitted_file_url',
            # Status
            'status', 'created_at', 'year',
            'reviewed_by', 'reviewed_at', 'rejection_reason',
            # ISO 45001: Classification
            'record_classification',
            # ISO 45001: Retention
            'retention_period_years', 'disposal_date', 'days_until_disposal',
            # ISO 45001: Location
            'storage_location', 'storage_type',
            # Context
            'department', 'facility_location',
            # ISO 45001: Immutability
            'is_locked', 'locked_at', 'locked_by',
            # Correction tracking
            'correction_version', 'parent_record',
            # Access
            'access_restrictions',
            # Notifications
            'notification_sent', 'email_sent'
        ]
        read_only_fields = [
            'record_number', 'submitted_by', 'status', 'created_at', 'year',
            'reviewed_by', 'reviewed_at', 'rejection_reason',
            'is_locked', 'locked_at', 'locked_by',
            'disposal_date', 'days_until_disposal',
            'notification_sent', 'email_sent'
        ]
    
    def validate_title(self, value):
        """Ensure title is provided and not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Record title is required.")
        return value.strip()
    
    def get_submitted_file_url(self, obj):
        """Get full URL for submitted file."""
        if obj.submitted_file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.submitted_file.url)
            return obj.submitted_file.url
        return None
    
    def get_parent_record(self, obj):
        """Get parent record if this is a correction."""
        if obj.parent_record:
            return {
                'id': str(obj.parent_record.id),
                'record_number': obj.parent_record.record_number,
                'title': obj.parent_record.title,
            }
        return None
    
    def get_days_until_disposal(self, obj):
        """Calculate days until disposal date."""
        if obj.disposal_date:
            from datetime import date
            today = date.today()
            delta = obj.disposal_date - today
            return delta.days
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['submitted_by'] = user
        
        # Use source_document if provided, otherwise fall back to form_document
        if 'source_document_id' in validated_data and validated_data['source_document_id']:
            from documents.models import Document
            validated_data['source_document'] = Document.objects.get(id=validated_data.pop('source_document_id'))
        elif 'form_document_id' in validated_data and validated_data['form_document_id']:
            from documents.models import Document
            validated_data['source_document'] = Document.objects.get(id=validated_data.pop('form_document_id'))
            validated_data['form_document'] = validated_data['source_document']  # Backward compatibility
        
        # Set department from user if not provided
        if 'department' not in validated_data or not validated_data['department']:
            if user.department:
                validated_data['department'] = user.department
        
        # Handle year selection (user can specify year, but backend validates)
        # The year will be set from created_at in the model's save() method
        # But we can allow user to specify it for records created retroactively
        if 'year' in validated_data:
            # Validate year is reasonable (not in future, not too old)
            from django.utils import timezone
            current_year = timezone.now().year
            user_year = validated_data.pop('year')
            if isinstance(user_year, str):
                user_year = int(user_year)
            # Allow years from 2000 to current year + 1 (for planning)
            if 2000 <= user_year <= current_year + 1:
                # Year will be set in save() method, but we can store it for reference
                # The actual year will be determined by created_at in save()
                pass  # Year is set automatically from created_at
        
        return super().create(validated_data)


class DocumentDistributionSerializer(serializers.ModelSerializer):
    """Serializer for document distribution tracking."""
    user = UserMeSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    distributed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentDistribution
        fields = [
            'id', 'document', 'user', 'user_id', 'distributed_at',
            'distributed_by', 'distributed_by_name', 'acknowledged',
            'acknowledged_at', 'notes'
        ]
        read_only_fields = ['distributed_at', 'distributed_by']
    
    def get_distributed_by_name(self, obj):
        return obj.distributed_by.get_full_name if obj.distributed_by else None
    
    def create(self, validated_data):
        validated_data['distributed_by'] = self.context['request'].user
        return super().create(validated_data)


class RecordDisposalSerializer(serializers.ModelSerializer):
    """Serializer for record disposal tracking."""
    record = serializers.SerializerMethodField()
    record_id = serializers.UUIDField(write_only=True)
    disposed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = RecordDisposal
        fields = [
            'id', 'record', 'record_id', 'disposal_date', 'disposal_method',
            'disposed_by', 'disposed_by_name', 'disposal_certificate',
            'notes', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_record(self, obj):
        return {
            'id': str(obj.record.id),
            'record_number': obj.record.record_number,
            'title': obj.record.title,
        }
    
    def get_disposed_by_name(self, obj):
        return obj.disposed_by.get_full_name if obj.disposed_by else None
    
    def create(self, validated_data):
        validated_data['disposed_by'] = self.context['request'].user
        return super().create(validated_data)


class RecordApprovalSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate_rejection_reason(self, value):
        if self.context.get('action') == 'reject' and not value:
            raise serializers.ValidationError("A reason is required for rejection.")
        return value


# =============================
# Document Folder Serializers
# =============================

class DocumentFolderSerializer(serializers.ModelSerializer):
    """Serializer for DocumentFolder model."""
    created_by_name = serializers.SerializerMethodField()
    document_count = serializers.SerializerMethodField()
    is_empty = serializers.SerializerMethodField()
    can_be_deleted = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentFolder
        fields = [
            'id', 'name', 'value', 'description', 
            'created_by', 'created_by_name', 'created_at', 'updated_at',
            'is_active', 'document_count', 'is_empty', 'can_be_deleted'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name if obj.created_by else None
    
    def get_document_count(self, obj):
        return obj.get_document_count()
    
    def get_is_empty(self, obj):
        return obj.is_empty()
    
    def get_can_be_deleted(self, obj):
        return obj.can_be_deleted()
    
    def validate_value(self, value):
        """Normalize and validate folder value."""
        import re
        if value:
            # Normalize to uppercase and replace spaces with underscores
            value = value.upper().replace(' ', '_')
            # Validate format
            if not re.match(r'^[A-Z0-9_]+$', value):
                raise serializers.ValidationError(
                    "Folder value must contain only uppercase letters, numbers, and underscores."
                )
            # Check uniqueness (if updating, exclude current instance)
            if self.instance:
                existing = DocumentFolder.objects.filter(value=value).exclude(pk=self.instance.pk)
            else:
                existing = DocumentFolder.objects.filter(value=value)
            if existing.exists():
                raise serializers.ValidationError("A folder with this value already exists.")
        return value
    
    def create(self, validated_data):
        """Set created_by to current user."""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
