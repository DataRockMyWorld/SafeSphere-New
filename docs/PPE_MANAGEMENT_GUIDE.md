# SafeSphere PPE Management Module

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

The **PPE Management Module** provides comprehensive Personal Protective Equipment lifecycle management including inventory control, procurement, issuance tracking, and maintenance scheduling.

### Purpose

- **Track PPE inventory** across all locations and categories
- **Manage procurement** from approved vendors
- **Control issuance** to personnel with accountability
- **Monitor stock levels** with automated alerts
- **Process requests** for PPE from staff
- **Track returns and damages** for lifecycle management
- **Generate reports** for compliance and budgeting

### Who Should Use This Module

- **HSSE Managers**: Full PPE lifecycle management
- **Warehouse Staff**: Inventory and issuance operations
- **Department Heads**: Monitoring departmental PPE usage
- **All Staff**: Requesting and returning PPE

---

## Key Features

### 1. PPE Dashboard
**Real-time PPE overview**

- **Total inventory value** in stock
- **Stock levels** by category
- **Low stock alerts** (items below reorder point)
- **Out of stock items** requiring immediate attention
- **Recent issuances** to personnel
- **Pending requests** awaiting fulfillment
- **Monthly usage trends** and analytics

### 2. PPE Register
**Master catalog of all PPE categories**

- **Complete PPE listing**: Hard hats, safety boots, gloves, goggles, etc.
- **Specifications**: Size, type, standards compliance
- **Reorder points**: Minimum stock levels
- **Unit costs**: For budgeting
- **Vendor information**: Preferred suppliers
- **Category management**: Organize by type

### 3. Inventory Management
**Stock control and tracking**

**Protected Feature** - HSSE Manager & Superuser only

- **Real-time stock levels** across all PPE
- **Add stock** from purchases
- **Adjust quantities** for damaged/lost items
- **Batch tracking** for quality control
- **Cost tracking** per item
- **Stock movements** audit trail
- **Low stock alerts** automation
- **Vendor performance** tracking

### 4. Stock Position
**Visual stock status monitoring**

**Access:**
- HSSE Manager & Superuser: Read/Write
- Other Users: Read-only

- **Color-coded status**:
  - 🟢 Green: Stock OK (above reorder point)
  - 🟡 Yellow: Low stock (at reorder point)
  - 🔴 Red: Out of stock (zero quantity)
- **Stock level indicators** with visual bars
- **Reorder recommendations**
- **Quick actions** to purchase or adjust

### 5. Purchases
**Procurement management**

**Protected Feature** - HSSE Manager & Superuser only

- **Purchase order creation**
- **Vendor selection** from approved list
- **Cost tracking** and budget monitoring
- **Receipt management** with document upload
- **Delivery tracking**: Expected vs actual dates
- **Automatic inventory update** upon receipt
- **Purchase history** and analytics
- **Vendor performance** metrics

### 6. Vendors
**Supplier relationship management**

**Protected Feature** - HSSE Manager & Superuser only

- **Vendor database**: Contact details, products
- **Rating system**: Performance tracking
- **Product catalog** by vendor
- **Payment terms** management
- **Active/inactive** vendor status
- **Purchase history** per vendor

### 7. PPE Requests
**Staff request system**

**Access:** All users (own requests)

- **Submit PPE requests** for needed equipment
- **Select PPE category** and quantity
- **Provide justification** for request
- **Track request status**:
  - Pending: Awaiting review
  - Approved: Being prepared
  - Fulfilled: PPE issued
  - Rejected: Request denied
- **View request history**

### 8. Issuance
**PPE distribution tracking**

**Access:**
- HSSE Manager & Superuser: View all issuances
- Other Users: View only their own

- **Issue PPE** to personnel
- **Record recipient** information
- **Track issuance date** and quantity
- **Return due dates** for reusable PPE
- **Condition tracking**: New, Good, Fair, Poor
- **Accountability**: Who has what PPE
- **Bulk issuance** for teams

