from rest_framework import serializers
from .models import (
    ISOClause, Tag, Document, ApprovalWorkflow, 
    ChangeRequest, DocumentTemplate, Record, DocumentFolder
)
from accounts.serializers import UserMeSerializer

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
    file_url = serializers.SerializerMethodField()
    file = serializers.FileField(validators=[validate_file_type])

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'document_type', 'category',
            'content', 'tags', 'file', 'file_url', 'iso_clauses', 'version', 'revision_number',
            'status', 'expiry_date', 'next_review_date', 'created_by',
            'created_by_name', 'created_at', 'updated_at', 'verified_by',
            'verified_by_name', 'verified_at', 'approved_by', 'approved_by_name',
            'approved_at', 'rejection_reason', 'is_active', 'template', 'metadata'
        ]
        read_only_fields = [
            'created_by', 'created_at', 'updated_at', 'verified_by',
            'verified_at', 'approved_by', 'approved_at', 'version',
            'revision_number', 'status'
        ]

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name if obj.created_by else None

    def get_verified_by_name(self, obj):
        return obj.verified_by.get_full_name if obj.verified_by else None

    def get_approved_by_name(self, obj):
        return obj.approved_by.get_full_name if obj.approved_by else None

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
    form_document = DocumentSerializer(read_only=True)
    form_document_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    submitted_file = serializers.FileField(validators=[validate_file_type])
    submitted_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Record
        fields = [
            'id', 'record_number', 'title', 'notes', 'form_document', 'form_document_id', 'submitted_by', 
            'submitted_file', 'submitted_file_url', 'status', 'created_at', 'year',
            'reviewed_by', 'reviewed_at', 'rejection_reason',
            'notification_sent', 'email_sent'
        ]
        read_only_fields = [
            'record_number', 'submitted_by', 'status', 'created_at', 'year',
            'reviewed_by', 'reviewed_at', 'rejection_reason',
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

    def create(self, validated_data):
        validated_data['submitted_by'] = self.context['request'].user
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
