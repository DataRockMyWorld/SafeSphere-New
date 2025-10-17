"""
Factory classes for generating test data for documents app.
"""
import factory
from factory.django import DjangoModelFactory
from documents.models import (
    Document, Tag, ISOClause, ApprovalWorkflow, 
    ChangeRequest, DocumentTemplate, Record
)
from accounts.factories import UserFactory, HSSEManagerFactory


class TagFactory(DjangoModelFactory):
    """Factory for creating Tag instances."""
    
    class Meta:
        model = Tag
    
    name = factory.Sequence(lambda n: f'Tag{n}')


class ISOClauseFactory(DjangoModelFactory):
    """Factory for creating ISOClause instances."""
    
    class Meta:
        model = ISOClause
    
    class_code = factory.Sequence(lambda n: f'{n}.{n}')
    title = factory.Faker('sentence', nb_words=4)
    description = factory.Faker('paragraph')


class DocumentFactory(DjangoModelFactory):
    """Factory for creating Document instances."""
    
    class Meta:
        model = Document
    
    title = factory.Faker('sentence', nb_words=4)
    description = factory.Faker('paragraph')
    document_type = 'POLICY'
    category = factory.Faker('word')
    version = '1.0'
    revision_number = 1.0
    status = 'DRAFT'
    is_active = True
    
    created_by = factory.SubFactory(UserFactory)
    
    @factory.post_generation
    def tags(self, create, extracted, **kwargs):
        """Add tags to document after creation."""
        if not create:
            return
        
        if extracted:
            for tag in extracted:
                self.tags.add(tag)
    
    @factory.post_generation
    def iso_clauses(self, create, extracted, **kwargs):
        """Add ISO clauses to document after creation."""
        if not create:
            return
        
        if extracted:
            for clause in extracted:
                self.iso_clauses.add(clause)


class PolicyDocumentFactory(DocumentFactory):
    """Factory for creating Policy documents."""
    
    document_type = 'POLICY'
    category = 'Safety'


class ProcedureDocumentFactory(DocumentFactory):
    """Factory for creating Procedure documents."""
    
    document_type = 'PROCEDURE'
    category = 'Operations'


class FormDocumentFactory(DocumentFactory):
    """Factory for creating Form documents."""
    
    document_type = 'FORM'
    category = 'Records'


class ApprovedDocumentFactory(DocumentFactory):
    """Factory for creating approved documents."""
    
    status = 'APPROVED'
    approved_by = factory.SubFactory(HSSEManagerFactory)
    approved_at = factory.Faker('date_time_this_year')


class ApprovalWorkflowFactory(DjangoModelFactory):
    """Factory for creating ApprovalWorkflow instances."""
    
    class Meta:
        model = ApprovalWorkflow
    
    document = factory.SubFactory(DocumentFactory)
    position = 'HSSE MANAGER'
    action = 'SUBMIT'
    performed_by = factory.SubFactory(UserFactory)
    comment = factory.Faker('sentence')


class ChangeRequestFactory(DjangoModelFactory):
    """Factory for creating ChangeRequest instances."""
    
    class Meta:
        model = ChangeRequest
    
    document = factory.SubFactory(ApprovedDocumentFactory)
    requested_by = factory.SubFactory(UserFactory)
    reason = factory.Faker('paragraph', nb_sentences=2)
    status = 'PENDING'


class DocumentTemplateFactory(DjangoModelFactory):
    """Factory for creating DocumentTemplate instances."""
    
    class Meta:
        model = DocumentTemplate
    
    name = factory.Faker('sentence', nb_words=3)
    description = factory.Faker('paragraph')
    document_type = 'POLICY'
    department = 'HSSE'
    version = '1.0'
    is_active = True
    
    sections = factory.LazyFunction(lambda: {
        'introduction': 'Introduction section',
        'body': 'Main content section',
        'conclusion': 'Conclusion section'
    })
    
    required_fields = factory.LazyFunction(lambda: ['title', 'description'])
    validation_rules = factory.LazyFunction(lambda: {})
    
    created_by = factory.SubFactory(HSSEManagerFactory)


class RecordFactory(DjangoModelFactory):
    """Factory for creating Record instances."""
    
    class Meta:
        model = Record
    
    form_document = factory.SubFactory(FormDocumentFactory, status='APPROVED')
    submitted_by = factory.SubFactory(UserFactory)
    submitted_file = factory.django.FileField(filename='test_record.pdf')
    status = 'PENDING_REVIEW'

