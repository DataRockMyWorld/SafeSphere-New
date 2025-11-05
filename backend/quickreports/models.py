from django.db import models
from accounts.models import User
from documents.models import Record
import uuid
from django.utils import timezone


class QuickReport(models.Model):
    """
    Base model for quick incident reporting.
    Types: Accident, Near Miss, Potential Incident, Non-Conformity
    
    On approval, automatically creates a Record in the Records system.
    """
    REPORT_TYPE_CHOICES = [
        ('ACCIDENT', 'Accident'),
        ('NEAR_MISS', 'Near Miss'),
        ('POTENTIAL_INCIDENT', 'Potential Incident'),
        ('NON_CONFORMITY', 'Non-Conformity'),
    ]
    
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    # Identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_number = models.CharField(max_length=30, unique=True, editable=False, null=True, blank=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    
    # Incident Details
    title = models.CharField(max_length=255, help_text="Brief description of the incident")
    description = models.TextField(help_text="Detailed description of what happened")
    location = models.CharField(max_length=255, help_text="Where did this occur?")
    incident_date = models.DateTimeField(help_text="When did this occur?")
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='LOW')
    
    # People Involved
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='quick_reports_submitted')
    persons_involved = models.TextField(blank=True, help_text="Names of people involved (if any)")
    witnesses = models.TextField(blank=True, help_text="Names of witnesses (if any)")
    
    # Immediate Actions
    immediate_actions_taken = models.TextField(blank=True, help_text="What was done immediately after the incident?")
    
    # Contributing Factors
    contributing_factors = models.TextField(blank=True, help_text="What factors contributed to this incident?")
    
    # Attachments
    photo_evidence = models.FileField(upload_to='quick_reports/photos/%Y/%m/', blank=True, null=True)
    additional_document = models.FileField(upload_to='quick_reports/documents/%Y/%m/', blank=True, null=True)
    
    # Workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Review fields
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='quick_reports_reviewed')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_comments = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Link to created Record (after approval)
    created_record = models.ForeignKey(Record, on_delete=models.SET_NULL, null=True, blank=True, related_name='source_quick_report')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['report_type', 'status']),
            models.Index(fields=['reported_by', 'created_at']),
            models.Index(fields=['incident_date']),
        ]
    
    def __str__(self):
        return f"{self.report_number} - {self.get_report_type_display()} - {self.title}"
    
    def save(self, *args, **kwargs):
        """Auto-generate report number on creation."""
        is_new = self.pk is None
        
        if is_new and not self.report_number:
            # Generate report number: QR-TYPE-YYYY-NNN
            year = timezone.now().year
            type_prefix = self.report_type[:2]  # AC, NE, PO, NO
            
            # Get count of reports of this type for this year
            from django.db.models import Q
            year_count = QuickReport.objects.filter(
                report_type=self.report_type,
                created_at__year=year
            ).count() + 1
            
            self.report_number = f"QR-{type_prefix}-{year}-{year_count:03d}"
        
        super().save(*args, **kwargs)
    
    def can_be_reviewed_by(self, user):
        """Only HSSE Manager and Superadmin can review quick reports."""
        return user.position == 'HSSE MANAGER' or user.is_superuser
    
    def approve(self, user, comments=''):
        """
        Approve the quick report and create a Record.
        The record will be auto-filed in the Records system.
        """
        if not self.can_be_reviewed_by(user):
            raise ValueError("You do not have permission to approve this report.")
        
        self.status = 'APPROVED'
        self.reviewed_by = user
        self.reviewed_at = timezone.now()
        self.review_comments = comments
        self.rejection_reason = ''
        self.save()
        
        # Create a Record from this quick report
        self._create_record()
        
        # Send approval notification
        self._send_approval_notification()
    
    def reject(self, user, reason):
        """Reject the quick report with a reason."""
        if not self.can_be_reviewed_by(user):
            raise ValueError("You do not have permission to reject this report.")
        
        if not reason or not reason.strip():
            raise ValueError("A rejection reason is required.")
        
        self.status = 'REJECTED'
        self.reviewed_by = user
        self.reviewed_at = timezone.now()
        self.rejection_reason = reason
        self.review_comments = ''
        self.save()
        
        # Send rejection notification
        self._send_rejection_notification()
    
    def _create_record(self):
        """Create a Record in the Records system from this approved quick report."""
        from django.core.files.base import ContentFile
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors
        from io import BytesIO
        import os
        
        # Generate a PDF report
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title_style = styles['Title']
        story.append(Paragraph(f"{self.get_report_type_display()} Report", title_style))
        story.append(Spacer(1, 12))
        
        # Report details
        data = [
            ['Report Number:', self.report_number],
            ['Type:', self.get_report_type_display()],
            ['Title:', self.title],
            ['Location:', self.location],
            ['Incident Date:', self.incident_date.strftime('%B %d, %Y at %I:%M %p')],
            ['Severity:', self.get_severity_display()],
            ['Reported By:', self.reported_by.get_full_name if self.reported_by else 'Unknown'],
            ['Reported On:', self.created_at.strftime('%B %d, %Y at %I:%M %p')],
        ]
        
        if self.persons_involved:
            data.append(['Persons Involved:', self.persons_involved])
        if self.witnesses:
            data.append(['Witnesses:', self.witnesses])
        
        table = Table(data, colWidths=[150, 350])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        story.append(table)
        story.append(Spacer(1, 20))
        
        # Description
        story.append(Paragraph('<b>Description:</b>', styles['Heading2']))
        story.append(Paragraph(self.description, styles['BodyText']))
        story.append(Spacer(1, 12))
        
        # Immediate Actions
        if self.immediate_actions_taken:
            story.append(Paragraph('<b>Immediate Actions Taken:</b>', styles['Heading2']))
            story.append(Paragraph(self.immediate_actions_taken, styles['BodyText']))
            story.append(Spacer(1, 12))
        
        # Contributing Factors
        if self.contributing_factors:
            story.append(Paragraph('<b>Contributing Factors:</b>', styles['Heading2']))
            story.append(Paragraph(self.contributing_factors, styles['BodyText']))
            story.append(Spacer(1, 12))
        
        # Approval Info
        if self.reviewed_by:
            story.append(Paragraph('<b>Approval Information:</b>', styles['Heading2']))
            approval_data = [
                ['Reviewed By:', self.reviewed_by.get_full_name],
                ['Reviewed On:', self.reviewed_at.strftime('%B %d, %Y at %I:%M %p') if self.reviewed_at else 'N/A'],
            ]
            if self.review_comments:
                approval_data.append(['Comments:', self.review_comments])
            
            approval_table = Table(approval_data, colWidths=[150, 350])
            approval_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(approval_table)
        
        # Build PDF
        doc.build(story)
        pdf_content = buffer.getvalue()
        buffer.close()
        
        # Create Record
        record_title = f"{self.get_report_type_display()} - {self.title} - {self.report_number}"
        record_notes = f"Auto-generated from Quick Report {self.report_number}\n\nReview Comments: {self.review_comments}"
        
        record = Record.objects.create(
            title=record_title,
            notes=record_notes,
            submitted_by=self.reported_by,
            status='APPROVED',  # Auto-approved since quick report was already approved
            reviewed_by=self.reviewed_by,
            reviewed_at=self.reviewed_at,
        )
        
        # Attach the PDF
        filename = f"{self.report_number}_{self.get_report_type_display().replace(' ', '_')}.pdf"
        record.submitted_file.save(filename, ContentFile(pdf_content), save=True)
        
        # Link the record to this quick report
        self.created_record = record
        self.save(update_fields=['created_record'])
        
        return record
    
    def _send_approval_notification(self):
        """Send notification when quick report is approved."""
        if not self.reported_by:
            return
        
        try:
            from accounts.models import Notification
            from django.core.mail import send_mail
            from django.conf import settings
            
            # Create in-app notification
            Notification.objects.create(
                user=self.reported_by,
                notification_type='REPORT_APPROVED',
                title=f'Quick Report Approved: {self.report_number}',
                message=f'Your {self.get_report_type_display()} report "{self.title}" has been approved and filed as a record.',
                related_object_id=str(self.id),
                related_object_type='quickreport',
            )
            
            # Send email
            subject = f'✅ Quick Report Approved: {self.report_number}'
            message = f"""
Hello {self.reported_by.get_full_name},

Your quick report has been approved and filed!

Report Number: {self.report_number}
Type: {self.get_report_type_display()}
Title: {self.title}
Location: {self.location}
Incident Date: {self.incident_date.strftime('%B %d, %Y at %I:%M %p')}
Severity: {self.get_severity_display()}

Reviewed by: {self.reviewed_by.get_full_name if self.reviewed_by else 'HSSE Manager'}
Reviewed on: {self.reviewed_at.strftime('%B %d, %Y at %I:%M %p') if self.reviewed_at else 'N/A'}

{'Review Comments: ' + self.review_comments if self.review_comments else ''}

This report has been automatically filed as a record in the system.

Access your records: {settings.FRONTEND_URL}/document-management/records

---
This is an automated notification from SafeSphere Quick Reporting System.
"""
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.reported_by.email],
                fail_silently=False,
            )
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send approval notification for {self.report_number}: {e}")
    
    def _send_rejection_notification(self):
        """Send notification when quick report is rejected."""
        if not self.reported_by:
            return
        
        try:
            from accounts.models import Notification
            from django.core.mail import send_mail
            from django.conf import settings
            
            # Create in-app notification
            Notification.objects.create(
                user=self.reported_by,
                notification_type='REPORT_REJECTED',
                title=f'Quick Report Rejected: {self.report_number}',
                message=f'Your {self.get_report_type_display()} report "{self.title}" was rejected. Reason: {self.rejection_reason}',
                related_object_id=str(self.id),
                related_object_type='quickreport',
            )
            
            # Send email
            subject = f'❌ Quick Report Rejected: {self.report_number}'
            message = f"""
Hello {self.reported_by.get_full_name},

Your quick report has been rejected and requires correction.

Report Number: {self.report_number}
Type: {self.get_report_type_display()}
Title: {self.title}

Reviewed by: {self.reviewed_by.get_full_name if self.reviewed_by else 'HSSE Manager'}
Reviewed on: {self.reviewed_at.strftime('%B %d, %Y at %I:%M %p') if self.reviewed_at else 'N/A'}

REJECTION REASON:
{self.rejection_reason}

Please review the feedback, make necessary corrections, and resubmit if needed.

Access Quick Reports: {settings.FRONTEND_URL}/document-management/quick-reports

If you have questions, please contact the HSSE Manager.

---
This is an automated notification from SafeSphere Quick Reporting System.
"""
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.reported_by.email],
                fail_silently=False,
            )
            
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send rejection notification for {self.report_number}: {e}")