### 9. Returns
**PPE return processing**

**Access:** All users (own returns)

- **Submit return requests** for used PPE
- **Specify condition**: Good, Fair, Poor, Damaged
- **Provide notes** on usage
- **Return approval** by HSSE Manager
- **Inventory update** upon processing
- **Disposal tracking** for damaged items

### 10. Damage Reports
**Incident and damage tracking**

**Access:** All users

- **Report damaged** or defective PPE
- **Document damage details**: How, when, extent
- **Photo upload** capability
- **Investigation tracking**
- **Replacement processing**
- **Trend analysis** for quality issues

### 11. Settings
**Module configuration**

**Protected Feature** - HSSE Manager & Superuser only

- **Low stock thresholds** configuration
- **Auto-reorder** settings
- **Alert preferences**
- **Issuance policies**
- **Return policies**
- **Cost centers** setup

---

## User Roles & Permissions

### Permission Matrix

| Feature | HSSE Manager | Superuser | Department Heads | General Staff |
|---------|--------------|-----------|------------------|---------------|
| **PPE Register** | ✅ Full | ✅ Full | ✅ Read-only | ✅ Read-only |
| **Inventory Management** | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| **Stock Position** | ✅ Full | ✅ Full | ✅ Read-only | ✅ Read-only |
| **Purchases** | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| **Vendors** | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |
| **Requests** | ✅ All | ✅ All | ✅ Own | ✅ Own |
| **Issuance** | ✅ All | ✅ All | ✅ Own | ✅ Own |
| **Returns** | ✅ All | ✅ All | ✅ Own | ✅ Own |
| **Damage Reports** | ✅ All | ✅ All | ✅ Own | ✅ Own |
| **Settings** | ✅ Full | ✅ Full | ❌ Hidden | ❌ Hidden |

### Role Definitions

#### HSSE Manager & Superuser
**Full Administrative Access**

**Responsibilities:**
- Overall PPE program management
- Inventory control and procurement
- Budget management
- Vendor relationships
- Compliance reporting
- Policy setting

**Can:**
- Manage inventory levels
- Create purchase orders
- Add/edit vendors
- Approve/reject requests
- Issue PPE to anyone
- Process all returns
- Configure system settings
- View all data

#### Department Heads
**Monitoring & Requesting**

**Responsibilities:**
- Monitor departmental PPE usage
- Ensure staff have required PPE
- Submit bulk requests for teams
- Report stock issues

**Can:**
- View stock levels (read-only)
- Submit PPE requests for their team
- View issuances to their staff
- Submit damage reports

**Cannot:**
- Modify inventory
- Create purchases
- Access vendor management
- Change settings

#### General Staff
**Request & Return**

**Responsibilities:**
- Requesting PPE when needed
- Proper PPE usage and care
- Reporting damage or defects
- Returning reusable PPE

**Can:**
- View stock availability
- Submit personal PPE requests
- View their own issuances
- Return their PPE
- Report damage to their PPE

**Cannot:**
- View other users' PPE
- Modify inventory
- Access procurement features
- Approve requests

---

## Getting Started

### For HSSE Managers: Initial Setup

#### Step 1: Set Up PPE Categories

1. Navigate to **PPE Register**
2. Add all PPE categories your organization uses:
   ```
   Examples:
   - Hard Hats (Head Protection)
   - Safety Boots (Foot Protection)
   - Safety Goggles (Eye Protection)
   - Ear Plugs (Hearing Protection)
   - Safety Gloves (Hand Protection)
   - High-Visibility Vest (Body Protection)
   - Respirators (Respiratory Protection)
   ```

3. For each category, specify:
   - Reorder point (minimum stock level)
   - Unit of measurement
   - Typical cost per unit
   - Preferred vendor

#### Step 2: Add Approved Vendors

