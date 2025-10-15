# SafeSphere Legal Compliance Module

**User Guide & Reference Documentation**

Version: 1.0  
Last Updated: October 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Getting Started](#getting-started)
5. [Module Components](#module-components)
6. [Core Workflows](#core-workflows)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The **Legal Compliance Module** is a comprehensive system for managing HSSE regulatory compliance, tracking legal obligations, monitoring deadlines, and maintaining evidence of compliance.

### Purpose

- **Track all applicable** HSSE laws and regulations
- **Manage compliance obligations** derived from legal requirements
- **Monitor deadlines** for permits, licenses, and reviews
- **Store compliance evidence** for audits
- **Conduct annual reviews** of compliance status
- **Identify regulatory changes** that impact operations

### Module Philosophy

Transforms compliance from **reactive** (scrambling during audits) to **proactive** (real-time compliance monitoring with clear accountability).

---

## Key Features

### 1. Compliance Dashboard
**Real-time compliance overview**

- **Compliance rate** percentage with visual progress
- **Overdue items** requiring immediate attention
- **Upcoming deadlines** (next 30 days)
- **Regulatory changes** pending review
- **Status breakdown**: Compliant/Partial/Non-Compliant
- **Quick navigation** to critical items

### 2. Compliance Obligations
**Core compliance tracking system**

- **Register all** legal and regulatory requirements
- **Break down** complex regulations into specific, actionable obligations
- **Assign responsibilities** to departments and individuals
- **Track compliance status** (Compliant/Partial/Non-Compliant)
- **Document evaluations** and evidence
- **Filter and search** by department, status, country, category
- **Expandable cards** for detailed information

### 3. Annual Review Workflow
**Structured yearly compliance reviews**

- **3-step review process**:
  1. Review and update compliance status
  2. Document findings and set next review date
  3. Archive previous year's evidence
- **Automatic date calculation** (365-day cycles)
- **Review tracking** with history
- **Evidence preservation** for historical audit trails

### 4. Compliance Calendar
**Visual deadline management**

- **Calendar view**: Month-by-month deadline visualization
- **List view**: Chronological deadline listing
- **Color-coded urgency**: Red (Critical) → Yellow (Warning) → Green (Good)
- **Click-to-view** event details
- **Alert summary**: Expired, Critical (≤30 days), Warning (30-90 days)
- **Integration** with permit/license expiry tracking

### 5. Evidence Management
**Centralized compliance documentation**

- **Upload evidence** documents (PDF, images, Word, Excel)
- **Link to specific** compliance obligations
- **Archive system** for year-over-year evidence
- **Search and filter** by obligation
- **Active vs Archived** views
- **Year tagging** for historical records
- **Quick view/download** of documents

### 6. HSSE Law Library
**Legal reference repository**

**Pre-loaded with 12 Ghana HSSE laws including:**
- Labour Act, 2003 (Act 651)
- Environmental Protection Agency Act, 1994 (Act 490)
- Factories, Offices and Shops Act, 1970 (Act 328)
- Fire Precaution Regulations, 2003 (L.I. 1724)
- Mining Safety Regulations, 2012 (L.I. 2182)
- And 7 more...

**Features:**
- **Full law details**: Act numbers, effective dates, enforcement authorities
- **Key provisions**: Specific sections and requirements
- **Penalties**: Consequences for non-compliance
- **Applicability**: Who/what the law applies to
- **Official links**: Government source references
- **Impact analysis**: Shows obligations derived from each law
- **Amendment tracking**: History of law changes

### 7. Regulatory Change Tracker
**Permit & license expiry monitoring**

- **Track permits and licenses** with expiry dates
- **Automatic countdown**: Days until expiry
- **Urgency classification**:
  - EXPIRED: 0 days (red)
  - CRITICAL: ≤30 days (red)
  - WARNING: 30-90 days (yellow)
  - GOOD: >90 days (green)
- **Evidence attachment**: Upload permit PDFs
- **Statistics dashboard**: Visual urgency breakdown
- **Renewal actions**: Document renewal processes

---

## User Roles & Permissions

### HSSE Manager
**Full Access** - Primary compliance officers

**Permissions:**
- ✅ Create/edit/delete compliance obligations
- ✅ Conduct annual reviews
- ✅ Upload and manage evidence
- ✅ Add/edit laws in library
- ✅ Create/edit permit trackers
- ✅ Archive evidence
- ✅ Update compliance status
- ✅ Assign obligations to departments/people
- ✅ View all compliance data

**Key Responsibilities:**
- Identifying applicable regulations
- Creating compliance obligations from laws
- Conducting annual compliance reviews
- Managing evidence collection
- Monitoring compliance deadlines
- Reporting to management on compliance status

### Department Heads (Operations, Finance, etc.)
**Departmental Compliance** - Responsible for their area

**Permissions:**
- ✅ View obligations assigned to their department
- ✅ Update compliance status for their obligations
- ✅ Upload evidence for their obligations
- ✅ View law library
- ✅ View compliance calendar
- ❌ Create new obligations
- ❌ Conduct annual reviews
- ❌ Access other departments' obligations

**Key Responsibilities:**
- Ensuring compliance for their department's obligations
- Uploading evidence of compliance
- Reporting non-compliance issues to HSSE
- Coordinating with assigned personnel

### Assigned Personnel (Safety Officers, Compliance Officers, etc.)
**Task Execution** - Execute specific compliance tasks

**Permissions:**
- ✅ View obligations assigned to them
- ✅ Upload evidence for their obligations
- ✅ Update compliance notes
- ✅ View law library
- ❌ Change compliance status
- ❌ Delete obligations
- ❌ Conduct reviews

**Key Responsibilities:**
- Completing assigned compliance tasks
- Collecting and uploading evidence
- Reporting completion to department heads

### General Staff
**Awareness** - Stay informed

**Permissions:**
- ✅ View approved compliance obligations
- ✅ View law library
- ✅ View compliance calendar
- ❌ Edit any compliance data
- ❌ Upload evidence

**Key Responsibilities:**
- Understanding compliance requirements affecting their work
- Following established procedures
- Reporting compliance concerns

---

## Getting Started

### First-Time Setup (HSSE Manager)

#### Step 1: Apply Database Migrations
```bash
# If using Docker:
docker-compose run --rm backend python manage.py migrate legals

# If using local Python:
cd backend
python manage.py migrate legals
```

**This seeds:**
- 12 HSSE categories
- 12 job positions
- 12 Ghana HSSE laws

#### Step 2: Review Seeded Laws
1. Navigate to **Law Library**
2. Review the 12 pre-loaded Ghana HSSE laws
3. Expand each law to see key provisions
4. Add additional laws relevant to your operations

#### Step 3: Create Compliance Obligations
1. Navigate to **Compliance Obligations**
2. For each applicable law, create specific obligations
3. Example from Labour Act:
   - Obligation: "Monthly Safety Committee Meetings"
   - From: Labour Act Section 120
   - Assign to: HSSE Department
   - Set review cycle: 365 days

#### Step 4: Set Review Dates
1. For each obligation, set **Next Review Date**
2. Typically 1 year from today for annual reviews
3. Calendar will automatically alert you

#### Step 5: Upload Initial Evidence
1. Navigate to **Evidence Management**
2. Upload current compliance evidence
3. Link to specific obligations
4. Organize by year

---

## Module Components

### Dashboard (`/legal`)

**Purpose:** At-a-glance compliance status

**Information Displayed:**
- Overall compliance rate (%)
- Number of overdue obligations
- Obligations due this month
- Pending regulatory changes
- Upcoming deadlines (next 5)
- Recent regulatory updates

**Use Cases:**
- Daily compliance status check
- Management reporting
- Identifying urgent items
- Planning compliance activities

---

### Compliance Obligations (`/legal/register`)

**Purpose:** Central register of all compliance requirements

**How It Works:**

1. **Identify** applicable regulation (from Law Library)
2. **Extract** specific requirements into obligations
3. **Create** obligation with:
   - Title: What needs to be done
   - Regulatory requirement: Legal text
   - Legal obligation: Specific action required
   - Owner: Department responsible
   - Assigned to: Specific people
   - Status: Current compliance level
   - Evaluation: How compliance is measured

**Example:**

```
Law: Fire Precaution Regulations, 2003
↓
Obligation: "Monthly Fire Extinguisher Inspection"
  - Requirement: "Regulation 9: Maintenance of fire-fighting equipment"
  - Legal Obligation: "Inspect all fire extinguishers monthly, maintain logs for 5 years"
  - Owner: Operations Department
  - Assigned to: Facility Manager
  - Status: Compliant
  - Evaluation: "12/12 monthly inspections completed, records up to date"
  - Next Review: January 15, 2026
```

**Card Layout:**
- **Collapsed**: Shows title, status, department, key metadata
- **Expanded**: Full details including requirements, evaluation, actions

**Filtering:**
- By department
- By compliance status
- By search term

---

### Annual Review (`/legal/review`)

**Purpose:** Conduct yearly compliance reviews and archive evidence

**When to Use:**
- When review date approaches (≤30 days)
- At the end of each calendar/fiscal year
- After major regulatory changes
- During annual audit preparation

**3-Step Process:**

**Step 1: Review Compliance**
- Select current compliance status
- Options: Compliant / Partial / Non-Compliant
- Visual card selection interface

**Step 2: Update Status**
- Document compliance evaluation
- Add review notes (findings, actions taken, improvements)
- Set next review date (auto-suggests 1 year out)

**Step 3: Archive Evidence**
- Choose to archive current year's evidence
- Documents tagged with review year (e.g., "2024")
- Historical records preserved
- Ready for new year's evidence

**What Happens:**
- ✅ Obligation status updated
- ✅ Review dates recorded
- ✅ Old evidence archived with year tag
- ✅ Obligation ready for next compliance cycle
- ✅ Historical audit trail maintained

---

### Compliance Calendar (`/legal/calendar`)

**Purpose:** Visual tracking of compliance deadlines

**Two Views:**

**Calendar View:**
- Traditional month grid
- Events shown on specific dates
- Color-coded by urgency
- Click events for details
- Navigate months with arrows

**List View:**
- Chronological event listing
- Sorted by urgency (nearest first)
- Shows department, due date, days remaining
- Status chips for quick identification

**Alert Summary:**
- Red: Expired items (immediate action)
- Red: Critical (≤30 days)
- Yellow: Warning (30-90 days)

**Data Sources:**
- Permit/license expiry dates (from Change Tracker)
- Future: Obligation review dates
- Future: Training certification renewals

---

### Evidence Management (`/legal/evidence`)

**Purpose:** Store proof of compliance for audits

**Supported File Types:**
- PDF documents
- Images (JPG, PNG)
- Word documents
- Excel spreadsheets

**How to Upload:**

1. Click **"Upload Evidence"**
2. Select obligation this evidence supports
3. Choose file (max 10MB)
4. File preview shows before upload
5. Click **"Upload"**
6. Document linked to obligation

**Archive System:**

**Active Evidence:**
- Current year's compliance proof
- Visible by default
- Used for ongoing compliance

**Archived Evidence:**
- Previous years' records
- Tagged with year (2024, 2023, etc.)
- Toggle visibility with "Show Archived" button
- Preserved for historical audits
- Archived during annual reviews

**Use Cases:**
- Storing inspection reports
- Uploading certificates and permits
- Maintaining training records
- Organizing audit documentation

---

### Law Library (`/legal/library`)

**Purpose:** Reference repository for HSSE laws and regulations

**Pre-loaded Laws (Ghana):**

1. **Labour Act, 2003** (Act 651) - Occupational safety & health
2. **EPA Act, 1994** (Act 490) - Environmental regulation
3. **Factories Act, 1970** (Act 328) - Workplace safety
4. **Fire Precaution Regulations, 2003** (L.I. 1724)
5. **Mining Safety Regulations, 2012** (L.I. 2182)
6. **Workmen's Compensation Act, 1987** (Act 187)
7. **Hazardous Waste Act, 2016** (Act 917)
8. **Chemicals Act, 2000** (Act 586)
9. **And more...**

**Information Displayed:**

**Basic Info:**
- Law title and act number
- Country and jurisdiction
- Category (Health & Safety, Environmental, etc.)
- Status (Active/Repealed)
- Effective date

**Detailed Info (when expanded):**
- Full summary
- Enforcement authority and contact
- Key provisions (specific sections)
- Penalties for non-compliance
- Who/what law applies to
- Amendment history
- Link to official government source
- **Impact analysis**: Number of obligations derived from this law

**How to Use:**

1. **Browse** laws by category or country
2. **Search** for specific laws or provisions
3. **Expand** law card to read full details
4. **Note key sections** that apply to your operations
5. **Create obligations** from law requirements
6. **Monitor** for amendments or repeals

**Adding New Laws (HSSE Manager):**

1. Click **"Add"** button
2. Fill in law details:
   - Title and act number
   - Category and jurisdiction
   - Summary and key provisions
   - Enforcement authority
   - Penalties and applicability
3. Link to official source if available
4. Save to library

---

### Regulatory Change Tracker (`/legal/tracker`)

**Purpose:** Monitor permit and license expiry dates

**What to Track:**
- Environmental operating permits
- Fire safety certificates
- Occupational health licenses
- Professional certifications
- Any regulatory authorization with expiry

**Information Managed:**
- Permit/license name
- License number
- Issuing authority
- Issue and expiry dates
- Days until expiry (auto-calculated)
- Status (Valid/Expired)
- Actions taken for renewal
- Evidence (permit PDF)

**Urgency Levels:**

| Status | Days Remaining | Color | Action |
|--------|----------------|-------|--------|
| **EXPIRED** | ≤0 | Red | Immediate renewal required |
| **CRITICAL** | 1-30 | Red | Urgent renewal process |
| **WARNING** | 31-90 | Yellow | Begin renewal preparation |
| **GOOD** | >90 | Green | Monitor, no immediate action |

**Workflow:**

1. **Add tracker** when permit issued
2. **System calculates** days until expiry
3. **Visual alerts** when approaching expiry
4. **Document renewal** actions taken
5. **Upload** renewed permit
6. **Update** expiry date for next cycle

---

## Core Workflows

### Workflow 1: Setting Up Compliance Obligations

**Who:** HSSE Manager  
**When:** Initial setup, or when new regulations apply

**Steps:**

1. **Review Law Library**
   - Identify laws applicable to your operations
   - Example: "Our factory must comply with Factories Act"

2. **Extract Specific Requirements**
   - Read key provisions
   - Example: "Section 14 requires monthly cleanliness inspections"

3. **Create Obligation**
   - Navigate to Compliance Obligations
   - Click "Add New"
   - Fill in details:
     ```
     Title: Monthly Factory Cleanliness Inspection
     Regulatory Requirement: Section 14 of Factories Act requires monthly cleanliness checks
     Legal Obligation: Conduct monthly cleanliness inspections using checklist, maintain records
     Owner: Operations
     Status: Compliant
     Country: Ghana
     Category: Health and Safety
     Evaluation: Inspections completed monthly, 100% compliance
     Assigned to: Facility Manager
     Next Review: [1 year from today]
     ```

4. **Set Review Cycle**
   - Next review date: Typically 1 year
   - Review period: 365 days

5. **Upload Evidence**
   - Navigate to Evidence Management
   - Upload inspection checklists
   - Link to this obligation

---

### Workflow 2: Conducting Annual Compliance Review

**Who:** HSSE Manager  
**When:** When review date approaches or annually

**Full Process:**

**Preparation (Before Review):**
1. Gather all evidence from past year
2. Review compliance activities
3. Assess current compliance status
4. Prepare findings and recommendations

**Review Execution:**
1. Navigate to **Annual Review** (`/legal/review`)
2. System shows obligations requiring review:
   - Overdue (red)
   - Due soon (yellow)
   - Upcoming (blue)

3. Click **"Conduct Review"** on obligation

4. **Step 1: Review Compliance**
   - Select updated status:
     - Compliant: All requirements met
     - Partial: Some requirements met, gaps exist
     - Non-Compliant: Requirements not met
   - Visual card selection

5. **Step 2: Update Status**
   - **Compliance Evaluation**: Document findings
     ```
     Example: "12 monthly inspections completed throughout 2024.
     All inspection checklists on file. No deficiencies noted.
     100% compliance achieved."
     ```
   - **Review Notes**: Additional observations
     ```
     Example: "Implemented digital inspection system in Q3.
     Improved record keeping. Recommend continuing current approach."
     ```
   - **Next Review Date**: Set for next year
     ```
     Example: January 15, 2026 (auto-suggested)
     ```

6. **Step 3: Archive Evidence**
   - Toggle ON: Archive current evidence
   - System will:
     - Tag all current evidence as "2024"
     - Mark as archived
     - Preserve for historical audits
     - Ready for 2025 evidence uploads

7. **Complete Review**
   - All changes saved
   - Evidence archived
   - Next review scheduled
   - Obligation updated

**After Review:**
1. Navigate to Evidence Management
2. Upload fresh evidence for new year
3. Monitor compliance throughout year
4. Prepare for next annual review

---

### Workflow 3: Managing Permit Renewals

**Who:** HSSE Manager, Operations Manager  
**When:** Permits/licenses issued or approaching expiry

**Initial Setup:**

1. Navigate to **Change Tracker** (`/legal/tracker`)
2. Click **"Add Tracker"**
3. Fill in permit details:
   ```
   Permit Name: Environmental Operating Permit
   License Number: EPA/2024/001
   Issuing Authority: Environmental Protection Agency
   Unit: Operations Department
   Date of Issue: January 15, 2024
   Expiry Date: January 15, 2025
   Status: Valid
   Action Taken: Initial application approved
   Evidence: [Upload permit PDF]
   ```

**Ongoing Monitoring:**

- System calculates days until expiry
- Card turns yellow when 90 days out
- Card turns red when 30 days out
- Review "Critical" section in statistics

**Renewal Process:**

1. **90 Days Before Expiry:**
   - Begin gathering renewal documents
   - Review requirements from issuing authority
   - Prepare application

2. **60 Days Before:**
   - Submit renewal application
   - Upload application receipt to tracker
   - Update "Action Taken" field

3. **30 Days Before (if not renewed):**
   - Escalate to management
   - Follow up with authority
   - Document delays

4. **Upon Renewal:**
   - Edit tracker
   - Update expiry date to new date
   - Upload renewed permit PDF
   - Update "Action Taken": "Renewed for 2025"
   - Status automatically recalculates to "GOOD"

---

### Workflow 4: Preparing for Audits

**Who:** HSSE Manager  
**When:** Before external/internal audits

**Pre-Audit Checklist:**

1. **Compliance Dashboard Review**
   - Verify 100% compliance rate (or explain gaps)
   - Ensure no overdue obligations
   - Update any outdated statuses

2. **Evidence Verification**
   - Navigate to Evidence Management
   - Verify all obligations have supporting evidence
   - Check evidence is current (within review cycle)
   - Ensure archived evidence is accessible

3. **Obligation Status Check**
   - Review each obligation in Compliance Obligations
   - Verify evaluations are current
   - Update "Further Actions" if needed
   - Check all assigned personnel are current

4. **Permit & License Verification**
   - Review Change Tracker
   - Ensure no expired permits
   - Have renewal evidence ready
   - Prepare explanation for any warnings

5. **Law Library Reference**
   - Print/export relevant law summaries
   - Have enforcement authority contacts ready
   - Prepare amendment history if laws changed

**During Audit:**

1. **Show Dashboard**: Overall compliance rate
2. **Filter by category**: Show specific area compliance
3. **Open obligation cards**: Demonstrate tracking system
4. **View evidence**: Quick access to proof
5. **Show calendar**: Demonstrate proactive monitoring
6. **Export reports**: Provide compliance documentation

---

## Best Practices

### For HSSE Managers

**1. Obligation Creation**
- ✅ **Be specific**: "Monthly fire extinguisher inspection" not "Fire safety"
- ✅ **One requirement per obligation**: Don't combine multiple requirements
- ✅ **Assign clearly**: One department, specific people
- ✅ **Set realistic cycles**: Most are yearly, some may be quarterly

**2. Evidence Management**
- ✅ **Upload regularly**: Don't wait for annual review
- ✅ **Name files clearly**: "fire_inspection_jan_2025.pdf"
- ✅ **Link correctly**: Ensure evidence matches obligation
- ✅ **Archive yearly**: During annual review process

**3. Review Process**
- ✅ **Schedule reviews**: Don't wait until overdue
- ✅ **Be thorough**: Actually review compliance, don't just click through
- ✅ **Document findings**: Future you will thank you
- ✅ **Archive evidence**: Preserve historical records

**4. Law Library Maintenance**
- ✅ **Update amendments**: When laws change, update library
- ✅ **Add new laws**: As operations expand or regulations change
- ✅ **Link to obligations**: Show impact of each law
- ✅ **Include sources**: Official links for verification

### For Department Heads

**1. Departmental Compliance**
- ✅ Review obligations assigned to your department monthly
- ✅ Upload evidence as activities are completed
- ✅ Report non-compliance immediately to HSSE
- ✅ Coordinate with assigned personnel

**2. Resource Planning**
- ✅ Review upcoming obligations in calendar
- ✅ Allocate resources for compliance activities
- ✅ Budget for permit renewals
- ✅ Plan staff time for compliance tasks

### For All Users

**1. Stay Informed**
- Check Compliance Calendar for relevant deadlines
- Review Law Library for regulations affecting your work
- Understand obligations in your area

**2. Proactive Reporting**
- Report compliance concerns immediately
- Don't wait for annual review to raise issues
- Communicate challenges in meeting obligations

---

## Compliance Monitoring

### Daily Tasks
- Check dashboard for overdue items
- Review critical permits in Change Tracker
- Respond to compliance alerts

### Weekly Tasks
- Update obligation statuses as activities complete
- Upload evidence from weekly compliance activities
- Review upcoming deadlines (next 7 days)

### Monthly Tasks
- Review compliance rate trends
- Update evaluations for monthly obligations
- Verify all monthly evidence uploaded
- Review Change Tracker for 30-90 day items

### Quarterly Tasks
- Conduct mini-review of all obligations
- Verify quarterly permits/licenses
- Update evidence archives
- Report to management

### Annual Tasks
- Conduct formal annual reviews (all obligations)
- Archive previous year's evidence
- Set new review dates
- Update law library for amendments
- Prepare annual compliance report

---

## Troubleshooting

### Common Issues

#### "I can't create a compliance obligation"
**Cause:** Only HSSE Managers can create obligations.  
**Solution:** Contact your HSSE Manager to create the obligation.

#### "The form says 'Failed to create obligation'"
**Cause:** Missing required fields.  
**Solution:** Ensure all required fields are filled:
- Title
- Regulatory Requirement
- Legal Obligation
- Owner Department
- Compliance Status
- Country
- Category
- Compliance Evaluation

#### "Evidence upload fails with 500 error"
**Cause:** Database migration not applied or backend not restarted.  
**Solution:**
```bash
# Apply migrations
python manage.py migrate legals

# Restart Django backend
docker-compose restart backend
```

#### "Laws don't show in Law Library"
**Cause:** Seed migration not run.  
**Solution:** Run migration 0007 to seed Ghana laws:
```bash
python manage.py migrate legals
```

#### "Can't see archived evidence"
**Cause:** Archive toggle is off.  
**Solution:** Click "Show Archived" button in Evidence Management.

#### "Review dates not calculating"
**Cause:** Migration not applied.  
**Solution:** Apply migration 0005 for review cycle fields.

---

## Integration Points

### With Document Management
- Compliance obligations may reference HSSE documents
- Documents may be created to fulfill compliance obligations
- Evidence may include approved HSSE procedures

### With PPE Management
- PPE regulations tracked in Law Library
- PPE compliance obligations created
- Evidence includes PPE inspection records

### With Admin Module
- Categories managed in Admin panel
- Positions managed in Admin panel
- User roles determine compliance access

---

## Appendix A: Sample Compliance Obligations

### Example 1: Safety Committee Meetings
```
Title: Quarterly Safety Committee Meetings
Regulatory Requirement: Labour Act Section 120 requires establishment and regular meetings of safety committees
Legal Obligation: Conduct safety committee meetings quarterly, maintain minutes for 5 years
Owner: HSSE
Assigned to: HSSE Manager, Safety Officer
Status: Compliant
Country: Ghana
Category: Health and Safety
Evaluation: 4/4 quarterly meetings held in 2024, all minutes documented
Further Actions: Schedule Q1 2025 meeting for January 20
Next Review: January 1, 2026
Review Period: 365 days
```

### Example 2: Environmental Permit
```
Title: Environmental Operating Permit Compliance
Regulatory Requirement: EPA Act Section 14 requires valid environmental permit for operations
Legal Obligation: Maintain current environmental operating permit, renew before expiry
Owner: Operations
Assigned to: Operations Manager, Environmental Officer
Status: Compliant
Country: Ghana
Category: Environmental Protection
Evaluation: Permit valid until Dec 2025, renewal process initiated 90 days in advance
Further Actions: Continue monitoring expiry, begin renewal prep in September 2025
Next Review: December 1, 2025
Review Period: 365 days
```

---

## Appendix B: Compliance Metrics

### Key Performance Indicators (KPIs)

1. **Overall Compliance Rate**
   - Target: ≥95%
   - Calculation: (Compliant obligations / Total obligations) × 100

2. **Overdue Reviews**
   - Target: 0
   - Measure: Obligations past review date

3. **Evidence Coverage**
   - Target: 100%
   - Measure: Obligations with uploaded evidence / Total obligations

4. **Permit Compliance**
   - Target: 0 expired permits
   - Measure: Permits in "Valid" status

5. **Response Time**
   - Target: <90 days average
   - Measure: Time from obligation creation to first evidence upload

---

*This guide is part of the SafeSphere HSSE Management System. For additional documentation, see the main SafeSphere documentation portal.*

