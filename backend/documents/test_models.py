"""
Comprehensive tests for document models and workflows.
Tests cover document lifecycle, state transitions, permissions, and edge cases.
"""
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from documents.models import (
    Document, ISOClause, Tag, ApprovalWorkflow, 
    ChangeRequest, DocumentTemplate, Record
)
from datetime import date, timedelta
import uuid

User = get_user_model()


class DocumentModelBasicTests(TestCase):
    """Tests for Document model basic functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.hsse_manager = User.objects.create_user(
            email='hsse@example.com',
            first_name='HSSE',
            last_name='Manager',
            phone_number='1234567890',
            password='testpass123',
            position='HSSE MANAGER'
        )
        
        self.ops_manager = User.objects.create_user(
            email='ops@example.com',
            first_name='OPS',
            last_name='Manager',
            phone_number='0987654321',
            password='testpass123',
            position='OPS MANAGER'
        )
        
        self.md = User.objects.create_user(
            email='md@example.com',
            first_name='Managing',
            last_name='Director',
            phone_number='1122334455',
            password='testpass123',
            position='MD'
        )
        
        self.employee = User.objects.create_user(
            email='employee@example.com',
            first_name='Regular',
            last_name='Employee',
            phone_number='5544332211',
            password='testpass123',
            position='TECHNICIAN'
        )
    
    def test_create_document(self):
        """Test creating a document."""
        document = Document.objects.create(
            title='Test Policy',
            description='Test description',
            document_type='POLICY',
            created_by=self.hsse_manager
        )
        
        assert document.title == 'Test Policy'
        assert document.status == 'DRAFT'
        assert document.version == '1.0'
        assert document.revision_number == 1.0
        assert document.is_active is True
    
    def test_document_has_uuid_primary_key(self):
        """Test document uses UUID as primary key."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            created_by=self.hsse_manager
        )
        
        assert isinstance(document.id, uuid.UUID)
    
    def test_document_str_returns_title(self):
        """Test string representation returns title."""
        document = Document.objects.create(
            title='Test Policy',
            document_type='POLICY',
            created_by=self.hsse_manager
        )
        
        assert str(document) == 'Test Policy'
    
    def test_document_with_tags(self):
        """Test adding tags to document."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            created_by=self.hsse_manager
        )
        
        tag1 = Tag.objects.create(name='Safety')
        tag2 = Tag.objects.create(name='Compliance')
        
        document.tags.add(tag1, tag2)
        
        assert document.tags.count() == 2
        assert tag1 in document.tags.all()
    
    def test_document_with_iso_clauses(self):
        """Test adding ISO clauses to document."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            created_by=self.hsse_manager
        )
        
        iso_clause = ISOClause.objects.create(
            class_code='4.1',
            title='Understanding the organization',
            description='Test description'
        )
        
        document.iso_clauses.add(iso_clause)
        
        assert document.iso_clauses.count() == 1
        assert iso_clause in document.iso_clauses.all()