1. Navigate to **Vendors**
2. Add your PPE suppliers:
   ```
   Vendor Information:
   - Name: ABC Safety Supplies Ltd
   - Contact Person: John Doe
   - Email: sales@abcsafety.gh
   - Phone: +233 XX XXX XXXX
   - Address: Accra, Ghana
   - Products: Hard hats, boots, gloves
   - Payment Terms: Net 30
   - Rating: 5 stars
   ```

#### Step 3: Initial Stock Upload

1. Navigate to **Inventory Management**
2. For each PPE category, add current stock:
   ```
   Example:
   - Category: Hard Hats
   - Quantity: 150
   - Vendor: ABC Safety Supplies
   - Cost per unit: GHS 45.00
   - Batch number: BATCH-2024-001
   - Notes: Initial stock count - warehouse A
   ```

#### Step 4: Configure Settings

1. Navigate to **Settings**
2. Set organizational policies:
   - Low stock alert threshold (e.g., 20% of reorder point)
   - Auto-reorder enabled/disabled
   - Approval required for requests (Yes/No)
   - Maximum issuance per person per category

---

### For Staff: Requesting PPE

#### How to Request PPE

1. Navigate to **PPE Management** → **Requests**
2. Click **"New Request"**
3. Fill in request form:
   ```
   PPE Category: [Select from dropdown]
   Quantity: [Number needed]
   Justification: "Replacement for worn-out safety boots"
   Priority: Normal / Urgent
   ```
4. Submit request
5. Track status in Requests page
6. Receive notification when approved
7. Collect PPE from warehouse/HSSE office

#### Request Statuses

- **Pending**: Awaiting HSSE Manager review
- **Approved**: Request approved, being prepared
- **Fulfilled**: PPE has been issued to you
- **Rejected**: Request denied (with reason provided)

---

## Core Workflows

### Workflow 1: Procurement Cycle

**Who:** HSSE Manager  
**When:** When stock is low or out

**Full Process:**

**1. Identify Need**
- Check Stock Position
- Note items with low stock (yellow) or out of stock (red)
- Review pending requests requiring stock

**2. Create Purchase Order**
- Navigate to Purchases
- Click "Create Purchase"
- Fill in details:
  ```
  PPE Category: Safety Boots
  Vendor: ABC Safety Supplies
  Quantity: 100 pairs
  Cost per Unit: GHS 85.00
  Total Cost: GHS 8,500 (auto-calculated)
  Purchase Date: [Today]
  Expected Delivery: [Date]
  Payment Terms: Net 30
  Notes: Quarterly procurement - sizes 40-45
  ```

**3. Track Delivery**
- Monitor expected vs actual delivery date
- Update when received
- Upload receipt document

**4. Receive Stock**
- Verify quantity and quality
- Update actual delivery date
- System automatically adds to inventory
- Stock Position updates

**5. Update Vendor Rating**
- Rate delivery timeliness
- Note product quality
- Update for future procurement decisions

---

### Workflow 2: Issuing PPE to Staff

**Who:** HSSE Manager, Warehouse Staff  
**When:** Fulfilling requests or new hire onboarding

**Process:**

**1. Verify Stock Availability**
- Check Stock Position
- Ensure sufficient quantity

**2. Navigate to Issuance**
- Click "Issue PPE"

**3. Fill Issuance Form**
```
Issued To: [Select employee]
PPE Category: Hard Hat
Quantity: 1
Condition: New
Issue Date: [Today]
Return Due: [6 months] (for reusable PPE)
Notes: New employee onboarding
```

**4. Record Issuance**
- System deducts from inventory
- Creates issuance record
- Employee notified (if enabled)

**5. Provide PPE**
- Give PPE to employee
- Ensure proper fit
- Provide usage instructions
- Document receipt (signature if required)

---

### Workflow 3: Processing PPE Returns

**Who:** HSSE Manager (approval), Staff (submission)

**Staff Side:**

