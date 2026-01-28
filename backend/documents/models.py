from django.db import models
from accounts.models import User
import uuid
import re
from django.utils import timezone

### ISO Clause Reference Model

class ISOClause(models.Model):
    class_code = models.CharField(max_length=10, unique=True)
    title = models.TextField()
    description = models.TextField()
    
    def __str__(self):
        return f"{self.class_code} - {self.title}"
    
    
### Document Tag 
class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name


### Document Folder Model
class DocumentFolder(models.Model):
    """
    Dynamic folder system for organizing documents.
    Folders can be created by HSSE Managers/Superadmins.
    Folders can only be deleted if they are empty.
    
    The folder's 'value' field maps to Document.document_type.
    This allows dynamic folder creation while maintaining compatibility.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Display name for the folder")
    value = models.CharField(
        max_length=50, 
        unique=True,
        help_text="Technical identifier (maps to document_type). Must be uppercase and URL-safe."
    )
    description = models.TextField(blank=True, help_text="Optional folder description")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='folders_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Document Folder"
        verbose_name_plural = "Document Folders"
    
    def __str__(self):
        return f"{self.name} ({self.value})"
    
    def get_document_count(self):
        """Get the number of documents in this folder."""
        return Document.objects.filter(document_type=self.value, is_active=True).count()
    
    def is_empty(self):
        """Check if folder has any documents."""
        return self.get_document_count() == 0
    
    def can_be_deleted(self):
        """Check if folder can be safely deleted."""
        return self.is_empty()
    
    def clean(self):
        """Validate folder value format."""
        from django.core.exceptions import ValidationError
        if self.value:
            # Ensure uppercase and replace spaces with underscores for consistency
            self.value = self.value.upper().replace(' ', '_')
            # Validate: alphanumeric and underscores only
            if not re.match(r'^[A-Z0-9_]+$', self.value):
                raise ValidationError("Folder value must contain only uppercase letters, numbers, and underscores.")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    
    
 
### Document Model
class Document(models.Model):
    DOC_TYPES = [
        ("POLICY", "Policy"),
        ("SYSTEM DOCUMENT", "System Document"),
        ("PROCEDURE", "Procedure"),
        ("FORM", "Form"),
        ("SSOW", "SSOW"),
        ("OTHER", "Other"),
    ]
    
    STAGE_CHOICES = [
        ("DRAFT", "Draft"),
        ("HSSE_REVIEW", "HSSE Manager Review"),
        ("OPS_REVIEW", "OPS Manager Review"),
        ("MD_APPROVAL", "MD Approval"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected")
    ]
    
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField(blank=True, help_text="Document content for inline editing")
    document_type = models.CharField(max_length=20, choices=DOC_TYPES)
    category = models.CharField(max_length=100, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    file = models.FileField(upload_to='documents/')
    iso_clauses = models.ManyToManyField(ISOClause, blank=True)
    version = models.CharField(max_length=10, default="1.0")
    revision_number = models.DecimalField(max_digits=4, decimal_places=1, default=1.0)
    status = models.CharField(max_length=20, choices=STAGE_CHOICES, default='DRAFT')
    expiry_date = models.DateField(null=True, blank=True)
    next_review_date = models.DateField(null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='docs_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='docs_verified')
    verified_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='docs_approved')
    approved_at = models.DateTimeField(null=True, blank=True)

    rejection_reason = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    template = models.ForeignKey('DocumentTemplate', on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    metadata = models.JSONField(default=dict, help_text="Document-specific metadata and content")
    
    # ISO 45001: Document Classification
    DOCUMENT_CLASSIFICATION_CHOICES = [
        ('CONTROLLED', 'Controlled Document'),
        ('UNCONTROLLED', 'Uncontrolled Document'),
        ('REFERENCE', 'Reference Document'),
        ('EXTERNAL', 'External Document'),
    ]
    
    ACCESS_LEVEL_CHOICES = [
        ('PUBLIC', 'Public'),
        ('INTERNAL', 'Internal'),
        ('RESTRICTED', 'Restricted'),
        ('CONFIDENTIAL', 'Confidential'),
    ]
    
    # Clarification: This is NOT a template
    is_template = models.BooleanField(
        default=False,
        help_text="Explicit flag: This document is NOT a template (templates are in DocumentTemplate model)"
    )
    
    # Source template (if created from a template)
    source_template = models.ForeignKey(
        'DocumentTemplate',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents_created',
        help_text="The template this document was created from"
    )
    
    # ISO 45001: Document Classification
    document_classification = models.CharField(
        max_length=20,
        choices=DOCUMENT_CLASSIFICATION_CHOICES,
        default='CONTROLLED',
        help_text="Classification of this document for ISO 45001 compliance"
    )
    
    # ISO 45001: Distribution Control
    distribution_list = models.ManyToManyField(
        User,
        blank=True,
        related_name='distributed_documents',
        help_text="Users who have access to this document"
    )
    
    # ISO 45001: Retention Management (for records created from this document)
    retention_period_years = models.IntegerField(
        null=True,
        blank=True,
        help_text="How long records created from this document should be retained (years)"
    )
    
    # ISO 45001: Storage Location
    storage_location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Physical or electronic storage location"
    )
    
    # ISO 45001: Access Level
    access_level = models.CharField(
        max_length=20,
        choices=ACCESS_LEVEL_CHOICES,
        default='INTERNAL',
        help_text="Access level for this document"
    )
    
    # ISO 45001: Obsolete Document Control
    is_obsolete = models.BooleanField(
        default=False,
        help_text="Mark document as obsolete when replaced by a new version"
    )
    obsoleted_at = models.DateTimeField(null=True, blank=True)
    obsoleted_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        related_name='docs_obsoleted',
        on_delete=models.SET_NULL
    )
    replaced_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='replaces',
        on_delete=models.SET_NULL,
        help_text="New document version that replaces this one"
    )

    def __str__(self):
        return self.title

    def can_transition_to(self, new_status):
        """Validate if the document can transition to the new status."""
        valid_transitions = {
            'DRAFT': ['HSSE_REVIEW', 'REJECTED'],
            'HSSE_REVIEW': ['OPS_REVIEW', 'REJECTED'],
            'OPS_REVIEW': ['MD_APPROVAL', 'REJECTED'],
            'MD_APPROVAL': ['APPROVED', 'REJECTED'],
            'REJECTED': ['DRAFT'],
            'APPROVED': ['DRAFT']  # For new versions
        }
        return new_status in valid_transitions.get(self.status, [])

    def transition_to(self, new_status, user, comment=''):
        """Safely transition the document to a new status."""
        if not self.can_transition_to(new_status):
            raise ValueError(f"Cannot transition from {self.status} to {new_status}")
        
        self.status = new_status
        self.save()
        
        # Create workflow entry
        action_map = {
            'HSSE_REVIEW': 'SUBMIT',
            'OPS_REVIEW': 'VERIFY',
            'MD_APPROVAL': 'APPROVE',
            'APPROVED': 'APPROVE',
            'REJECTED': 'REJECT'
        }
        
        ApprovalWorkflow.objects.create(
            document=self,
            position=user.position,
            action=action_map.get(new_status, 'SUBMIT'),
            performed_by=user,
            comment=comment
        )

    def is_editable(self, user):
        """Check if the document can be edited by the given user."""
        if self.status == 'DRAFT':
            return user == self.created_by or user.position == 'HSSE MANAGER'
        return False

    def is_hsse_reviewable(self, user):
        """Check if the document can be reviewed by HSSE Manager."""
        return (
            self.status == 'HSSE_REVIEW' and
            user.position == 'HSSE MANAGER'
        )

    def is_ops_reviewable(self, user):
        """Check if the document can be reviewed by OPS Manager."""
        return (
            self.status == 'OPS_REVIEW' and
            user.position == 'OPS MANAGER'
        )

    def is_md_approvable(self, user):
        """Check if the document can be approved by MD."""
        return (
            self.status == 'MD_APPROVAL' and
            user.position == 'MD'
        )

    def is_rejectable(self, user):
        """Check if the document can be rejected by the given user."""
        return (
            self.status in ['HSSE_REVIEW', 'OPS_REVIEW', 'MD_APPROVAL'] and
            user.position in ['HSSE MANAGER', 'OPS MANAGER', 'MD']
        )

    def get_workflow_history(self):
        """Get the complete workflow history of the document."""
        return self.approvalworkflow_set.all().order_by('timestamp')

    def get_current_version(self):
        """Get the current version string."""
        return f"{self.version}.{self.revision_number}"

    def create_new_version(self):
        """Create a new version of the document."""
        if self.status != 'APPROVED':
            raise ValueError("Only approved documents can have new versions")
        
        # Increment version number
        major, minor = map(int, self.version.split('.'))
        self.version = f"{major + 1}.0"
        self.revision_number = 1.0
        self.status = 'DRAFT'
        self.save()

    def create_new_version_for_change_request(self):
        """Create a new version of the document for change request approval."""
        # Increment version number
        major, minor = map(int, self.version.split('.'))
        self.version = f"{major + 1}.0"
        self.revision_number = 1.0
        self.status = 'DRAFT'
        self.created_by = self.change_requests.filter(status='APPROVED').first().responded_by
        self.save()

    def validate_against_template(self):
        """Validate this document against its template."""
        if self.template:
            return self.template.validate_document(self)
        return []

# =============================
# Approval Workflow Log
# =============================
class ApprovalWorkflow(models.Model):
    ACTIONS = [('SUBMIT', 'Submitted'), ('VERIFY', 'Verified'), ('APPROVE', 'Approved'), ('REJECT', 'Rejected')]

    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    position = models.CharField(max_length=20, choices=User.POSITION_CHOICES)
    action = models.CharField(max_length=10, choices=ACTIONS)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(blank=True)

    def __str__(self):
        return f"{self.action} by {self.performed_by} ({self.position})"


# =============================
# Change Request
# =============================
class ChangeRequest(models.Model):
    STATUS = [('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')]

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='change_requests')
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='change_requests_made')
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS, default='PENDING')
    admin_response = models.TextField(blank=True)
    responded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='change_requests_responded')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Change Request for {self.document.title} by {self.requested_by}"

    def can_be_approved_by(self, user):
        """Only HSSE Manager can approve change requests."""
        return user.position == 'HSSE MANAGER'

    def can_be_rejected_by(self, user):
        """Only HSSE Manager can reject change requests."""
        return user.position == 'HSSE MANAGER'

    def approve(self, user, response=''):
        """Approve the change request."""
        if not self.can_be_approved_by(user):
            raise ValueError("Only HSSE Manager can approve change requests")
        
        self.status = 'APPROVED'
        self.admin_response = response
        self.responded_by = user
        self.responded_at = timezone.now()
        self.save()
        
        # Create new version of the document for editing
        self.document.create_new_version_for_change_request()

    def reject(self, user, response=''):
        """Reject the change request."""
        if not self.can_be_rejected_by(user):
            raise ValueError("Only HSSE Manager can reject change requests")
        
        self.status = 'REJECTED'
        self.admin_response = response
        self.responded_by = user
        self.responded_at = timezone.now()
        self.save()

    def save(self, *args, **kwargs):
        """Override save to create notifications."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Create notification for new change requests
        if is_new:
            try:
                from accounts.models import Notification
                Notification.create_change_request_notification(self)
            except Exception as e:
                # Log error but don't fail the save
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to create change request notification: {e}")

    def can_transition_to(self, new_status):
        """Validate if the document can transition to the new status."""
        valid_transitions = {
            'DRAFT': ['VERIFICATION', 'REJECTED'],
            'VERIFICATION': ['APPROVAL', 'REJECTED'],
            'APPROVAL': ['APPROVED', 'REJECTED'],
            'REJECTED': ['DRAFT'],
            'APPROVED': ['DRAFT']  # For new versions
        }
        return new_status in valid_transitions.get(self.status, [])

    def transition_to(self, new_status, user, comment=''):
        """Safely transition the document to a new status."""
        if not self.can_transition_to(new_status):
            raise ValueError(f"Cannot transition from {self.status} to {new_status}")
        
        self.status = new_status
        self.save()
        
        # Create workflow entry
        action_map = {
            'VERIFICATION': 'SUBMIT',
            'APPROVAL': 'VERIFY',
            'APPROVED': 'APPROVE',
            'REJECTED': 'REJECT'
        }
        
        ApprovalWorkflow.objects.create(
            document=self,
            position=user.position,
            action=action_map.get(new_status, 'SUBMIT'),
            performed_by=user,
            comment=comment
        )

    def is_editable(self, user):
        """Check if the document can be edited by the given user."""
        if self.status == 'DRAFT':
            return user == self.created_by
        return False

    def is_verifiable(self, user):
        """Check if the document can be verified by the given user."""
        return (
            self.status == 'VERIFICATION' and
            user.position in ['OPS MANAGER', 'HSSE MANAGER']
        )

    def is_approvable(self, user):
        """Check if the document can be approved by the given user."""
        return (
            self.status == 'APPROVAL' and
            user.position == 'MD'
        )

    def is_rejectable(self, user):
        """Check if the document can be rejected by the given user."""
        return (
            self.status in ['VERIFICATION', 'APPROVAL'] and
            user.position in ['OPS MANAGER', 'HSSE MANAGER', 'MD']
        )

    def get_workflow_history(self):
        """Get the complete workflow history of the document."""
        return self.approvalworkflow_set.all().order_by('timestamp')

    def get_current_version(self):
        """Get the current version string."""
        return f"{self.version}.{self.revision_number}"

    def create_new_version(self):
        """Create a new version of the document."""
        if self.status != 'APPROVED':
            raise ValueError("Only approved documents can have new versions")
        
        # Increment version number
        major, minor = map(int, self.version.split('.'))
        self.version = f"{major + 1}.0"
        self.revision_number = 1.0
        self.status = 'DRAFT'
        self.save()

    def validate_against_template(self):
        """Validate this document against its template."""
        if self.template:
            return self.template.validate_document(self)
        return []