class DocumentStateTransitionTests(TestCase):
    """Tests for document state transition logic."""
    
    def setUp(self):
        """Set up test data."""
        self.hsse_manager = User.objects.create_user(
            email='hsse@example.com',
            first_name='HSSE',
            last_name='Manager',
            phone_number='1234567890',
            password='testpass123',
            position='HSSE MANAGER'
        )
        
        self.ops_manager = User.objects.create_user(
            email='ops@example.com',
            first_name='OPS',
            last_name='Manager',
            phone_number='0987654321',
            password='testpass123',
            position='OPS MANAGER'
        )
        
        self.md = User.objects.create_user(
            email='md@example.com',
            first_name='Managing',
            last_name='Director',
            phone_number='1122334455',
            password='testpass123',
            position='MD'
        )
    
    def test_valid_transition_from_draft_to_hsse_review(self):
        """Test valid transition from DRAFT to HSSE_REVIEW."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='DRAFT',
            created_by=self.hsse_manager
        )
        
        assert document.can_transition_to('HSSE_REVIEW') is True
    
    def test_valid_transition_from_hsse_review_to_ops_review(self):
        """Test valid transition from HSSE_REVIEW to OPS_REVIEW."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='HSSE_REVIEW',
            created_by=self.hsse_manager
        )
        
        assert document.can_transition_to('OPS_REVIEW') is True
    
    def test_valid_transition_from_ops_review_to_md_approval(self):
        """Test valid transition from OPS_REVIEW to MD_APPROVAL."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='OPS_REVIEW',
            created_by=self.hsse_manager
        )
        
        assert document.can_transition_to('MD_APPROVAL') is True
    
    def test_valid_transition_from_md_approval_to_approved(self):
        """Test valid transition from MD_APPROVAL to APPROVED."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='MD_APPROVAL',
            created_by=self.hsse_manager
        )
        
        assert document.can_transition_to('APPROVED') is True
    
    def test_invalid_transition_from_draft_to_approved(self):
        """Test invalid transition from DRAFT directly to APPROVED."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='DRAFT',
            created_by=self.hsse_manager
        )
        
        assert document.can_transition_to('APPROVED') is False
    
    def test_invalid_transition_from_approved_to_hsse_review(self):
        """Test invalid transition from APPROVED to HSSE_REVIEW."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='APPROVED',
            created_by=self.hsse_manager
        )
        
        assert document.can_transition_to('HSSE_REVIEW') is False
    
    def test_transition_to_creates_workflow_entry(self):
        """Test transition creates workflow history entry."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='DRAFT',
            created_by=self.hsse_manager
        )
        
        document.transition_to('HSSE_REVIEW', self.hsse_manager, 'Ready for review')
        
        assert document.status == 'HSSE_REVIEW'
        assert ApprovalWorkflow.objects.filter(document=document).exists()
        
        workflow = ApprovalWorkflow.objects.get(document=document)
        assert workflow.performed_by == self.hsse_manager
        assert workflow.comment == 'Ready for review'
    
    def test_transition_to_invalid_state_raises_error(self):
        """Test transitioning to invalid state raises ValueError."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='DRAFT',
            created_by=self.hsse_manager
        )
        
        with pytest.raises(ValueError):
            document.transition_to('APPROVED', self.hsse_manager)
    
    def test_rejection_transition_from_any_review_state(self):
        """Test document can be rejected from any review state."""
        states = ['HSSE_REVIEW', 'OPS_REVIEW', 'MD_APPROVAL']
        
        for state in states:
            document = Document.objects.create(
                title=f'Test {state}',
                document_type='POLICY',
                status=state,
                created_by=self.hsse_manager
            )
            
            assert document.can_transition_to('REJECTED') is True
    
    def test_rejected_document_can_return_to_draft(self):
        """Test rejected document can transition back to DRAFT."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='REJECTED',
            created_by=self.hsse_manager
        )
        
        assert document.can_transition_to('DRAFT') is True


class DocumentPermissionTests(TestCase):
    """Tests for document permission checks."""
    
    def setUp(self):
        """Set up test data."""
        self.hsse_manager = User.objects.create_user(
            email='hsse@example.com',
            first_name='HSSE',
            last_name='Manager',
            phone_number='1234567890',
            password='testpass123',
            position='HSSE MANAGER'
        )
        
        self.ops_manager = User.objects.create_user(
            email='ops@example.com',
            first_name='OPS',
            last_name='Manager',
            phone_number='0987654321',
            password='testpass123',
            position='OPS MANAGER'
        )
        
        self.md = User.objects.create_user(
            email='md@example.com',
            first_name='Managing',
            last_name='Director',
            phone_number='1122334455',
            password='testpass123',
            position='MD'
        )
        
        self.employee = User.objects.create_user(
            email='employee@example.com',
            first_name='Regular',
            last_name='Employee',
            phone_number='5544332211',
            password='testpass123',
            position='TECHNICIAN'
        )
    
    def test_draft_document_editable_by_creator(self):
        """Test draft document is editable by creator."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='DRAFT',
            created_by=self.employee
        )
        
        assert document.is_editable(self.employee) is True
    
    def test_draft_document_editable_by_hsse_manager(self):
        """Test draft document is editable by HSSE Manager."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='DRAFT',
            created_by=self.employee
        )
        
        assert document.is_editable(self.hsse_manager) is True
    
    def test_approved_document_not_editable(self):
        """Test approved document is not editable."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='APPROVED',
            created_by=self.hsse_manager
        )
        
        assert document.is_editable(self.hsse_manager) is False
        assert document.is_editable(self.md) is False
    
    def test_hsse_review_document_reviewable_by_hsse_manager(self):
        """Test document in HSSE_REVIEW is reviewable by HSSE Manager."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='HSSE_REVIEW',
            created_by=self.employee
        )
        
        assert document.is_hsse_reviewable(self.hsse_manager) is True
        assert document.is_hsse_reviewable(self.ops_manager) is False
    
    def test_ops_review_document_reviewable_by_ops_manager(self):
        """Test document in OPS_REVIEW is reviewable by OPS Manager."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='OPS_REVIEW',
            created_by=self.employee
        )
        
        assert document.is_ops_reviewable(self.ops_manager) is True
        assert document.is_ops_reviewable(self.hsse_manager) is False
    
    def test_md_approval_document_approvable_by_md(self):
        """Test document in MD_APPROVAL is approvable by MD."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='MD_APPROVAL',
            created_by=self.employee
        )
        
        assert document.is_md_approvable(self.md) is True
        assert document.is_md_approvable(self.hsse_manager) is False
    
    def test_document_rejectable_by_authorized_users(self):
        """Test document is rejectable by authorized users at each stage."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='HSSE_REVIEW',
            created_by=self.employee
        )
        
        assert document.is_rejectable(self.hsse_manager) is True
        assert document.is_rejectable(self.ops_manager) is True
        assert document.is_rejectable(self.md) is True
        assert document.is_rejectable(self.employee) is False