1. Navigate to **Returns**
2. Click **"Submit Return"**
3. Fill in return form:
   ```
   PPE Category: Safety Goggles
   Quantity: 1
   Condition: Good / Fair / Poor / Damaged
   Reason: Upgrade to prescription safety glasses
   Notes: Goggles in good condition, cleaned
   ```
4. Submit return request
5. Wait for approval
6. Return PPE to warehouse when approved

**HSSE Manager Side:**

1. Navigate to **Returns**
2. Review pending returns
3. Assess condition accuracy
4. **Approve** or **Reject** return
5. If approved:
   - Good condition: Return to stock
   - Fair condition: Return to stock (note in system)
   - Poor/Damaged: Remove from circulation, update inventory
6. Update inventory accordingly

---

### Workflow 4: Managing Stock Adjustments

**Who:** HSSE Manager  
**When:** Damaged, lost, found, or transferred items

**Scenarios:**

**Scenario 1: Damaged Items**
```
1. Navigate to Inventory Management
2. Find affected PPE category
3. Click "Adjust Stock"
4. Select: Decrease
5. Quantity: Number damaged
6. Reason: "Water damage in warehouse flood"
7. Submit adjustment
8. System updates inventory and creates audit entry
```

**Scenario 2: Found Items**
```
1. Navigate to Inventory Management
2. Find PPE category
3. Click "Adjust Stock"
4. Select: Increase
5. Quantity: Number found
6. Reason: "Located missing box during warehouse reorganization"
7. Submit adjustment
```

**Scenario 3: Inter-Site Transfer**
```
1. Decrease at Site A
2. Increase at Site B
3. Document transfer in notes
4. Both adjustments linked for audit trail
```

---

### Workflow 5: Handling Damage Reports

**Who:** Any user  
**When:** PPE is damaged or defective

**Reporting Process:**

1. Navigate to **Damage Reports**
2. Click **"Report Damage"**
3. Fill in damage report:
   ```
   PPE Category: Safety Harness
   Quantity Affected: 1
   Damage Type: Frayed webbing
   Severity: Critical (unsafe to use)
   How it occurred: Normal wear after 2 years use
   Location: Construction Site B
   Photos: [Upload images]
   Immediate action taken: Removed from service, tagged out
   ```
4. Submit report

**HSSE Manager Investigation:**

1. Reviews damage report
2. Investigates cause:
   - Normal wear and tear?
   - Manufacturing defect?
   - Misuse or abuse?
   - Inadequate maintenance?
3. Takes action:
   - Issue replacement
   - Contact vendor if defective
   - Update maintenance procedures
   - Provide additional training if misuse
4. Updates inventory (removes damaged items)
5. Closes report with findings

---

## Module Components

### PPE Dashboard (`/ppe`)

**Purpose:** Command center for PPE management

**Widgets:**

1. **Inventory Summary**
   - Total items in stock
   - Total inventory value
   - Number of PPE categories

2. **Stock Alerts**
   - Low stock items count
   - Out of stock items count
   - Items approaching reorder point

3. **Activity Metrics**
   - Issuances this month
   - Returns this month
   - Pending requests
   - Damage reports open

4. **Quick Actions**
   - Issue PPE
   - Create purchase
   - Process request
   - View stock position

---

### PPE Register (`/ppe/register`)

**Purpose:** Master catalog and category management

**Information per Category:**

- PPE Name and Description
- Size/Type variations
- Unit of measurement
- Current stock quantity
- Reorder point
- Unit cost
- Total value
- Preferred vendor
- Last purchase date
- Safety standard compliance (e.g., EN 166 for goggles)

**Management Actions (HSSE Manager):**
- Add new PPE categories
- Edit specifications
- Update costs
- Set reorder points
- Assign vendors

---

### Inventory Management (`/ppe/inventory`)

**Purpose:** Real-time stock control

**Protected Feature** - HSSE Manager only

**Functions:**