# =============================
# Document Template
# =============================
class DocumentTemplate(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    document_type = models.CharField(max_length=20, choices=Document.DOC_TYPES)
    department = models.CharField(max_length=20, choices=User.DEPARTMENT_CHOICES)
    version = models.CharField(max_length=10, default="1.0")
    is_active = models.BooleanField(default=True)
    
    # Template structure
    sections = models.JSONField(default=dict, help_text="JSON structure defining document sections and fields")
    required_fields = models.JSONField(default=list, help_text="List of required field names")
    validation_rules = models.JSONField(default=dict, help_text="JSON structure defining field validation rules")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='templates_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='templates_approved')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.name} (v{self.version})"
    
    def create_document_from_template(self, user, title, description=""):
        """Create a new document from this template."""
        if not self.is_active:
            raise ValueError("Cannot create document from inactive template")
            
        # Create new document with template data
        document = Document.objects.create(
            title=title,
            description=description,
            document_type=self.document_type,
            department=self.department,
            version="1.0",
            revision_number=1.0,
            created_by=user
        )
        
        # Add template metadata to document
        document.metadata = {
            'template_id': self.id,
            'template_version': self.version,
            'sections': self.sections,
            'required_fields': self.required_fields,
            'validation_rules': self.validation_rules
        }
        document.save()
        
        return document
    
    def validate_document(self, document):
        """Validate a document against this template's rules."""
        errors = []
        
        # Check required fields
        for field in self.required_fields:
            if not document.metadata.get(field):
                errors.append(f"Required field '{field}' is missing")
        
        # Check validation rules
        for field, rules in self.validation_rules.items():
            value = document.metadata.get(field)
            if value:
                for rule_type, rule_value in rules.items():
                    if rule_type == 'min_length' and len(value) < rule_value:
                        errors.append(f"Field '{field}' must be at least {rule_value} characters")
                    elif rule_type == 'max_length' and len(value) > rule_value:
                        errors.append(f"Field '{field}' must be at most {rule_value} characters")
                    elif rule_type == 'pattern' and not re.match(rule_value, value):
                        errors.append(f"Field '{field}' does not match required pattern")
        
        return errors

# =============================
# Record
# =============================
class Record(models.Model):
    """
    Stores submitted form data as an uploaded file.
    Includes an approval workflow with email notifications.
    
    ISO 45001 Compliant: Records are immutable once approved, have retention periods,
    and are classified for proper management.
    
    Auto-approval: Records submitted by Admin/HSSE Managers are auto-approved.
    Year categorization: Records organized by submission year.
    """
    STATUS_CHOICES = [
        ('PENDING_REVIEW', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    RECORD_CLASSIFICATION_CHOICES = [
        ('LEGAL', 'Legal Requirement'),
        ('OPERATIONAL', 'Operational Record'),
        ('AUDIT', 'Audit Evidence'),
        ('INCIDENT', 'Incident Record'),
        ('TRAINING', 'Training Record'),
        ('INSPECTION', 'Inspection Record'),
        ('MAINTENANCE', 'Maintenance Record'),
        ('HEALTH', 'Health Surveillance Record'),
    ]
    
    STORAGE_TYPE_CHOICES = [
        ('ELECTRONIC', 'Electronic'),
        ('PHYSICAL', 'Physical'),
        ('HYBRID', 'Hybrid'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    record_number = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True, help_text="Auto-generated: REC-YYYY-NNN")
    title = models.CharField(max_length=255, help_text="Descriptive name for this record submission")
    notes = models.TextField(blank=True, help_text="Optional: Additional notes or comments")
    
    # Source Document (the approved form this record was created from)
    source_document = models.ForeignKey(
        Document, 
        on_delete=models.PROTECT, 
        related_name='completed_records',
        limit_choices_to={'document_type': 'FORM', 'status': 'APPROVED'},
        null=True, 
        blank=True,
        help_text="The approved form document this record was created from"
    )
    # Keep form_document for backward compatibility during migration
    form_document = models.ForeignKey(
        Document, 
        on_delete=models.PROTECT, 
        related_name='records', 
        limit_choices_to={'document_type': 'FORM'}, 
        null=True, 
        blank=True,
        help_text="DEPRECATED: Use source_document instead. Kept for backward compatibility."
    )
    
    submitted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='records_submitted')
    submitted_file = models.FileField(upload_to='records/%Y/%m/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_REVIEW')
    created_at = models.DateTimeField(auto_now_add=True)
    year = models.IntegerField(null=True, blank=True, editable=False, help_text="Year of submission for categorization")
    
    # Approval fields
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='records_reviewed')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # ISO 45001: Record Classification
    record_classification = models.CharField(
        max_length=20,
        choices=RECORD_CLASSIFICATION_CHOICES,
        default='OPERATIONAL',
        help_text="Classification of this record for ISO 45001 compliance"
    )
    
    # ISO 45001: Retention Management
    retention_period_years = models.IntegerField(
        default=7,
        help_text="Number of years to retain this record (ISO 45001 requirement)"
    )
    disposal_date = models.DateField(
        null=True,
        blank=True,
        help_text="Auto-calculated: created_at + retention_period_years"
    )
    
    # ISO 45001: Location Tracking
    storage_location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Physical or electronic storage location"
    )
    storage_type = models.CharField(
        max_length=20,
        choices=STORAGE_TYPE_CHOICES,
        default='ELECTRONIC',
        help_text="Type of storage for this record"
    )
    
    # Context Information
    department = models.CharField(
        max_length=50,
        choices=User.DEPARTMENT_CHOICES,
        blank=True,
        help_text="Department that created this record"
    )
    facility_location = models.CharField(
        max_length=255,
        blank=True,
        help_text="Facility or site location where this record applies"
    )
    
    # ISO 45001: Immutability (Records cannot be modified after approval)
    is_locked = models.BooleanField(
        default=False,
        help_text="Lock record after approval to prevent modification (ISO 45001 requirement)"
    )
    locked_at = models.DateTimeField(null=True, blank=True)
    locked_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        related_name='records_locked',
        on_delete=models.SET_NULL
    )
    
    # Correction Tracking (if record needs correction, create new record)
    correction_version = models.IntegerField(
        default=1,
        help_text="Version number if this is a correction of a previous record"
    )
    parent_record = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='corrections',
        on_delete=models.SET_NULL,
        help_text="Link to original record if this is a correction"
    )
    
    # Access Restrictions
    access_restrictions = models.JSONField(
        default=dict,
        blank=True,
        help_text="JSON defining who can access this record (roles, departments, etc.)"
    )
    
    # Related Records (for linking to incidents, audits, etc.)
    # Note: These will be added when those models exist
    # related_incident = models.ForeignKey('incidents.Incident', null=True, blank=True, related_name='records')
    # related_audit = models.ForeignKey('audits.Audit', null=True, blank=True, related_name='records')
    
    # Notification tracking
    notification_sent = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['year', 'status']),
            models.Index(fields=['submitted_by', 'year']),
        ]

    def __str__(self):
        display_title = self.title if self.title else (self.form_document.title if self.form_document else "Record")
        return f"{self.record_number} - {display_title} by {self.submitted_by.get_full_name if self.submitted_by else 'Unknown'}"
    
    def save(self, *args, **kwargs):
        """Auto-generate record number, set year, calculate disposal date, and handle locking."""
        # Use Django's _state.adding to properly detect new records
        # This works even if pk is pre-assigned (e.g., UUIDField with default)
        is_new = self._state.adding if hasattr(self, '_state') else (self.pk is None)
        was_approved = False
        
        # Check if status changed to APPROVED (only for existing records)
        if not is_new and self.pk:
            try:
                old_record = Record.objects.get(pk=self.pk)
                was_approved = (old_record.status != 'APPROVED' and self.status == 'APPROVED')
            except Record.DoesNotExist:
                # Record doesn't exist yet, treat as new
                is_new = True
                was_approved = False
        
        # Set year from created_at if not set
        # Note: Year is primarily determined by created_at for ISO 45001 compliance
        # Users can submit records for past years, but the year field reflects when the record was actually created
        if not self.year:
            if self.created_at:
                self.year = self.created_at.year
            else:
                self.year = timezone.now().year
        # If year was explicitly set but doesn't match created_at, use created_at (for data integrity)
        elif self.created_at and self.year != self.created_at.year:
            # Log a warning but use created_at year for consistency
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Record year mismatch: specified {self.year} but created_at is {self.created_at.year}. Using created_at year.")
            self.year = self.created_at.year
        
        # Migrate form_document to source_document if needed
        if self.form_document and not self.source_document:
            self.source_document = self.form_document
        
        # Calculate disposal date if not set
        if not self.disposal_date and self.created_at:
            from datetime import timedelta
            disposal_date = self.created_at.date() + timedelta(days=self.retention_period_years * 365)
            self.disposal_date = disposal_date
        
        if is_new:
            # Generate record number: REC-YYYY-NNN
            if not self.record_number:
                year = self.year
                # Get count of records for this year (including this one)
                # Use a more reliable method to avoid race conditions
                existing_count = Record.objects.filter(year=year).count()
                # Check for any records with the same number pattern to avoid duplicates
                max_num = 0
                for existing_record in Record.objects.filter(year=year).exclude(record_number__isnull=True):
                    if existing_record.record_number and existing_record.record_number.startswith(f"REC-{year}-"):
                        try:
                            num_part = existing_record.record_number.split('-')[-1]
                            num = int(num_part)
                            if num > max_num:
                                max_num = num
                        except (ValueError, IndexError):
                            pass
                
                # Use max found + 1, or existing count + 1 if no numbers found
                next_num = max(max_num + 1, existing_count + 1)
                self.record_number = f"REC-{year}-{next_num:03d}"
            
            # Auto-approve for Admin and HSSE Manager
            if self.submitted_by and (self.submitted_by.is_superuser or self.submitted_by.position == 'HSSE MANAGER'):
                self.status = 'APPROVED'
                self.reviewed_by = self.submitted_by
                self.reviewed_at = timezone.now()
                self.is_locked = True
                self.locked_at = timezone.now()
                self.locked_by = self.submitted_by
        
        # Lock record when approved (for existing records that just got approved)
        if was_approved and not self.is_locked:
            self.is_locked = True
            self.locked_at = timezone.now()
            self.locked_by = self.reviewed_by
        
        # Prevent modification if locked (only for existing records)
        if not is_new and self.is_locked:
            try:
                old_record = Record.objects.get(pk=self.pk)
                # Allow only status changes and rejection_reason updates
                allowed_changes = ['status', 'rejection_reason', 'reviewed_by', 'reviewed_at']
                for field in self._meta.fields:
                    if field.name not in allowed_changes:
                        setattr(self, field.name, getattr(old_record, field.name))
            except Record.DoesNotExist:
                # Record doesn't exist, skip protection
                pass
        
        super().save(*args, **kwargs)
        
        # Create notification after save
        if is_new and self.status == 'PENDING_REVIEW':
            self._create_submission_notification()

    def can_be_reviewed_by(self, user):
        """Only HSSE Manager and Superadmin can review records."""
        return user.position == 'HSSE MANAGER' or user.is_superuser

    def approve(self, user):
        """Approve the record and send notification."""
        if not self.can_be_reviewed_by(user):
            raise ValueError("You do not have permission to approve this record.")
        
        self.status = 'APPROVED'
        self.reviewed_by = user
        self.reviewed_at = timezone.now()
        self.rejection_reason = ''
        self.save()
        
        # Send approval notification
        self._send_approval_notification()

    def reject(self, user, reason):
        """Reject the record and send notification with reason."""
        if not self.can_be_reviewed_by(user):
            raise ValueError("You do not have permission to reject this record.")
        
        if not reason or not reason.strip():
            raise ValueError("A rejection reason is required.")
        
        self.status = 'REJECTED'
        self.reviewed_by = user
        self.reviewed_at = timezone.now()
        self.rejection_reason = reason
        self.save()
        
        # Send rejection notification
        self._send_rejection_notification()
    
    def _create_submission_notification(self):
        """Create in-app notification for HSSE Managers when record is submitted."""
        try:
            from accounts.models import Notification
            
            # Notify all HSSE Managers
            hsse_managers = User.objects.filter(position='HSSE MANAGER')
            for manager in hsse_managers:
                Notification.objects.create(
                    user=manager,
                    notification_type='RECORD_SUBMITTED',
                    title=f'New Record Submitted: {self.record_number}',
                    message=f'{self.submitted_by.get_full_name if self.submitted_by else "Unknown"} submitted a record for "{self.form_document.title}".',
                    related_object_id=str(self.id),
                    related_object_type='record',
                )
            self.notification_sent = True
            Record.objects.filter(pk=self.pk).update(notification_sent=True)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create submission notification for {self.record_number}: {e}")
    
    def _send_approval_notification(self):
        """Send email and in-app notification when record is approved."""
        if not self.submitted_by:
            return
        
        try:
            from accounts.models import Notification
            from django.core.mail import send_mail
            from django.conf import settings
            
            # Create in-app notification
            Notification.objects.create(
                user=self.submitted_by,
                notification_type='RECORD_APPROVED',
                title=f'Record Approved: {self.record_number}',
                message=f'Your record submission for "{self.form_document.title}" has been approved by {self.reviewed_by.get_full_name if self.reviewed_by else "HSSE Manager"}.',
                related_object_id=str(self.id),
                related_object_type='record',
            )
            
            # Send email
            subject = f'✅ Record Approved: {self.record_number}'
            message = f"""
Hello {self.submitted_by.get_full_name},

Your record submission has been approved!

Record Number: {self.record_number}
Form: {self.form_document.title}
Submitted: {self.created_at.strftime('%B %d, %Y at %I:%M %p')}
Approved by: {self.reviewed_by.get_full_name if self.reviewed_by else 'HSSE Manager'}
Approved on: {self.reviewed_at.strftime('%B %d, %Y at %I:%M %p') if self.reviewed_at else 'N/A'}

Your submission is now part of the official record.

Access your records: {settings.FRONTEND_URL}/document-management/records

---
This is an automated notification from SafeSphere Document Management System.
"""
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.submitted_by.email],
                fail_silently=False,
            )
            
            self.email_sent = True
            Record.objects.filter(pk=self.pk).update(email_sent=True)
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send approval notification for {self.record_number}: {e}")
    
    def _send_rejection_notification(self):
        """Send email and in-app notification when record is rejected."""
        if not self.submitted_by:
            return
        
        try:
            from accounts.models import Notification
            from django.core.mail import send_mail
            from django.conf import settings
            
            # Create in-app notification
            Notification.objects.create(
                user=self.submitted_by,
                notification_type='RECORD_REJECTED',
                title=f'Record Rejected: {self.record_number}',
                message=f'Your record submission for "{self.form_document.title}" was rejected. Reason: {self.rejection_reason}',
                related_object_id=str(self.id),
                related_object_type='record',
            )
            
            # Send email
            subject = f'❌ Record Rejected: {self.record_number}'
            message = f"""
Hello {self.submitted_by.get_full_name},

Your record submission has been rejected and requires correction.

Record Number: {self.record_number}
Form: {self.form_document.title}
Submitted: {self.created_at.strftime('%B %d, %Y at %I:%M %p')}
Reviewed by: {self.reviewed_by.get_full_name if self.reviewed_by else 'HSSE Manager'}
Reviewed on: {self.reviewed_at.strftime('%B %d, %Y at %I:%M %p') if self.reviewed_at else 'N/A'}

REJECTION REASON:
{self.rejection_reason}

Please review the feedback, make necessary corrections, and resubmit the form.

Access your records: {settings.FRONTEND_URL}/document-management/records

If you have questions, please contact the HSSE Manager.

---
This is an automated notification from SafeSphere Document Management System.
"""
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.submitted_by.email],
                fail_silently=False,
            )
            
            self.email_sent = True
            Record.objects.filter(pk=self.pk).update(email_sent=True)
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send rejection notification for {self.record_number}: {e}")