class DocumentVersioningTests(TestCase):
    """Tests for document versioning."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123',
            position='HSSE MANAGER'
        )
    
    def test_new_document_starts_at_version_1_0(self):
        """Test new document starts at version 1.0."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            created_by=self.user
        )
        
        assert document.version == '1.0'
        assert document.revision_number == 1.0
    
    def test_get_current_version_returns_correct_format(self):
        """Test get_current_version returns version.revision format."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            version='2.0',
            revision_number=3.0,
            created_by=self.user
        )
        
        assert document.get_current_version() == '2.0.3.0'
    
    def test_create_new_version_increments_version(self):
        """Test creating new version increments major version."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='APPROVED',
            version='1.0',
            revision_number=1.0,
            created_by=self.user
        )
        
        document.create_new_version()
        
        assert document.version == '2.0'
        assert document.revision_number == 1.0
        assert document.status == 'DRAFT'
    
    def test_create_new_version_from_unapproved_fails(self):
        """Test creating new version from unapproved document fails."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='DRAFT',
            created_by=self.user
        )
        
        with pytest.raises(ValueError):
            document.create_new_version()


class ChangeRequestTests(TestCase):
    """Tests for change request functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.hsse_manager = User.objects.create_user(
            email='hsse@example.com',
            first_name='HSSE',
            last_name='Manager',
            phone_number='1234567890',
            password='testpass123',
            position='HSSE MANAGER'
        )
        
        self.employee = User.objects.create_user(
            email='employee@example.com',
            first_name='Regular',
            last_name='Employee',
            phone_number='5544332211',
            password='testpass123',
            position='TECHNICIAN'
        )
        
        self.document = Document.objects.create(
            title='Test Policy',
            document_type='POLICY',
            status='APPROVED',
            created_by=self.hsse_manager
        )
    
    def test_create_change_request(self):
        """Test creating a change request."""
        change_request = ChangeRequest.objects.create(
            document=self.document,
            requested_by=self.employee,
            reason='Document needs updating'
        )
        
        assert change_request.status == 'PENDING'
        assert change_request.document == self.document
        assert change_request.requested_by == self.employee
    
    def test_only_hsse_manager_can_approve_change_request(self):
        """Test only HSSE Manager can approve change requests."""
        change_request = ChangeRequest.objects.create(
            document=self.document,
            requested_by=self.employee,
            reason='Update needed'
        )
        
        assert change_request.can_be_approved_by(self.hsse_manager) is True
        assert change_request.can_be_approved_by(self.employee) is False
    
    def test_approve_change_request_creates_new_document_version(self):
        """Test approving change request creates new document version."""
        original_version = self.document.version
        
        change_request = ChangeRequest.objects.create(
            document=self.document,
            requested_by=self.employee,
            reason='Update needed'
        )
        
        change_request.approve(self.hsse_manager, 'Approved for update')
        
        self.document.refresh_from_db()
        assert change_request.status == 'APPROVED'
        assert change_request.responded_by == self.hsse_manager
        assert change_request.responded_at is not None
        # Version should be incremented
        assert self.document.version != original_version
        assert self.document.status == 'DRAFT'
    
    def test_reject_change_request_updates_status(self):
        """Test rejecting change request updates status."""
        change_request = ChangeRequest.objects.create(
            document=self.document,
            requested_by=self.employee,
            reason='Update needed'
        )
        
        change_request.reject(self.hsse_manager, 'Not necessary')
        
        assert change_request.status == 'REJECTED'
        assert change_request.responded_by == self.hsse_manager
        assert change_request.admin_response == 'Not necessary'
    
    def test_non_hsse_manager_cannot_approve_change_request(self):
        """Test non-HSSE Manager cannot approve change request."""
        change_request = ChangeRequest.objects.create(
            document=self.document,
            requested_by=self.employee,
            reason='Update needed'
        )
        
        with pytest.raises(ValueError):
            change_request.approve(self.employee, 'Trying to approve')