**Add Stock:**
- From purchase receipts
- From transfers
- From found items

**Adjust Stock:**
- Increase for corrections/found items
- Decrease for damaged/lost/transferred

**Track Stock Movements:**
- All additions logged
- All reductions logged
- Audit trail maintained
- Batch tracking

**Alerts:**
- Automatic low stock detection
- Out of stock warnings
- Expiry alerts (for items with shelf life)

**Reports:**
- Stock valuation
- Movement history
- Variance reports
- Turnover analysis

---

### Purchases (`/ppe/purchases`)

**Purpose:** Procurement and vendor management

**Protected Feature** - HSSE Manager only

**Purchase Creation:**

Required Information:
- PPE category
- Vendor
- Quantity ordered
- Cost per unit (total auto-calculated)
- Purchase date
- Expected delivery date
- Payment terms
- Purchase order number (optional)
- Notes

**Purchase Tracking:**
- Status: Ordered → In Transit → Received
- Delivery dates (expected vs actual)
- Receipt document upload
- Payment tracking
- Vendor performance

**Upon Receipt:**
- Mark as received
- Enter actual delivery date
- System adds to inventory
- Stock Position updates
- Low stock alerts clear

---

### Requests (`/ppe/requests`)

**Purpose:** Staff PPE request system

**For Staff:**

**Submitting Requests:**
1. Click "New Request"
2. Select PPE needed
3. Specify quantity
4. Provide justification
5. Set priority (Normal/Urgent)
6. Submit

**Tracking Requests:**
- View all your requests
- Check current status
- See approval/rejection reasons
- Receive notifications

**For HSSE Managers:**

**Processing Requests:**
1. Review incoming requests
2. Check stock availability
3. Assess justification
4. **Approve** or **Reject**
5. If approved:
   - Create issuance
   - Deduct from inventory
   - Mark request as fulfilled
   - Notify requester

**Batch Processing:**
- Approve multiple similar requests
- Bulk issuance for departments
- Coordinated with procurement

---

### Issuance (`/ppe/issuance`)

**Purpose:** Track who has what PPE

**Creating Issuance:**

```
Issued To: John Doe (Employee ID: EMP-001)
PPE Category: Hard Hat
Quantity: 1
Condition: New
Issue Date: October 15, 2025
Return Due: April 15, 2026 (6 months)
Location: Construction Site A
Notes: Yellow hard hat, size M, serial #HH-2024-150
```

**Tracking:**
- Current issuances (not returned)
- Historical issuances
- Items overdue for return
- Issuances by employee
- Issuances by department
- Issuances by PPE category

**Accountability:**
- Who has which PPE
- When it was issued
- Condition at issuance
- Expected return date
- Return actual vs expected

---

## Best Practices

### For HSSE Managers

**Inventory Management:**

1. **Set Appropriate Reorder Points**
   - Calculate based on:
     - Average monthly usage
     - Lead time from vendors
     - Safety stock (buffer)
   - Formula: `Reorder Point = (Average Monthly Usage × Lead Time) + Safety Stock`
   - Example: `(20 boots/month × 1 month lead time) + 10 safety = 30 boots`

2. **Regular Stock Audits**
   - Physical count vs system count: Monthly
   - Reconcile discrepancies immediately
   - Investigate variances >5%
   - Update system to match reality

3. **Vendor Management**
   - Maintain 2-3 approved vendors per PPE category
   - Rate vendors after each delivery
   - Review vendor performance quarterly
   - Negotiate better terms with high-volume suppliers

4. **Cost Control**
   - Track spending trends
   - Identify cost reduction opportunities
   - Bulk purchase discounts
   - Compare vendor pricing

**Issuance Management:**

1. **Proper Documentation**
   - Record condition at issuance
   - Note serial numbers for trackable items
   - Set realistic return dates
   - Include usage location

2. **Return Enforcement**
   - Send reminders for overdue returns
   - Follow up on non-returns
   - Assess returned item condition accurately
   - Process returns promptly

