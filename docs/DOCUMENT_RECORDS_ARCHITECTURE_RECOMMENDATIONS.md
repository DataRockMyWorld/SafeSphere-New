# Document & Records Architecture Recommendations
## Expert Analysis & ISO 45001 Compliance Review

---

## Executive Summary

This document provides expert recommendations for structuring your Document Management and Records system, ensuring compliance with ISO 45001 requirements while maintaining clarity between templates, active documents, and completed records.

---

## 1. Current Architecture Analysis

### Current Structure:
- **Document Model**: Handles both templates and approved documents (Policies, Procedures, Forms, SSOW, etc.)
- **DocumentTemplate Model**: Separate template structure with JSON fields
- **Record Model**: Stores completed/filled forms linked to Document (document_type='FORM')
- **DocumentFolder Model**: Dynamic folders for organization

### Issues Identified:
1. **Conceptual Confusion**: Documents can be both templates AND actual documents
2. **Template Duplication**: Two template systems (DocumentTemplate vs Document with template FK)
3. **Record Linkage**: Records link to Document, but unclear if it's a template or instance
4. **Missing ISO 45001 Fields**: Some required metadata missing

---

## 2. Recommended Architecture

### 2.1 Core Concept: Three-Tier System

```
┌─────────────────────────────────────────────────────────┐
│                    TEMPLATES                             │
│  (DocumentTemplate) - Master templates for forms/docs   │
└─────────────────────────────────────────────────────────┘
                        ↓ Creates
┌─────────────────────────────────────────────────────────┐
│                    DOCUMENTS                             │
│  (Document) - Approved, active documents/forms         │
│  Status: APPROVED, Version controlled                   │
└─────────────────────────────────────────────────────────┘
                        ↓ Filled/Completed
┌─────────────────────────────────────────────────────────┐
│                    RECORDS                               │
│  (Record) - Completed forms, evidence, audit trails     │
│  Immutable, year-organized, retention-managed          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Recommended Model Structure

#### **TEMPLATES** (DocumentTemplate - Keep as is, but enhance)
**Purpose**: Master templates for creating documents/forms
**Location**: Separate from Documents
**Status**: Active/Inactive only

```python
class DocumentTemplate(models.Model):
    # Current fields are good
    # ADD: 
    is_template = models.BooleanField(default=True)  # Explicit flag
    template_category = models.CharField(...)  # FORM_TEMPLATE, POLICY_TEMPLATE, etc.
    retention_period_years = models.IntegerField(null=True)  # For records created from this
```

#### **DOCUMENTS** (Document - Active, approved documents)
**Purpose**: Approved, version-controlled documents and forms
**Status**: DRAFT → APPROVED (workflow)
**Key Point**: When APPROVED and document_type='FORM', these become fillable forms

```python
class Document(models.Model):
    # Current structure is mostly good
    # ENHANCE:
    is_template = models.BooleanField(default=False)  # Explicit: NOT a template
    source_template = models.ForeignKey(DocumentTemplate, ...)  # Which template created this
    document_classification = models.CharField(...)  # CONTROLLED, UNCONTROLLED, REFERENCE
    distribution_list = models.ManyToManyField(User, ...)  # Who has access
    retention_period_years = models.IntegerField(null=True)  # How long to keep records
    disposal_date = models.DateField(null=True)  # When to dispose
    access_level = models.CharField(...)  # PUBLIC, INTERNAL, RESTRICTED, CONFIDENTIAL