class RecordTests(TestCase):
    """Tests for Record (form submission) functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.hsse_manager = User.objects.create_user(
            email='hsse@example.com',
            first_name='HSSE',
            last_name='Manager',
            phone_number='1234567890',
            password='testpass123',
            position='HSSE MANAGER'
        )
        
        self.employee = User.objects.create_user(
            email='employee@example.com',
            first_name='Regular',
            last_name='Employee',
            phone_number='5544332211',
            password='testpass123',
            position='TECHNICIAN'
        )
        
        self.form_document = Document.objects.create(
            title='Safety Inspection Form',
            document_type='FORM',
            status='APPROVED',
            created_by=self.hsse_manager
        )
    
    def test_create_record(self):
        """Test creating a record."""
        record = Record.objects.create(
            form_document=self.form_document,
            submitted_by=self.employee,
            submitted_file='test_file.pdf'
        )
        
        assert record.status == 'PENDING_REVIEW'
        assert record.form_document == self.form_document
        assert record.submitted_by == self.employee
    
    def test_only_hsse_manager_can_review_records(self):
        """Test only HSSE Manager can review records."""
        record = Record.objects.create(
            form_document=self.form_document,
            submitted_by=self.employee,
            submitted_file='test_file.pdf'
        )
        
        assert record.can_be_reviewed_by(self.hsse_manager) is True
        assert record.can_be_reviewed_by(self.employee) is False
    
    def test_approve_record_updates_status(self):
        """Test approving a record updates its status."""
        record = Record.objects.create(
            form_document=self.form_document,
            submitted_by=self.employee,
            submitted_file='test_file.pdf'
        )
        
        record.approve(self.hsse_manager)
        
        assert record.status == 'APPROVED'
        assert record.reviewed_by == self.hsse_manager
        assert record.reviewed_at is not None
        assert record.rejection_reason == ''
    
    def test_reject_record_updates_status_and_reason(self):
        """Test rejecting a record updates status and reason."""
        record = Record.objects.create(
            form_document=self.form_document,
            submitted_by=self.employee,
            submitted_file='test_file.pdf'
        )
        
        record.reject(self.hsse_manager, 'Incomplete information')
        
        assert record.status == 'REJECTED'
        assert record.reviewed_by == self.hsse_manager
        assert record.reviewed_at is not None
        assert record.rejection_reason == 'Incomplete information'
    
    def test_non_hsse_manager_cannot_approve_record(self):
        """Test non-HSSE Manager cannot approve record."""
        record = Record.objects.create(
            form_document=self.form_document,
            submitted_by=self.employee,
            submitted_file='test_file.pdf'
        )
        
        with pytest.raises(ValueError):
            record.approve(self.employee)
    
    def test_non_hsse_manager_cannot_reject_record(self):
        """Test non-HSSE Manager cannot reject record."""
        record = Record.objects.create(
            form_document=self.form_document,
            submitted_by=self.employee,
            submitted_file='test_file.pdf'
        )
        
        with pytest.raises(ValueError):
            record.reject(self.employee, 'Invalid reason')


class DocumentTemplateTests(TestCase):
    """Tests for document template functionality."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123',
            position='HSSE MANAGER'
        )
        
        self.template = DocumentTemplate.objects.create(
            name='Policy Template',
            document_type='POLICY',
            department='HSSE',
            sections={'intro': 'Introduction', 'body': 'Main content'},
            required_fields=['title', 'description'],
            created_by=self.user
        )
    
    def test_create_template(self):
        """Test creating a document template."""
        assert self.template.name == 'Policy Template'
        assert self.template.is_active is True
        assert self.template.version == '1.0'
    
    def test_create_document_from_template(self):
        """Test creating a document from template."""
        document = self.template.create_document_from_template(
            user=self.user,
            title='New Policy from Template',
            description='Test policy'
        )
        
        assert document.title == 'New Policy from Template'
        assert document.document_type == 'POLICY'
        assert document.metadata['template_id'] == self.template.id
        assert document.metadata['sections'] == self.template.sections
    
    def test_create_document_from_inactive_template_fails(self):
        """Test creating document from inactive template fails."""
        self.template.is_active = False
        self.template.save()
        
        with pytest.raises(ValueError):
            self.template.create_document_from_template(
                user=self.user,
                title='New Document'
            )
    
    def test_validate_document_checks_required_fields(self):
        """Test template validation checks required fields."""
        document = self.template.create_document_from_template(
            user=self.user,
            title='Test Document'
        )
        
        # Missing required fields
        errors = self.template.validate_document(document)
        
        assert len(errors) > 0
        assert any('required field' in error.lower() for error in errors)