3. **Quality Control**
   - Inspect returned PPE before restocking
   - Remove damaged items from circulation
   - Track damage patterns by category
   - Work with vendors on quality issues

### For Department Heads

**Planning:**
- Forecast PPE needs based on activities
- Submit bulk requests in advance
- Don't wait until stock out

**Accountability:**
- Track PPE issued to your team
- Ensure proper usage
- Enforce return policies
- Report damage promptly

**Communication:**
- Inform HSSE of upcoming projects requiring PPE
- Report stock shortages affecting work
- Feedback on PPE quality or fit

### For All Staff

**Request Responsibly:**
- Only request what you actually need
- Provide honest justification
- Return unused PPE

**Care for PPE:**
- Use PPE only for intended purpose
- Store properly when not in use
- Clean and maintain as instructed
- Inspect before each use

**Report Issues:**
- Damage or defects immediately
- Don't use defective PPE
- Lost or stolen PPE promptly
- Fit or comfort problems

---

## PPE Lifecycle Management

### New PPE
```
1. PROCUREMENT
   → Vendor selected
   → Purchase order created
   → Delivery expected
   
2. RECEIPT
   → Quality inspection
   → Inventory added
   → Stock position updated
   
3. STORAGE
   → Warehouse location assigned
   → Condition: New
   → Available for issuance
   
4. ISSUANCE
   → Assigned to employee
   → Condition documented
   → Return date set
   
5. IN USE
   → Employee responsible
   → Regular inspection
   → Proper maintenance
   
6. RETURN (Reusable PPE)
   → Condition assessed
   → Good: Back to stock
   → Fair: Back to stock (marked)
   → Poor/Damaged: Disposed
   
7. DISPOSAL
   → Removed from inventory
   → Disposal documented
   → Replacement procured if needed
```

### Disposable PPE
```
1-3: Same as above (Procurement → Receipt → Storage)
4. ISSUANCE
   → Assigned to employee
   → No return expected
5. USAGE
   → Single use or limited lifespan
   → Disposed after use
   → Inventory updated automatically
```

---

## Stock Management Strategies

### ABC Analysis

Classify PPE by importance and value:

**Category A (Critical, High Value)**
- Examples: Respirators, Fall Protection, Gas Detectors
- Tight inventory control
- High reorder points
- Multiple vendors
- Monthly reviews

**Category B (Important, Medium Value)**
- Examples: Safety Boots, Hard Hats, Gloves
- Regular inventory control
- Standard reorder points
- 2-3 vendors
- Quarterly reviews

**Category C (Routine, Low Value)**
- Examples: Ear Plugs, Dust Masks, Safety Glasses
- Simple inventory control
- Basic reorder points
- Single vendor acceptable
- Annual reviews

### Reorder Strategies

**Continuous Review:**
- Monitor stock daily
- Reorder when hits reorder point
- Best for high-value or critical PPE

**Periodic Review:**
- Check stock weekly/monthly
- Order based on projected needs
- Best for routine, low-cost PPE

**Just-in-Time (JIT):**
- Order only when needed
- Minimal stock holding
- Requires reliable vendors
- Only for non-critical PPE

---

## Reporting & Analytics

### Standard Reports (Available in Module)

1. **Inventory Valuation Report**
   - Total stock value
   - Value by category
   - Slow-moving items
   - Stock aging

2. **Usage Report**
   - Issuances per period
   - By department
   - By PPE category
   - Trend analysis

3. **Purchase Report**
   - Spending by category
   - Spending by vendor
   - Cost per unit trends
   - Budget variance

4. **Compliance Report**
   - Stock levels vs targets
   - Out of stock incidents
   - Request fulfillment rate
   - Average response time

---

## Troubleshooting

### Common Issues

#### "I don't see Inventory Management in the menu"
**Cause:** You're not an HSSE Manager or Superuser.  
**Solution:** This is a protected feature. Contact your HSSE Manager if you need access.