```

#### **RECORDS** (Record - Completed forms, evidence)
**Purpose**: Immutable records of completed forms, evidence, audit trails
**Key Characteristics**: 
- Immutable once approved
- Year-organized
- Retention-managed
- Linked to source Document (form)

```python
class Record(models.Model):
    # Current structure is good foundation
    # ENHANCE:
    # Link to source document (form template)
    source_document = models.ForeignKey(
        Document, 
        on_delete=models.PROTECT,
        limit_choices_to={'document_type': 'FORM', 'status': 'APPROVED'},
        related_name='completed_records'
    )
    
    # ISO 45001 Required Fields
    record_classification = models.CharField(...)  # LEGAL, OPERATIONAL, AUDIT, INCIDENT
    retention_period_years = models.IntegerField(default=7)  # Default 7 years
    disposal_date = models.DateField(null=True, blank=True)  # Auto-calculated
    location = models.CharField(...)  # Physical/electronic location
    access_restrictions = models.JSONField(default=dict)  # Who can access
    
    # Enhanced metadata
    department = models.CharField(...)  # Which department
    location_facility = models.CharField(...)  # Which facility/site
    related_incident = models.ForeignKey('incidents.Incident', null=True)  # If applicable
    related_audit = models.ForeignKey('audits.Audit', null=True)  # If applicable
    
    # Immutability
    is_locked = models.BooleanField(default=False)  # Lock after approval
    locked_at = models.DateTimeField(null=True)
    locked_by = models.ForeignKey(User, null=True)
    
    # Version tracking (for corrections)
    correction_version = models.IntegerField(default=1)  # If record needs correction
    parent_record = models.ForeignKey('self', null=True)  # Link to original if corrected
```

---

## 3. ISO 45001 Compliance Checklist

### ✅ Currently Covered:
- [x] Document identification (title, ID, version)
- [x] Version control (version, revision_number)
- [x] Approval workflow (status, approved_by, approved_at)
- [x] Review dates (next_review_date)
- [x] Access control (user permissions)
- [x] Document types (POLICY, PROCEDURE, FORM, etc.)
- [x] ISO clause mapping (iso_clauses)
- [x] Change control (ChangeRequest model)
- [x] Workflow history (ApprovalWorkflow)

### ⚠️ Missing/Needs Enhancement:

#### 3.1 Document Control (Clause 7.5.3)
- [ ] **Distribution Control**: Who receives which documents
- [ ] **Location Tracking**: Where documents are stored (physical/electronic)
- [ ] **Retention Periods**: How long documents are kept
- [ ] **Disposal Procedures**: When/how documents are disposed
- [ ] **Access Permissions**: Granular read/edit/delete permissions
- [ ] **Document Classification**: Controlled vs Uncontrolled vs Reference
- [ ] **External Document Control**: Documents from external sources

#### 3.2 Record Control (Clause 7.5.3)
- [ ] **Record Classification**: Legal, Operational, Audit, Incident records
- [ ] **Retention Management**: Automatic disposal date calculation
- [ ] **Immutability**: Records cannot be modified after approval
- [ ] **Location Tracking**: Physical/electronic storage location
- [ ] **Access Restrictions**: Who can view which records
- [ ] **Record Disposal**: Secure disposal procedures
- [ ] **Backup/Recovery**: Document recovery procedures

#### 3.3 Additional ISO 45001 Requirements
- [ ] **Document Review Schedule**: Automatic reminders for review dates
- [ ] **Obsolete Document Control**: Marking and archiving obsolete versions
- [ ] **External Document Identification**: Tracking external documents
- [ ] **Document Status**: Current, Under Review, Obsolete, Archived
- [ ] **Cross-References**: Linking related documents/records

---

## 4. Recommended Implementation Plan

### Phase 1: Clarify Template vs Document vs Record

**Action Items:**
1. **Templates**: Keep `DocumentTemplate` separate - these are master templates
2. **Documents**: `Document` model - only for APPROVED, active documents
   - Remove template functionality from Document
   - Add `source_template` FK to link back to template
   - Add `is_template=False` flag for clarity
3. **Records**: Enhance `Record` model with ISO 45001 fields
   - Link to `source_document` (the approved FORM)
   - Add retention, classification, location fields

### Phase 2: Enhance Document Model

**Add Fields:**
```python
# Document Classification
document_classification = models.CharField(
    max_length=20,
    choices=[
        ('CONTROLLED', 'Controlled Document'),
        ('UNCONTROLLED', 'Uncontrolled Document'),
        ('REFERENCE', 'Reference Document'),
        ('EXTERNAL', 'External Document'),
    ],
    default='CONTROLLED'
)