class DocumentEdgeCasesTests(TestCase):
    """Tests for edge cases and boundary conditions."""
    
    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            phone_number='1234567890',
            password='testpass123',
            position='HSSE MANAGER'
        )
    
    def test_document_with_very_long_title(self):
        """Test document with maximum length title."""
        long_title = 'A' * 255  # max_length=255
        document = Document.objects.create(
            title=long_title,
            document_type='POLICY',
            created_by=self.user
        )
        
        assert document.title == long_title
    
    def test_document_with_special_characters_in_title(self):
        """Test document with special characters in title."""
        special_title = "Policy & Procedure: <Safety> [Important!] @2025"
        document = Document.objects.create(
            title=special_title,
            document_type='POLICY',
            created_by=self.user
        )
        
        assert document.title == special_title
    
    def test_document_with_unicode_characters(self):
        """Test document with Unicode characters."""
        unicode_title = "政策文档 - Política - Политика"
        document = Document.objects.create(
            title=unicode_title,
            document_type='POLICY',
            created_by=self.user
        )
        
        assert document.title == unicode_title
    
    def test_document_with_future_expiry_date(self):
        """Test document with future expiry date."""
        future_date = date.today() + timedelta(days=365)
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            expiry_date=future_date,
            created_by=self.user
        )
        
        assert document.expiry_date == future_date
    
    def test_document_with_past_expiry_date(self):
        """Test document with past expiry date (expired document)."""
        past_date = date.today() - timedelta(days=30)
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            expiry_date=past_date,
            created_by=self.user
        )
        
        assert document.expiry_date == past_date
        # Document should still be created but is expired
    
    def test_workflow_history_ordering(self):
        """Test workflow history is ordered by timestamp."""
        document = Document.objects.create(
            title='Test',
            document_type='POLICY',
            status='DRAFT',
            created_by=self.user
        )
        
        document.transition_to('HSSE_REVIEW', self.user, 'First action')
        document.transition_to('REJECTED', self.user, 'Second action')
        
        history = document.get_workflow_history()
        
        assert len(history) == 2
        assert history[0].comment == 'First action'
        assert history[1].comment == 'Second action'