#### "Cannot issue PPE - insufficient stock"
**Cause:** Stock level is zero or below requested quantity.  
**Solution:**
1. Check Stock Position
2. Create purchase to replenish
3. Or reduce issuance quantity

#### "My request was rejected"
**Cause:** Various reasons (stock unavailable, unjustified need, etc.).  
**Solution:**
- Read rejection reason provided
- Address concerns
- Resubmit if issue resolved

#### "Stock Position shows wrong quantity"
**Cause:** Inventory discrepancy.  
**Solution:** HSSE Manager needs to:
1. Conduct physical count
2. Compare to system
3. Use "Adjust Stock" to correct
4. Document reason for adjustment

#### "Can't upload purchase receipt"
**Cause:** File size or type issue.  
**Solution:**
- Maximum file size: 10MB
- Supported formats: PDF, JPG, PNG
- Compress large files
- Convert to supported format

---

## Integration Points

### With Legal Compliance
- PPE-related laws tracked in Law Library
- Compliance obligations for PPE programs
- Evidence includes PPE inspection records

### With Document Management
- PPE policies and procedures stored
- Issuance forms and checklists
- Inspection procedures

### With Admin Module
- User role management
- Department structure
- Vendor approvals (if required)

---

## Appendix A: PPE Categories

### Recommended Categories

**Head Protection:**
- Hard hats (construction, industrial)
- Bump caps (warehouse)
- Welding helmets

**Eye & Face Protection:**
- Safety goggles (chemical, dust)
- Safety glasses (impact)
- Face shields
- Welding shields

**Hearing Protection:**
- Ear plugs (disposable)
- Ear muffs (reusable)
- Banded ear plugs

**Respiratory Protection:**
- Dust masks (disposable)
- Half-face respirators
- Full-face respirators
- SCBA (for emergencies)

**Hand Protection:**
- Leather gloves (general)
- Chemical-resistant gloves
- Cut-resistant gloves
- Electrical insulating gloves

**Foot Protection:**
- Safety boots (steel toe)
- Safety shoes
- Gumboots (chemical)
- Electrical hazard boots

**Body Protection:**
- Coveralls
- High-visibility vests
- Chemical suits
- Welding aprons
- Flame-resistant clothing

**Fall Protection:**
- Safety harnesses
- Lanyards
- Lifelines
- Anchor points

---

## Appendix B: Reorder Point Calculations

### Example Calculations

**Safety Boots:**
```
Average Monthly Usage: 15 pairs
Vendor Lead Time: 30 days (1 month)
Safety Stock: 10 pairs (buffer)

Reorder Point = (15 pairs/month × 1 month) + 10 pairs
Reorder Point = 25 pairs

Action: When stock reaches 25 pairs, create purchase order
```

**Disposable Gloves:**
```
Average Monthly Usage: 200 pairs
Vendor Lead Time: 14 days (0.5 months)
Safety Stock: 50 pairs

Reorder Point = (200 pairs/month × 0.5 months) + 50 pairs
Reorder Point = 150 pairs
```

---

## Appendix C: PPE Inspection Schedule

| PPE Type | Inspection Frequency | Inspector | Documentation |
|----------|---------------------|-----------|---------------|
| **Fall Protection** | Before each use + Monthly | User + HSSE | Inspection log |
| **Respirators** | Before each use + Quarterly | User + HSSE | Fit test records |
| **Hard Hats** | Monthly | HSSE / Supervisor | Visual inspection log |
| **Safety Boots** | Daily (user) | User | Self-inspection |
| **Fire-resistant Clothing** | Weekly | HSSE | Condition assessment |
| **Electrical PPE** | Quarterly + Annual | HSSE + Certified | Test certificates |

---

*This guide is part of the SafeSphere HSSE Management System. For additional documentation, see the main SafeSphere documentation portal.*

