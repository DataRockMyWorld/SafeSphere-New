# SafeSphere Document Management Module

**User Guide & Reference Documentation**

Version: 1.0  
Last Updated: October 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Getting Started](#getting-started)
5. [Core Workflows](#core-workflows)
6. [Feature Details](#feature-details)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The **Document Management Module** provides comprehensive HSSE (Health, Safety, Security, and Environment) document lifecycle management with built-in approval workflows, version control, and change request tracking.

### Purpose

- Centralize all HSSE documentation in a structured repository
- Enforce approval workflows for document quality and compliance
- Track document changes and maintain version history
- Ensure only approved, current documents are in circulation
- Provide audit trails for compliance verification

### Who Should Use This Module

- **HSSE Managers**: Create, manage, and approve documents
- **Operations Managers**: Review and approve operational documents
- **Managing Director**: Final approval for critical documents
- **All Staff**: View approved documents and submit change requests

---

## Key Features

### 1. Document Library
- **Centralized repository** for all HSSE documents
- **Advanced search** by title, category, status, or document type
- **Categorization** by Safety, Environment, Security, Health, Training, Emergency
- **Document types**: Policy, Procedure, Form, Record, Guideline, Standard
- **Version control** with history tracking
- **Download** approved documents

### 2. Approval Workflow
Multi-stage approval process:
- **Stage 1**: HSSE Manager Review
- **Stage 2**: Operations Manager Review  
- **Stage 3**: Managing Director Approval
- **Status tracking**: Draft → HSSE Review → Ops Review → MD Approval → Approved
- **Rejection handling**: Documents can be rejected at any stage with comments

### 3. Change Request System
- **Submit change requests** for approved documents
- **Track request status**: Pending → Approved → Rejected
- **HSSE Manager review** of all change requests
- **Reason documentation** for audit purposes
- **Automatic notifications** to requesters

### 4. Document History
- **Version tracking** for all documents
- **Change log** showing what was modified and when
- **User attribution** - who made what changes
- **Rollback capability** to previous versions
- **Audit trail** for compliance reporting

### 5. Records Management
- **Separate records repository** for completed forms and logs
- **Archival system** for historical records
- **Search and retrieval** of past records
- **Retention management** based on compliance requirements

---

## User Roles & Permissions

### HSSE Manager
**Full Access** - Primary document administrators

**Permissions:**
- ✅ Create new documents
- ✅ Edit draft documents
- ✅ Submit documents for review
- ✅ Approve/reject documents at HSSE Review stage
- ✅ Manage change requests (approve/reject)
- ✅ View all documents (any status)
- ✅ Access document history
- ✅ Manage document categories
- ✅ Delete documents (with restrictions)

**Key Responsibilities:**
- Ensuring document quality and accuracy
- Managing document approval workflow
- Processing change requests
- Maintaining document library organization

### Operations Manager
**Review & Approval** - Second-stage approvers

**Permissions:**
- ✅ View all documents
- ✅ Approve/reject documents at Operations Review stage
- ✅ Submit change requests
- ✅ Access document history
- ❌ Create new documents (must request from HSSE)
- ❌ Manage change requests (HSSE Manager only)

**Key Responsibilities:**
- Reviewing documents from operational perspective
- Ensuring documents align with operational procedures
- Providing feedback on document practicality

### Managing Director (MD)
**Final Approval** - Third-stage approvers

**Permissions:**
- ✅ View all documents
- ✅ Approve/reject documents at MD Approval stage
- ✅ Submit change requests
- ❌ Create or edit documents
- ❌ Lower-stage approvals

**Key Responsibilities:**
- Final approval of critical HSSE documents
- Strategic oversight of HSSE documentation
- Ensuring alignment with organizational policies

### General Staff
**View & Request** - Document consumers

**Permissions:**
- ✅ View **approved** documents only
- ✅ Download approved documents
- ✅ Submit change requests for documents
- ✅ View their own change requests
- ❌ View draft or in-review documents
- ❌ Edit or approve documents
- ❌ Access document management features

**Key Responsibilities:**
- Following approved HSSE procedures
- Reporting errors or needed updates via change requests
- Maintaining awareness of current documents

---

## Getting Started

### Accessing the Module

1. **Login** to SafeSphere
2. Navigate to **Dashboard**
3. Click **"Document Management"** module card
4. You'll be taken to the **Document Management Dashboard**

### Dashboard Overview

The dashboard provides:
- **Total documents** count
- **Pending approvals** count (if you're an approver)
- **Documents by category** breakdown
- **Documents by status** distribution
- **Recent activity** feed
- **Quick actions** for common tasks

---

## Core Workflows

### Workflow 1: Creating a New Document

**Who:** HSSE Manager

**Steps:**

1. **Navigate** to Document Library
2. **Click** "Create Document" button
3. **Fill in document details:**
   - Title (e.g., "Fire Evacuation Procedure")
   - Category (Safety, Environment, etc.)
   - Document Type (Policy, Procedure, etc.)
   - Version (e.g., "1.0")
   - Content (document text or upload file)
4. **Save as Draft** (for later) OR **Submit for Review**
5. **Document enters approval workflow** if submitted

**Best Practices:**
- Use clear, descriptive titles
- Select appropriate category and type
- Start with version 1.0 for new documents
- Include comprehensive content before submitting
- Attach supporting files if needed

---

### Workflow 2: Document Approval Process

**Multi-Stage Approval:**

#### Stage 1: HSSE Manager Review
**Who:** HSSE Manager (different from creator)

1. **Navigate** to Approvals section
2. **Review** documents in "HSSE Review" status
3. **Open** document to read content
4. **Decide:**
   - ✅ **Approve**: Document moves to Operations Review
   - ❌ **Reject**: Document returns to draft with comments
5. **Add comments** explaining decision

#### Stage 2: Operations Manager Review
**Who:** Operations Manager

1. **Navigate** to Approvals section
2. **Review** documents in "Ops Review" status
3. **Assess** operational feasibility
4. **Decide:**
   - ✅ **Approve**: Document moves to MD Approval
   - ❌ **Reject**: Document returns to draft with feedback

#### Stage 3: Managing Director Approval
**Who:** Managing Director

1. **Navigate** to Approvals section
2. **Review** documents in "MD Approval" status
3. **Final approval** decision
4. **Decide:**
   - ✅ **Approve**: Document becomes officially approved
   - ❌ **Reject**: Document returns to draft

**Status Flow:**
```
Draft → HSSE Review → Ops Review → MD Approval → Approved
          ↓              ↓             ↓
       Rejected       Rejected      Rejected
```

---

### Workflow 3: Requesting Document Changes

**Who:** Any authenticated user

**When to use:**
- Document has errors or outdated information
- Regulations have changed
- Operational procedures have evolved
- Formatting or clarity improvements needed

**Steps:**

1. **Find** the document needing changes
2. **Click** "Request Change" button
3. **Provide detailed reason:**
   - What needs to change
   - Why it needs to change
   - Supporting information
4. **Submit** change request
5. **Track status:**
   - Pending: Awaiting HSSE Manager review
   - Approved: Changes will be made
   - Rejected: Request denied with explanation

**HSSE Manager receives request and:**
- Reviews the request
- Approves (creates new version) OR
- Rejects (provides reason)

---

### Workflow 4: Viewing Document History

**Who:** HSSE Managers, Approvers

**Purpose:**
- Track document evolution
- Audit compliance
- Understand changes over time
- Rollback if needed

**Steps:**

1. **Navigate** to Document History
2. **View timeline** of all document changes
3. **See details:**
   - What changed
   - Who made the change
   - When it was changed
   - Approval status changes
4. **Compare versions** if needed
5. **Rollback** to previous version (HSSE Manager only)

---

## Feature Details

### Document Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Safety** | Workplace safety procedures | Lockout/Tagout Procedure, PPE Policy |
| **Environment** | Environmental management | Waste Management Plan, Spill Response |
| **Security** | Security protocols | Access Control Policy, Incident Response |
| **Health** | Occupational health | Medical Surveillance Program, First Aid |
| **Training** | Training materials | Induction Manual, Safety Training Guide |
| **Emergency** | Emergency response | Evacuation Plan, Emergency Contacts |

### Document Types

| Type | Description | Approval Required |
|------|-------------|-------------------|
| **Policy** | High-level organizational statements | Yes - All 3 stages |
| **Procedure** | Step-by-step instructions | Yes - All 3 stages |
| **Form** | Templates for data collection | Yes - HSSE & Ops |
| **Record** | Completed documentation | No - Direct to Records |
| **Guideline** | Best practice recommendations | Yes - HSSE & Ops |
| **Standard** | Technical specifications | Yes - All 3 stages |

### Document Status Definitions

- **Draft**: Work in progress, not official
- **HSSE Review**: Awaiting HSSE Manager approval
- **Ops Review**: Awaiting Operations Manager approval
- **MD Approval**: Awaiting Managing Director approval
- **Approved**: Official, current, ready for use
- **Rejected**: Not approved, needs revision
- **Archived**: Superseded by newer version, kept for records

---

## Best Practices

### For Document Creators (HSSE Managers)

1. **Clear Naming Convention**
   - Use descriptive titles: "Fire Extinguisher Inspection Procedure" not "Fire Doc"
   - Include scope: "Site-Wide Lockout Tagout Procedure"

2. **Comprehensive Content**
   - Include purpose statement
   - Define scope and applicability
   - Provide step-by-step instructions
   - List responsibilities
   - Include references to regulations

3. **Version Control**
   - Start at version 1.0
   - Increment minor version (1.1, 1.2) for small changes
   - Increment major version (2.0, 3.0) for significant changes
   - Document version changes in history

4. **Before Submitting for Approval**
   - Proofread thoroughly
   - Verify regulatory references
   - Check formatting consistency
   - Ensure all required sections included
   - Attach supporting documents if needed

### For Approvers

1. **Timely Reviews**
   - Review documents within 3 business days
   - Don't create bottlenecks in approval process

2. **Constructive Feedback**
   - Provide specific, actionable feedback when rejecting
   - Explain what needs to change
   - Suggest improvements

3. **Compliance Verification**
   - Verify alignment with regulations
   - Check for conflicts with existing documents
   - Ensure completeness

### For All Users

1. **Stay Informed**
   - Check dashboard regularly for new/updated documents
   - Read documents applicable to your role
   - Bookmark frequently used documents

2. **Submit Quality Change Requests**
   - Provide clear, specific reasons
   - Include evidence or examples
   - Suggest specific changes if possible

3. **Use Approved Documents Only**
   - Never use draft or rejected documents
   - Check document status before following procedures
   - Verify you have the latest version

---

## Troubleshooting

### Common Issues

#### "I can't create a document"
**Solution:** Only HSSE Managers can create documents. If you need a new document, submit a request to your HSSE Manager.

#### "My document is stuck in review"
**Solution:** 
- Check which stage it's at
- Contact the appropriate approver:
  - HSSE Review → HSSE Manager
  - Ops Review → Operations Manager
  - MD Approval → Managing Director

#### "I submitted a change request but nothing happened"
**Solution:**
- Change requests require HSSE Manager review
- Check status in your submitted requests
- Allow 3-5 business days for review
- If urgent, contact HSSE Manager directly

#### "I can't find a document"
**Solution:**
- Use search function with keywords
- Check filters - you might be filtering it out
- Verify document status - you may not have permission to view drafts
- Check if document was archived

#### "Document won't download"
**Solution:**
- Ensure document has an uploaded file
- Check your browser's download settings
- Try a different browser
- Contact IT if problem persists

---

## Quick Reference

### Keyboard Shortcuts (Coming Soon)
- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + N`: New document (HSSE Managers only)
- `Escape`: Close dialogs

### Status Icons
- 📝 Draft
- 🔍 In Review
- ✅ Approved
- ❌ Rejected
- 📦 Archived

### Contact Support

For technical issues or questions:
- **HSSE Manager**: Document management questions
- **IT Support**: Technical/system issues
- **Module Admin**: Permission or access issues

---

## Appendix A: Document Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Document Lifecycle                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CREATE (HSSE Manager)                                   │
│     ↓                                                        │
│  2. DRAFT (editable, not official)                          │
│     ↓                                                        │
│  3. SUBMIT FOR REVIEW                                       │
│     ↓                                                        │
│  4. HSSE REVIEW (HSSE Manager approves/rejects)             │
│     ↓ Approved                                              │
│  5. OPS REVIEW (Ops Manager approves/rejects)               │
│     ↓ Approved                                              │
│  6. MD APPROVAL (MD approves/rejects)                       │
│     ↓ Approved                                              │
│  7. APPROVED (official, published, in use)                  │
│     ↓ When updated                                          │
│  8. NEW VERSION CREATED                                     │
│     ↓                                                        │
│  9. OLD VERSION ARCHIVED (kept for records)                 │
│                                                              │
│  Change Requests can be submitted at any point after        │
│  document is approved.                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Appendix B: Approval Authority Matrix

| Document Type | HSSE Manager | Ops Manager | MD |
|---------------|--------------|-------------|-----|
| **Policy** (Company-wide) | Required | Required | Required |
| **Procedure** (Operational) | Required | Required | Required |
| **Form** (Template) | Required | Required | Optional |
| **Guideline** (Advisory) | Required | Required | Optional |
| **Standard** (Technical) | Required | Required | Required |
| **Record** (Completed) | Auto-approved | N/A | N/A |

---

*This guide is part of the SafeSphere HSSE Management System. For additional documentation, see the main SafeSphere documentation portal.*

