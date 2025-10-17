# Audit Email Notifications Guide

## 📧 **Email Notification System**

Your audit module now has comprehensive email notifications to keep all stakeholders informed about audits, findings, and CAPAs.

---

## ✅ **Features Implemented**

### 1. **Audit Plan Notifications** 📋
Send complete audit plan details to recipients

**Includes:**
- Audit code and title
- Schedule (start/end dates)
- Scope description
- ISO 45001 clauses to be audited
- Departments and processes
- Audit team members
- Objectives
- Audit criteria
- Action items for preparation
- Professional HTML email template

### 2. **CAPA Assignment Notifications** ✅
Automatically notify when CAPAs are assigned

**Includes:**
- CAPA code and title
- Priority and type
- Related finding details
- Action plan
- Target completion date
- Direct link to CAPA in system

### 3. **Finding Notifications** 🔍
Alert department heads about new findings

**Includes:**
- Finding code and severity
- Description and root cause
- Department and process affected
- Impact assessment
- Required actions
- Link to finding details

### 4. **Audit Completion Notifications** ✅
Inform stakeholders when audit is complete

**Includes:**
- Findings summary
- Major/Minor NCs count
- Observations count
- Next steps

---

## 🚀 **How to Use**

### Send Audit Plan Notification

#### From Frontend (HSSE Manager):
```
1. Go to: Audit Management → Audit Planner
2. Find the audit you want to send
3. Click the Email icon (✉️) on the audit card
4. Dialog opens:
   - Default recipients: Lead auditor + team members (shown in info)
   - Optional: Select additional recipients from user list
   - Optional: Add custom message (e.g., "Please prepare all HSE documents")
5. Click "Send Notification"
6. Success message appears
7. All recipients receive professional email
```

#### From API:
```bash
POST /api/v1/audits/plans/{uuid}/send-notification/

# Default (send to audit team)
{
}

# With additional recipients
{
  "recipient_user_ids": [1, 2, 3],
  "recipient_emails": ["external@example.com"],
  "additional_message": "Please prepare all HSE documentation"
}
```

### Automatic Notifications

#### CAPA Assignment:
```
When HSSE Manager assigns a CAPA:
✅ Responsible person receives email automatically
✅ Includes all CAPA details
✅ Link to access in system
```

#### Finding Created:
```
When finding is logged:
✅ Department heads notified
✅ HSSE Manager notified
✅ Includes finding details and severity
```

---

## 📧 **Email Template**

### Professional HTML Email
Recipients receive a beautifully formatted email with:

**Header:**
- 🔍 Audit Plan Notification
- ISO 45001:2018 Internal Audit
- Gradient background (matching SafeSphere theme)

**Sections:**
1. **Audit Information**
   - Audit code badge
   - Title
   - Type
   - Status badge

2. **Schedule**
   - Start and end dates
   - Duration in days

3. **Scope**
   - Description
   - Departments
   - Processes
   - Locations

4. **ISO 45001:2018 Clauses**
   - List of all clauses being audited
   - With titles

5. **Audit Team**
   - Lead auditor
   - Team members with positions

6. **Objectives**
   - Bulleted list of objectives

7. **Action Required**
   - Prepare policies and procedures
   - Make personnel available
   - Provide access to facilities
   - Gather evidence

8. **Footer**
   - Contact information
   - SafeSphere branding

---

## 🎨 **Email Preview Example**

```html
Subject: Audit Notification: AUD-2025-0001 - Q1 2025 Internal Audit

────────────────────────────────────────
🔍 Audit Plan Notification
ISO 45001:2018 Internal Audit
────────────────────────────────────────

Audit Information
  Audit Code: AUD-2025-0001
  Title: Q1 2025 Internal Audit
  Type: Internal Audit
  Status: SCHEDULED

📅 Schedule
  Start Date: 2025-01-15
  End Date: 2025-01-20
  Duration: 6 days

📋 Scope
  Complete HSSE management system audit covering
  all operational departments and critical processes

📖 ISO 45001:2018 Clauses
  • 4.1 - Understanding the organization
  • 6.1 - Actions to address risks
  • 8.1 - Operational planning and control
  • 9.2 - Internal audit
  • 10.2 - Incident and corrective action

👥 Audit Team
  Lead Auditor: John Doe (HSSE Manager)
  Team Members:
    • Jane Smith (HSSE Manager)
    • Mike Johnson (OPS Manager)

🎯 Objectives
  • Verify compliance with ISO 45001:2018
  • Identify improvement opportunities
  • Assess effectiveness of controls

📝 Action Required
Please prepare:
  ✓ Relevant policies and procedures
  ✓ Records demonstrating compliance
  ✓ Personnel availability for interviews
  ✓ Access to work areas
  ✓ Evidence of implementation

────────────────────────────────────────
SafeSphere Audit Management System
Contact: John Doe (hsse@safesphere.com)
────────────────────────────────────────
```

---

## 🔐 **Security & Permissions**

| Action | HSSE Manager | Other Users |
|--------|-------------|-------------|
| Send audit plan notification | ✅ | ❌ |
| Send CAPA notification | ✅ | ❌ |
| Send finding notification | ✅ | ❌ |
| Receive notifications | ✅ | ✅ |

---

## ⚙️ **Configuration**

### Email Settings (Django)
Ensure these are configured in `backend/core/settings.py`:

```python
# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # or your SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@example.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'SafeSphere <noreply@safesphere.com>'

# Frontend URL (for links in emails)
FRONTEND_URL = 'http://localhost:5173'  # Update for production
```

### For Testing (Console Backend)
If you don't have SMTP configured yet, use console backend:

```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

Emails will print to console for testing.

---

## 📊 **Notification Types**

### 1. Audit Plan Notification
**Trigger**: Manual (HSSE clicks "Send Notification")  
**Recipients**: Audit team + optional additional users  
**Purpose**: Inform about upcoming audit and required preparation

### 2. CAPA Assignment
**Trigger**: Automatic when CAPA created  
**Recipients**: Responsible person  
**Purpose**: Notify of assigned corrective action

### 3. Finding Notification
**Trigger**: Automatic when finding created  
**Recipients**: Department heads + HSSE Manager  
**Purpose**: Alert about identified non-conformity

### 4. CAPA Overdue Reminder
**Trigger**: Can be automated with Celery (scheduled task)  
**Recipients**: Responsible person + HSSE Manager  
**Purpose**: Remind about overdue CAPAs

### 5. Audit Completion
**Trigger**: When audit status changes to COMPLETED  
**Recipients**: All stakeholders  
**Purpose**: Inform about audit completion and results

---

## 🎯 **Best Practices**

### When to Send Audit Plan Notifications:

1. **Initial Planning** (2-3 weeks before)
   - Send to audit team for preparation
   - Include detailed objectives

2. **Week Before Audit**
   - Send reminder to all stakeholders
   - Include specific requirements

3. **Day Before Audit**
   - Final reminder
   - Confirm personnel availability

### What to Include in Additional Message:

✅ **Good Examples:**
```
"Please ensure all PPE records are up to date and available for review."

"We will be conducting interviews with floor supervisors. 
Please ensure their availability on Jan 15, 2025."

"This audit focuses on emergency preparedness. 
Please have evacuation procedures and drill records ready."
```

❌ **Avoid:**
```
"Audit tomorrow"  // Too vague
"Be ready"  // Not specific enough
```

---

## 📧 **Email Content Customization**

### Current Features:
- ✅ Professional HTML template
- ✅ SafeSphere branding
- ✅ Gradient header
- ✅ Organized sections
- ✅ Mobile-responsive
- ✅ Clear action items

### Future Enhancements:
- 📎 Attach PDF of audit plan
- 📅 iCal calendar invite
- 🔗 Click-to-confirm attendance
- 📊 Pre-audit checklist
- 🎨 Custom email templates per audit type

---

## 🧪 **Testing Email Notifications**

### Option 1: Console Backend (Development)
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

**Result**: Emails print to Docker logs
```bash
docker compose logs web | grep -A 50 "Audit Plan Notification"
```

### Option 2: Mailtrap (Testing)
```python
EMAIL_HOST = 'smtp.mailtrap.io'
EMAIL_PORT = 2525
EMAIL_HOST_USER = 'your-mailtrap-username'
EMAIL_HOST_PASSWORD = 'your-mailtrap-password'
```

**Result**: View emails in Mailtrap inbox

### Option 3: Real SMTP (Production)
Use Gmail, SendGrid, AWS SES, etc.

---

## 📝 **API Reference**

### Send Audit Plan Notification
```http
POST /api/v1/audits/plans/{uuid}/send-notification/
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipient_user_ids": [1, 2, 3],  // optional
  "recipient_emails": ["external@example.com"],  // optional
  "additional_message": "Custom message here"  // optional
}

Response 200:
{
  "message": "Audit plan notification sent to 5 recipient(s)",
  "recipients_count": 5
}
```

### Send CAPA Notification
```http
POST /api/v1/audits/capas/{uuid}/send-notification/
Authorization: Bearer {token}

Response 200:
{
  "message": "CAPA notification sent to John Doe"
}
```

### Send Finding Notification
```http
POST /api/v1/audits/findings/{uuid}/send-notification/
Authorization: Bearer {token}

Response 200:
{
  "message": "Finding notification sent successfully"
}
```

---

## 🎯 **Usage Examples**

### Example 1: Notify Audit Team
```
Scenario: You've created AUD-2025-001 for Operations department
Action: Click Email icon on audit card
Recipients: Auto (audit team)
Message: Leave blank
Result: 3 emails sent (lead + 2 team members)
```

### Example 2: Notify External Auditors
```
Scenario: External certification audit
Action: Click Email icon
Recipients: Add external auditors manually
Message: "Please bring your auditor credentials and equipment"
Result: Audit team + external auditors notified
```

### Example 3: Department-Specific Audit
```
Scenario: Operations department audit
Action: Click Email icon
Recipients: Select all Operations staff
Message: "Operations equipment maintenance audit - please have all records ready"
Result: All Operations staff notified
```

---

## 🆘 **Troubleshooting**

### "Email not sent" Error
**Check:**
1. Email settings configured in `settings.py`
2. SMTP credentials correct
3. Recipients have valid email addresses
4. Not blocked by firewall

### "No recipients found" Error
**Solution:**
- Audit must have lead auditor OR team members
- Or manually select recipients

### Emails in Spam
**Solution:**
- Configure SPF/DKIM records
- Use authenticated SMTP
- Add sender to safe senders

### Email Not Formatted
**Solution:**
- Ensure HTML email support
- Check email client settings
- View in modern email client

---

## 🎉 **You're Ready!**

Email notifications are fully integrated:
- ✅ Professional HTML templates
- ✅ Easy-to-use UI
- ✅ Multiple recipient options
- ✅ Custom messages supported
- ✅ Automatic notifications available

**Try it now:**
```
1. Create an audit plan
2. Click the ✉️ Email icon
3. Add optional message
4. Send notification
5. Check your email!
```

**Happy auditing!** 🛡️📧✨

