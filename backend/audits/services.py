"""
Email services for Audit Management System.
"""
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from audits.models import AuditPlan, AuditFinding, CAPA
from django.contrib.auth import get_user_model
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


def send_audit_plan_notification(audit_plan, recipients=None, additional_message=''):
    """
    Send audit plan notification email to recipients.
    
    Args:
        audit_plan: AuditPlan instance
        recipients: List of email addresses or User objects (optional)
        additional_message: Custom message to include (optional)
    
    Returns:
        Number of emails sent successfully
    """
    try:
        # Determine recipients
        recipient_emails = []
        
        if recipients:
            # If specific recipients provided
            for recipient in recipients:
                if isinstance(recipient, str):
                    recipient_emails.append(recipient)
                elif isinstance(recipient, User):
                    recipient_emails.append(recipient.email)
        else:
            # Default: Send to audit team and lead auditor
            if audit_plan.lead_auditor:
                recipient_emails.append(audit_plan.lead_auditor.email)
            
            for team_member in audit_plan.audit_team.all():
                if team_member.email not in recipient_emails:
                    recipient_emails.append(team_member.email)
        
        if not recipient_emails:
            logger.warning(f"No recipients for audit plan {audit_plan.audit_code}")
            return 0
        
        # Prepare email content
        subject = f"Audit Notification: {audit_plan.audit_code} - {audit_plan.title}"
        
        # Get ISO clause numbers
        iso_clause_numbers = ', '.join([
            clause.clause_number for clause in audit_plan.iso_clauses.all()
        ])
        
        # Plain text message
        message = f"""
Audit Plan Notification

Audit Code: {audit_plan.audit_code}
Title: {audit_plan.title}
Type: {audit_plan.get_audit_type_display()}
Status: {audit_plan.get_status_display()}

Schedule:
Start Date: {audit_plan.planned_start_date}
End Date: {audit_plan.planned_end_date}

Scope:
{audit_plan.scope_description or 'Not specified'}

ISO 45001:2018 Clauses to be Audited:
{iso_clause_numbers}

Departments:
{', '.join(audit_plan.departments) if audit_plan.departments else 'Not specified'}

Lead Auditor: {audit_plan.lead_auditor.get_full_name if audit_plan.lead_auditor else 'Not assigned'}

Audit Team:
{', '.join([member.get_full_name for member in audit_plan.audit_team.all()]) if audit_plan.audit_team.exists() else 'Not assigned'}

Objectives:
{chr(10).join([f"• {obj}" for obj in audit_plan.objectives]) if audit_plan.objectives else 'Not specified'}

Audit Criteria:
{audit_plan.audit_criteria or 'Not specified'}

{additional_message}

---
This is an automated notification from SafeSphere Audit Management System.
Please prepare the required documentation and personnel for the audit.

If you have any questions, please contact {audit_plan.lead_auditor.get_full_name if audit_plan.lead_auditor else 'the HSSE Manager'}.
"""
        
        # HTML message (prettier version)
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #0052D4 0%, #4364F7 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px; }}
        .header h1 {{ margin: 0; font-size: 24px; }}
        .header p {{ margin: 5px 0 0 0; opacity: 0.9; }}
        .section {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; }}
        .section h3 {{ margin: 0 0 15px 0; color: #0052D4; font-size: 16px; }}
        .info-row {{ margin: 10px 0; }}
        .label {{ font-weight: bold; color: #555; }}
        .value {{ color: #333; }}
        .badge {{ display: inline-block; padding: 5px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }}
        .badge-primary {{ background: #e3f2fd; color: #0052D4; }}
        .badge-warning {{ background: #fff3e0; color: #f57c00; }}
        .badge-success {{ background: #e8f5e9; color: #2e7d32; }}
        ul {{ padding-left: 20px; }}
        li {{ margin: 5px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; margin-top: 30px; }}
        .alert {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Audit Plan Notification</h1>
            <p>ISO 45001:2018 Internal Audit</p>
        </div>
        
        <div class="section">
            <h3>Audit Information</h3>
            <div class="info-row">
                <span class="label">Audit Code:</span>
                <span class="badge badge-primary">{audit_plan.audit_code}</span>
            </div>
            <div class="info-row">
                <span class="label">Title:</span>
                <span class="value">{audit_plan.title}</span>
            </div>
            <div class="info-row">
                <span class="label">Type:</span>
                <span class="value">{audit_plan.get_audit_type_display()}</span>
            </div>
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="badge badge-warning">{audit_plan.get_status_display()}</span>
            </div>
        </div>
        
        <div class="section">
            <h3>📅 Schedule</h3>
            <div class="info-row">
                <span class="label">Start Date:</span>
                <span class="value">{audit_plan.planned_start_date}</span>
            </div>
            <div class="info-row">
                <span class="label">End Date:</span>
                <span class="value">{audit_plan.planned_end_date}</span>
            </div>
            <div class="info-row">
                <span class="label">Duration:</span>
                <span class="value">{audit_plan.duration_days} days</span>
            </div>
        </div>
        
        <div class="section">
            <h3>📋 Scope</h3>
            <div class="info-row">
                <p>{audit_plan.scope_description or 'To be determined'}</p>
            </div>
            {f'<div class="info-row"><span class="label">Departments:</span> {", ".join(audit_plan.departments)}</div>' if audit_plan.departments else ''}
            {f'<div class="info-row"><span class="label">Processes:</span> {", ".join(audit_plan.processes)}</div>' if audit_plan.processes else ''}
        </div>
        
        <div class="section">
            <h3>📖 ISO 45001:2018 Clauses</h3>
            <ul>
                {chr(10).join([f'<li><strong>{clause.clause_number}</strong> - {clause.title}</li>' for clause in audit_plan.iso_clauses.all()])}
            </ul>
        </div>
        
        <div class="section">
            <h3>👥 Audit Team</h3>
            <div class="info-row">
                <span class="label">Lead Auditor:</span>
                <span class="value">{audit_plan.lead_auditor.get_full_name if audit_plan.lead_auditor else 'Not assigned'}</span>
            </div>
            {f'''<div class="info-row">
                <span class="label">Team Members:</span>
                <ul>
                    {chr(10).join([f'<li>{member.get_full_name} ({member.position})</li>' for member in audit_plan.audit_team.all()])}
                </ul>
            </div>''' if audit_plan.audit_team.exists() else ''}
        </div>
        
        {f'''<div class="section">
            <h3>🎯 Objectives</h3>
            <ul>
                {chr(10).join([f'<li>{obj}</li>' for obj in audit_plan.objectives])}
            </ul>
        </div>''' if audit_plan.objectives else ''}
        
        {f'''<div class="alert">
            <strong>📌 Additional Information:</strong>
            <p>{additional_message}</p>
        </div>''' if additional_message else ''}
        
        <div class="section">
            <h3>📝 Action Required</h3>
            <p>Please prepare the following for the audit:</p>
            <ul>
                <li>Relevant policies, procedures, and work instructions</li>
                <li>Records demonstrating compliance with ISO 45001:2018</li>
                <li>Personnel availability for interviews</li>
                <li>Access to work areas and facilities</li>
                <li>Evidence of implementation for the clauses listed above</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This is an automated notification from SafeSphere Audit Management System</p>
            <p>For questions, contact: {audit_plan.lead_auditor.get_full_name if audit_plan.lead_auditor else 'HSSE Manager'}</p>
            <p>Email: {audit_plan.lead_auditor.email if audit_plan.lead_auditor else settings.DEFAULT_FROM_EMAIL}</p>
        </div>
    </div>
</body>
</html>
"""
        
        # Send email
        email = EmailMultiAlternatives(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_emails,
        )
        email.attach_alternative(html_message, "text/html")
        email.send(fail_silently=False)
        
        logger.info(f"Audit plan notification sent for {audit_plan.audit_code} to {len(recipient_emails)} recipients")
        return len(recipient_emails)
        
    except Exception as e:
        logger.error(f"Failed to send audit plan notification: {str(e)}")
        return 0


def send_capa_assignment_notification(capa):
    """
    Send CAPA assignment notification to responsible person.
    
    Args:
        capa: CAPA instance
    
    Returns:
        Boolean indicating success
    """
    try:
        if not capa.responsible_person:
            return False
        
        subject = f"CAPA Assigned: {capa.action_code} - {capa.title}"
        
        message = f"""
CAPA Assignment Notification

Action Code: {capa.action_code}
Title: {capa.title}
Type: {capa.get_action_type_display()}
Priority: {capa.priority}

Related Finding: {capa.finding.finding_code} - {capa.finding.title}
ISO Clause: {capa.finding.iso_clause.clause_number} - {capa.finding.iso_clause.title}

Description:
{capa.description}

Root Cause:
{capa.root_cause}

Action Plan:
{capa.action_plan}

Target Completion Date: {capa.target_completion_date}
Assigned By: {capa.assigned_by.get_full_name if capa.assigned_by else 'System'}

Please acknowledge this CAPA and begin working on the corrective action.
Update your progress regularly in the SafeSphere Audit Management system.

Access your CAPA: {settings.FRONTEND_URL}/audit/capas

---
This is an automated notification from SafeSphere Audit Management System.
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[capa.responsible_person.email],
            fail_silently=False,
        )
        
        logger.info(f"CAPA assignment notification sent for {capa.action_code}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send CAPA notification: {str(e)}")
        return False


def send_capa_overdue_reminder(capa):
    """
    Send overdue CAPA reminder to responsible person and HSSE Manager.
    
    Args:
        capa: CAPA instance
    
    Returns:
        Boolean indicating success
    """
    try:
        if not capa.responsible_person:
            return False
        
        recipients = [capa.responsible_person.email]
        
        # Also notify HSSE Manager
        if capa.assigned_by and capa.assigned_by.email not in recipients:
            recipients.append(capa.assigned_by.email)
        
        subject = f"⚠️ OVERDUE CAPA: {capa.action_code} - {capa.title}"
        
        message = f"""
URGENT: CAPA OVERDUE REMINDER

Action Code: {capa.action_code}
Title: {capa.title}
Priority: {capa.priority}
Status: {capa.status}

Target Completion Date: {capa.target_completion_date}
Days Overdue: {capa.days_overdue}

Responsible Person: {capa.responsible_person.get_full_name}

This CAPA is now {capa.days_overdue} days overdue. 
Please take immediate action to complete this corrective action or request an extension.

Related Finding: {capa.finding.finding_code}
Finding Type: {capa.finding.finding_type}
Department: {capa.finding.department_affected}

Action Required:
1. Complete the CAPA immediately, OR
2. Update progress with explanation of delay, OR
3. Request deadline extension with justification

Access CAPA: {settings.FRONTEND_URL}/audit/capas

---
This is an automated reminder from SafeSphere Audit Management System.
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        
        logger.info(f"Overdue CAPA reminder sent for {capa.action_code}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send overdue reminder: {str(e)}")
        return False


def send_capa_deadline_approaching(capa, days_remaining):
    """
    Send reminder when CAPA deadline is approaching.
    
    Args:
        capa: CAPA instance
        days_remaining: Number of days until deadline
    
    Returns:
        Boolean indicating success
    """
    try:
        if not capa.responsible_person:
            return False
        
        recipients = [capa.responsible_person.email]
        
        # Also notify assigned_by for high priority or critical
        if capa.priority in ['CRITICAL', 'HIGH'] and capa.assigned_by:
            if capa.assigned_by.email not in recipients:
                recipients.append(capa.assigned_by.email)
        
        urgency = "URGENT" if days_remaining <= 1 else "REMINDER"
        subject = f"{urgency}: CAPA Due in {days_remaining} Day(s) - {capa.action_code}"
        
        message = f"""
CAPA DEADLINE APPROACHING

Action Code: {capa.action_code}
Title: {capa.title}
Priority: {capa.priority}
Current Status: {capa.status}

Target Completion Date: {capa.target_completion_date}
Days Remaining: {days_remaining}

Current Progress: {capa.progress_percentage}%

Responsible Person: {capa.responsible_person.get_full_name}

Related Finding: {capa.finding.finding_code}
Finding Type: {capa.finding.finding_type}
Department: {capa.finding.department_affected}

{"🚨 URGENT ACTION REQUIRED - Less than 24 hours remaining!" if days_remaining <= 1 else ""}

Action Required:
1. Complete remaining CAPA activities
2. Upload final evidence/documentation
3. Update progress to 100%
4. Submit for effectiveness verification

Access CAPA: {settings.FRONTEND_URL}/audit/capas

---
This is an automated reminder from SafeSphere Audit Management System.
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        
        logger.info(f"Deadline reminder sent for {capa.action_code} ({days_remaining} days remaining)")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send deadline reminder: {str(e)}")
        return False


def send_weekly_capa_summary(user):
    """
    Send weekly summary of assigned CAPAs to user.
    
    Args:
        user: User instance
    
    Returns:
        Boolean indicating success
    """
    from audits.models import CAPA
    from datetime import date
    
    try:
        # Get user's CAPAs
        capas = CAPA.objects.filter(
            responsible_person=user,
            status__in=['ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS']
        ).select_related('finding')
        
        if not capas.exists():
            return False
        
        overdue_count = sum(1 for c in capas if c.is_overdue)
        due_soon_count = sum(1 for c in capas if c.days_remaining <= 7 and not c.is_overdue)
        
        subject = f"Weekly CAPA Summary - {overdue_count} Overdue, {due_soon_count} Due Soon"
        
        message = f"""
WEEKLY CAPA SUMMARY

Hello {user.get_full_name},

Here is your CAPA summary for the week:

Total Active CAPAs: {capas.count()}
Overdue: {overdue_count}
Due within 7 days: {due_soon_count}
In Progress: {capas.filter(status='IN_PROGRESS').count()}

{"🚨 URGENT: You have overdue CAPAs requiring immediate attention!" if overdue_count > 0 else ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CAPA Details:

"""
        
        for capa in capas:
            status_icon = "🚨" if capa.is_overdue else "⏰" if capa.days_remaining <= 7 else "📋"
            
            message += f"""
{status_icon} {capa.action_code} - {capa.title}
   Priority: {capa.priority}
   Status: {capa.status}
   Target Date: {capa.target_completion_date}
   Progress: {capa.progress_percentage}%
   {"   ⚠️  OVERDUE by " + str(capa.days_overdue) + " days!" if capa.is_overdue else "   Days remaining: " + str(capa.days_remaining)}
   Related Finding: {capa.finding.finding_code}

"""
        
        message += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Access your CAPAs: {settings.FRONTEND_URL}/audit/capas

Please update your CAPA progress regularly.

---
This is your weekly summary from SafeSphere Audit Management System.
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f"Weekly CAPA summary sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send weekly summary: {str(e)}")
        return False


def send_finding_notification(finding):
    """
    Send finding notification to department head and HSSE Manager.
    
    Args:
        finding: AuditFinding instance
    
    Returns:
        Boolean indicating success
    """
    try:
        recipients = []
        
        # Notify department heads
        dept_heads = User.objects.filter(
            department=finding.department_affected,
            position__in=['OPS MANAGER', 'FINANCE MANAGER', 'HSSE MANAGER']
        )
        recipients.extend([user.email for user in dept_heads])
        
        # Notify HSSE Manager
        hsse_managers = User.objects.filter(position='HSSE MANAGER')
        for manager in hsse_managers:
            if manager.email not in recipients:
                recipients.append(manager.email)
        
        if not recipients:
            return False
        
        subject = f"🔍 New Finding: {finding.finding_code} - {finding.title}"
        
        severity_emoji = {
            'CRITICAL': '🔴',
            'HIGH': '🟠',
            'MEDIUM': '🟡',
            'LOW': '🔵',
        }
        
        message = f"""
New Audit Finding Notification

Finding Code: {finding.finding_code}
Type: {finding.get_finding_type_display()}
Severity: {severity_emoji.get(finding.severity, '')} {finding.severity}
Status: {finding.status}

Title: {finding.title}

Description:
{finding.description}

Audit: {finding.audit_plan.audit_code} - {finding.audit_plan.title}
ISO Clause: {finding.iso_clause.clause_number} - {finding.iso_clause.title}

Department Affected: {finding.department_affected}
Process Affected: {finding.process_affected or 'Not specified'}
Location: {finding.location or 'Not specified'}

Impact Assessment: {finding.impact_assessment}
Risk Level: {finding.risk_level}/10

{"⚠️ REQUIRES IMMEDIATE ACTION!" if finding.requires_immediate_action else ""}

Identified By: {finding.identified_by.get_full_name if finding.identified_by else 'Unknown'}
Date: {finding.identified_date}

Next Steps:
• Review the finding details in SafeSphere
• CAPA will be assigned shortly
• Cooperate with the audit team for resolution

Access Finding: {settings.FRONTEND_URL}/audit/findings

---
This is an automated notification from SafeSphere Audit Management System.
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        
        logger.info(f"Finding notification sent for {finding.finding_code}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send finding notification: {str(e)}")
        return False


def send_audit_completion_notification(audit_plan):
    """
    Send audit completion notification to stakeholders.
    
    Args:
        audit_plan: AuditPlan instance
    
    Returns:
        Number of emails sent
    """
    try:
        recipients = []
        
        # Audit team
        if audit_plan.lead_auditor:
            recipients.append(audit_plan.lead_auditor.email)
        
        for member in audit_plan.audit_team.all():
            if member.email not in recipients:
                recipients.append(member.email)
        
        # Department heads
        for dept in audit_plan.departments:
            dept_heads = User.objects.filter(
                department=dept,
                position__in=['OPS MANAGER', 'FINANCE MANAGER', 'HSSE MANAGER', 'MD']
            )
            recipients.extend([user.email for user in dept_heads if user.email not in recipients])
        
        if not recipients:
            return 0
        
        # Get findings summary
        findings = audit_plan.findings.all()
        major_ncs = findings.filter(finding_type='MAJOR_NC').count()
        minor_ncs = findings.filter(finding_type='MINOR_NC').count()
        observations = findings.filter(finding_type='OBSERVATION').count()
        
        subject = f"✅ Audit Completed: {audit_plan.audit_code} - {audit_plan.title}"
        
        message = f"""
Audit Completion Notification

The following audit has been completed:

Audit Code: {audit_plan.audit_code}
Title: {audit_plan.title}
Type: {audit_plan.get_audit_type_display()}

Audit Period: {audit_plan.actual_start_date or audit_plan.planned_start_date} to {audit_plan.actual_end_date or audit_plan.planned_end_date}

Findings Summary:
• Major Non-Conformities: {major_ncs}
• Minor Non-Conformities: {minor_ncs}
• Observations: {observations}
• Total Findings: {findings.count()}

The audit report is being prepared and will be shared shortly.

CAPAs will be assigned for identified non-conformities.
Responsible persons will be notified separately.

Access Audit Results: {settings.FRONTEND_URL}/audit/dashboard

---
This is an automated notification from SafeSphere Audit Management System.
"""
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        
        logger.info(f"Audit completion notification sent for {audit_plan.audit_code}")
        return len(recipients)
        
    except Exception as e:
        logger.error(f"Failed to send completion notification: {str(e)}")
        return 0