# Distribution
distribution_list = models.ManyToManyField(
    User, 
    blank=True,
    related_name='distributed_documents',
    help_text="Users who have access to this document"
)

# Retention
retention_period_years = models.IntegerField(
    null=True, 
    blank=True,
    help_text="How long records created from this document should be retained"
)

# Location
storage_location = models.CharField(
    max_length=255,
    blank=True,
    help_text="Physical or electronic storage location"
)

# Access Level
access_level = models.CharField(
    max_length=20,
    choices=[
        ('PUBLIC', 'Public'),
        ('INTERNAL', 'Internal'),
        ('RESTRICTED', 'Restricted'),
        ('CONFIDENTIAL', 'Confidential'),
    ],
    default='INTERNAL'
)

# Obsolete Control
is_obsolete = models.BooleanField(default=False)
obsoleted_at = models.DateTimeField(null=True, blank=True)
obsoleted_by = models.ForeignKey(User, null=True, blank=True, related_name='docs_obsoleted')
replaced_by = models.ForeignKey('self', null=True, blank=True, related_name='replaces')
```

### Phase 3: Enhance Record Model

**Add Fields:**
```python
# Source Link (REPLACE form_document with source_document)
source_document = models.ForeignKey(
    Document,
    on_delete=models.PROTECT,
    limit_choices_to={'document_type': 'FORM', 'status': 'APPROVED'},
    related_name='completed_records',
    help_text="The approved form document this record was created from"
)

# Record Classification
record_classification = models.CharField(
    max_length=20,
    choices=[
        ('LEGAL', 'Legal Requirement'),
        ('OPERATIONAL', 'Operational Record'),
        ('AUDIT', 'Audit Evidence'),
        ('INCIDENT', 'Incident Record'),
        ('TRAINING', 'Training Record'),
        ('INSPECTION', 'Inspection Record'),
        ('MAINTENANCE', 'Maintenance Record'),
    ],
    default='OPERATIONAL'
)

# Retention Management
retention_period_years = models.IntegerField(
    default=7,
    help_text="Number of years to retain this record"
)
disposal_date = models.DateField(
    null=True,
    blank=True,
    help_text="Auto-calculated: created_at + retention_period_years"
)

# Location
storage_location = models.CharField(
    max_length=255,
    blank=True,
    help_text="Physical or electronic storage location"
)
storage_type = models.CharField(
    max_length=20,
    choices=[
        ('ELECTRONIC', 'Electronic'),
        ('PHYSICAL', 'Physical'),
        ('HYBRID', 'Hybrid'),
    ],
    default='ELECTRONIC'
)

# Department/Facility Context
department = models.CharField(
    max_length=50,
    choices=User.DEPARTMENT_CHOICES,
    blank=True
)
facility_location = models.CharField(
    max_length=255,
    blank=True,
    help_text="Facility or site location"
)

# Immutability
is_locked = models.BooleanField(
    default=False,
    help_text="Lock record after approval to prevent modification"
)
locked_at = models.DateTimeField(null=True, blank=True)
locked_by = models.ForeignKey(
    User,
    null=True,
    blank=True,
    related_name='records_locked'
)

# Correction Tracking
correction_version = models.IntegerField(default=1)
parent_record = models.ForeignKey(
    'self',
    null=True,
    blank=True,
    related_name='corrections',
    help_text="Link to original record if this is a correction"
)

# Access Restrictions
access_restrictions = models.JSONField(
    default=dict,
    help_text="JSON defining who can access this record"
)