# =============================
# Document Distribution (ISO 45001)
# =============================
class DocumentDistribution(models.Model):
    """
    Track document distribution to users for ISO 45001 compliance.
    Ensures proper control of who receives which documents.
    """
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='distributions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_distributions')
    distributed_at = models.DateTimeField(auto_now_add=True)
    distributed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='distributions_made'
    )
    acknowledged = models.BooleanField(default=False, help_text="User has acknowledged receipt")
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Additional notes about this distribution")
    
    class Meta:
        unique_together = ['document', 'user']
        ordering = ['-distributed_at']
        verbose_name = "Document Distribution"
        verbose_name_plural = "Document Distributions"
    
    def __str__(self):
        return f"{self.document.title} → {self.user.get_full_name()}"


# =============================
# Record Disposal (ISO 45001)
# =============================
class RecordDisposal(models.Model):
    """
    Track record disposal for audit trail and ISO 45001 compliance.
    Records must be disposed of according to retention periods.
    """
    DISPOSAL_METHOD_CHOICES = [
        ('DIGITAL_DELETE', 'Digital Deletion'),
        ('PHYSICAL_DESTROY', 'Physical Destruction'),
        ('ARCHIVE', 'Archive'),
        ('TRANSFER', 'Transfer to External Storage'),
    ]
    
    record = models.ForeignKey(Record, on_delete=models.CASCADE, related_name='disposals')
    disposal_date = models.DateField(help_text="Date when record was disposed")
    disposal_method = models.CharField(
        max_length=50,
        choices=DISPOSAL_METHOD_CHOICES,
        help_text="Method used to dispose of the record"
    )
    disposed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='records_disposed'
    )
    disposal_certificate = models.FileField(
        upload_to='disposals/',
        null=True,
        blank=True,
        help_text="Certificate or proof of disposal"
    )
    notes = models.TextField(
        blank=True,
        help_text="Additional notes about the disposal process"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-disposal_date']
        verbose_name = "Record Disposal"
        verbose_name_plural = "Record Disposals"
    
    def __str__(self):
        return f"Disposal of {self.record.record_number} on {self.disposal_date}"