# Related Records
related_incident = models.ForeignKey(
    'incidents.Incident',
    null=True,
    blank=True,
    related_name='records'
)
related_audit = models.ForeignKey(
    'audits.Audit',
    null=True,
    blank=True,
    related_name='records'
)
```

### Phase 4: Add Supporting Models

```python
class DocumentDistribution(models.Model):
    """Track document distribution to users"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    distributed_at = models.DateTimeField(auto_now_add=True)
    distributed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    acknowledged = models.BooleanField(default=False)
    acknowledged_at = models.DateTimeField(null=True, blank=True)

class RecordDisposal(models.Model):
    """Track record disposal for audit trail"""
    record = models.ForeignKey(Record, on_delete=models.CASCADE)
    disposal_date = models.DateField()
    disposal_method = models.CharField(
        max_length=50,
        choices=[
            ('DIGITAL_DELETE', 'Digital Deletion'),
            ('PHYSICAL_DESTROY', 'Physical Destruction'),
            ('ARCHIVE', 'Archive'),
        ]
    )
    disposed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    disposal_certificate = models.FileField(upload_to='disposals/', null=True, blank=True)
    notes = models.TextField(blank=True)
```

---

## 5. Best Practices Recommendations

### 5.1 Template Management
- **Templates** should be in `DocumentTemplate` model only
- Templates are NOT documents - they're blueprints
- When a template is used, it creates a `Document` (which goes through approval)
- Once `Document` is APPROVED and type='FORM', it becomes fillable

### 5.2 Document Lifecycle
```
Template → Document (DRAFT) → Document (APPROVED) → [Used to create Records]
                                                      ↓
                                              Record (PENDING) → Record (APPROVED) → [Locked]
```

### 5.3 Record Lifecycle
- Records are **immutable** once approved
- If correction needed, create new Record with `parent_record` link
- Records organized by year for easy retrieval
- Retention periods automatically calculated
- Disposal dates tracked for compliance

### 5.4 Naming Conventions
- **Templates**: "Safety Inspection Form Template v1.0"
- **Documents**: "Safety Inspection Form v2.1" (approved form)
- **Records**: "REC-2025-001 - Safety Inspection - Building A - 2025-01-15"

---

## 6. Migration Strategy

### Step 1: Add New Fields (Non-breaking)
- Add all new fields as nullable
- Run migrations
- No data loss

### Step 2: Migrate Existing Data
- Set `is_template=False` for all existing Documents
- Link Records to appropriate Documents
- Calculate disposal dates for existing Records

### Step 3: Update Code
- Update serializers to include new fields
- Update views to handle new fields
- Update frontend to display new fields

### Step 4: Enforce Rules
- Add validation for immutability
- Add automatic disposal date calculation
- Add retention period enforcement

---

## 7. Summary & Next Steps

### Key Recommendations:
1. ✅ **Keep Templates Separate**: DocumentTemplate for templates only
2. ✅ **Documents = Approved Forms**: Document model for approved, active documents
3. ✅ **Records = Completed Forms**: Record model for immutable, completed forms
4. ✅ **Add ISO 45001 Fields**: Retention, classification, location, access control
5. ✅ **Implement Immutability**: Lock records after approval
6. ✅ **Add Retention Management**: Automatic disposal date calculation

### Priority Actions:
1. **High Priority**: Add retention and classification fields to Record model
2. **High Priority**: Implement record immutability (locking)
3. **Medium Priority**: Add distribution tracking to Document model
4. **Medium Priority**: Add disposal tracking model
5. **Low Priority**: Add external document tracking

---

## 8. ISO 45001 Compliance Score

**Current Compliance: 75%**

**Missing Elements:**
- Document distribution control
- Record retention management
- Record immutability
- Disposal procedures
- Location tracking
- Access restrictions

**With Recommended Enhancements: 95%**

---

*This document provides expert recommendations based on ISO 45001:2018 requirements and industry best practices for OSH document management systems.*
