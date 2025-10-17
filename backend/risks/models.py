"""
ISO 45001:2018 & ISO 31000 Compliant Risk Management System
Comprehensive risk assessment with bowtie methodology, 5x5 matrix, and ALARP.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta, date
import uuid

User = get_user_model()


# =============================
# Risk Assessment Master
# =============================
class RiskAssessment(models.Model):
    """Master risk assessment record."""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('ACTIVE', 'Active'),
        ('ARCHIVED', 'Archived'),
    ]
    
    RISK_CATEGORY_CHOICES = [
        ('SAFETY', 'Occupational Safety'),
        ('HEALTH', 'Occupational Health'),
        ('ENVIRONMENTAL', 'Environmental'),
        ('SECURITY', 'Security'),
        ('PROCESS_SAFETY', 'Process Safety'),
    ]
    
    ACTIVITY_TYPE_CHOICES = [
        ('ROUTINE', 'Routine Operation'),
        ('NON_ROUTINE', 'Non-Routine Operation'),
        ('EMERGENCY', 'Emergency Response'),
        ('MAINTENANCE', 'Maintenance Activity'),
        ('CONSTRUCTION', 'Construction/Project'),
    ]
    
    ACCEPTABILITY_CHOICES = [
        ('ACCEPTABLE', 'Acceptable'),
        ('ALARP', 'As Low As Reasonably Practicable'),
        ('UNACCEPTABLE', 'Unacceptable - Action Required'),
    ]
    
    # Identification
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_number = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    version = models.IntegerField(default=1)
    
    # Metadata
    assessment_date = models.DateField(default=date.today)
    assessed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='risk_assessments_created'
    )
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='risk_assessments_approved'
    )
    approval_date = models.DateField(null=True, blank=True)
    review_date = models.DateField(null=True, blank=True, help_text="Last review date")
    next_review_date = models.DateField(null=True, blank=True, help_text="Next scheduled review")
    
    # Activity Identification
    location = models.CharField(max_length=255, help_text="Location or facility")
    process_area = models.CharField(max_length=255, help_text="Process or department")
    activity_description = models.TextField(help_text="Detailed description of activity being assessed")
    risk_category = models.CharField(max_length=20, choices=RISK_CATEGORY_CHOICES)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPE_CHOICES)
    
    # Risk Ownership
    risk_owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='risks_owned',
        help_text="Person accountable for managing this risk"
    )
    
    # Initial Risk (Without Controls)
    initial_probability = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1-5: Probability without controls"
    )
    initial_severity = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1-5: Severity without controls"
    )
    
    # Residual Risk (With Existing Controls)
    residual_probability = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1-5: Probability with existing controls"
    )
    residual_severity = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="1-5: Severity with existing controls"
    )
    
    # Risk Evaluation
    risk_acceptable = models.BooleanField(default=False)
    alarp_required = models.BooleanField(default=False)
    alarp_justification = models.TextField(
        blank=True,
        help_text="Justification for ALARP (if residual risk is medium/high)"
    )
    management_decision = models.TextField(
        blank=True,
        help_text="Management decision on risk acceptability"
    )
    
    # Compliance
    iso_45001_clauses = models.JSONField(
        default=list,
        blank=True,
        help_text="Applicable ISO 45001 clauses"
    )
    legal_requirements = models.JSONField(
        default=list,
        blank=True,
        help_text="Applicable legal requirements"
    )
    company_procedures = models.JSONField(
        default=list,
        blank=True,
        help_text="Applicable company procedures"
    )
    
    # General
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        permissions = [
            ('can_approve_risk', 'Can approve risk assessments'),
            ('can_manage_risks', 'Can manage all risk assessments'),
        ]
        indexes = [
            models.Index(fields=['status', 'risk_category']),
            models.Index(fields=['location', 'process_area']),
            models.Index(fields=['next_review_date']),
        ]
    
    def __str__(self):
        return f"{self.event_number} - {self.location} - {self.process_area}"
    
    def save(self, *args, **kwargs):
        if not self.event_number:
            # Generate event number: RA-2025-0001
            year = date.today().year
            last_ra = RiskAssessment.objects.filter(
                event_number__startswith=f'RA-{year}-'
            ).order_by('-event_number').first()
            
            if last_ra:
                last_num = int(last_ra.event_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.event_number = f'RA-{year}-{new_num:04d}'
        
        super().save(*args, **kwargs)
    
    @property
    def initial_risk_level(self):
        """Calculate initial risk level (P × S)."""
        return self.initial_probability * self.initial_severity
    
    @property
    def residual_risk_level(self):
        """Calculate residual risk level (P × S)."""
        return self.residual_probability * self.residual_severity
    
    @property
    def initial_risk_color(self):
        """Get color for initial risk level."""
        return self.get_risk_color(self.initial_risk_level)
    
    @property
    def residual_risk_color(self):
        """Get color for residual risk level."""
        return self.get_risk_color(self.residual_risk_level)
    
    @property
    def initial_risk_rating(self):
        """Get rating for initial risk level."""
        return self.get_risk_rating(self.initial_risk_level)
    
    @property
    def residual_risk_rating(self):
        """Get rating for residual risk level."""
        return self.get_risk_rating(self.residual_risk_level)
    
    @staticmethod
    def get_risk_color(risk_level):
        """Get color code for risk level."""
        if risk_level >= 15:
            return '#D32F2F'  # Red - High/Extreme
        elif risk_level >= 6:
            return '#F57C00'  # Orange - Medium
        else:
            return '#388E3C'  # Green - Low
    
    @staticmethod
    def get_risk_rating(risk_level):
        """Get text rating for risk level."""
        if risk_level >= 20:
            return 'EXTREME'
        elif risk_level >= 15:
            return 'HIGH'
        elif risk_level >= 6:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    @property
    def is_overdue_for_review(self):
        """Check if risk assessment is overdue for review."""
        if self.next_review_date and self.status == 'ACTIVE':
            return date.today() > self.next_review_date
        return False
    
    @property
    def days_until_review(self):
        """Calculate days until next review."""
        if self.next_review_date:
            delta = self.next_review_date - date.today()
            return delta.days
        return None
    
    def set_review_schedule(self):
        """Auto-set next review date based on residual risk level."""
        if self.residual_risk_level >= 15:
            # High/Extreme: Quarterly review
            self.next_review_date = date.today() + timedelta(days=90)
        elif self.residual_risk_level >= 6:
            # Medium: Semi-annual review
            self.next_review_date = date.today() + timedelta(days=180)
        else:
            # Low: Annual review
            self.next_review_date = date.today() + timedelta(days=365)


# =============================
# Risk Hazards
# =============================
class RiskHazard(models.Model):
    """Hazards identified within a risk assessment."""
    
    HAZARD_TYPE_CHOICES = [
        ('PROCESS', 'Process Hazard'),
        ('PRODUCT', 'Product/Material Hazard'),
        ('EXTERNAL', 'External Environment Hazard'),
        ('BEHAVIORAL', 'Behavioral/Human Factor'),
        ('ORGANIZATIONAL', 'Organizational/Systemic'),
    ]
    
    IMPACT_TYPE_CHOICES = [
        ('INJURY', 'Personal Injury'),
        ('ILLNESS', 'Occupational Illness'),
        ('ENVIRONMENTAL', 'Environmental Damage'),
        ('PROPERTY', 'Property Damage'),
        ('REPUTATION', 'Reputational Damage'),
        ('FINANCIAL', 'Financial Loss'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    risk_assessment = models.ForeignKey(
        RiskAssessment,
        on_delete=models.CASCADE,
        related_name='hazards'
    )
    
    hazard_type = models.CharField(max_length=20, choices=HAZARD_TYPE_CHOICES)
    hazard_description = models.TextField(help_text="What is the hazard?")
    event_description = models.TextField(help_text="What is the hazardous event/scenario?")
    causes = models.TextField(help_text="What could cause this event? (Initiating/triggering factors)")
    consequences = models.TextField(help_text="What are the possible consequences?")
    impact_type = models.CharField(max_length=20, choices=IMPACT_TYPE_CHOICES)
    
    order = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.risk_assessment.event_number} - {self.hazard_description[:50]}"


# =============================
# Risk Exposure
# =============================
class RiskExposure(models.Model):
    """Exposure information for a risk assessment."""
    
    FREQUENCY_CHOICES = [
        ('CONTINUOUS', 'Continuous (daily, all shift)'),
        ('FREQUENT', 'Frequent (daily, part of shift)'),
        ('OCCASIONAL', 'Occasional (weekly)'),
        ('INFREQUENT', 'Infrequent (monthly)'),
        ('RARE', 'Rare (yearly or less)'),
    ]
    
    PERSONNEL_TYPE_CHOICES = [
        ('EMPLOYEES', 'Employees'),
        ('CONTRACTORS', 'Contractors'),
        ('VISITORS', 'Visitors'),
        ('PUBLIC', 'General Public'),
        ('EMERGENCY', 'Emergency Responders'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    risk_assessment = models.OneToOneField(
        RiskAssessment,
        on_delete=models.CASCADE,
        related_name='exposure'
    )
    
    affected_personnel = models.CharField(
        max_length=20,
        choices=PERSONNEL_TYPE_CHOICES,
        help_text="Type of personnel exposed"
    )
    number_exposed = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Approximate number of people exposed"
    )
    exposure_frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    exposure_duration = models.CharField(
        max_length=255,
        blank=True,
        help_text="e.g., '2 hours per day', '15 minutes per week'"
    )
    vulnerable_groups = models.TextField(
        blank=True,
        help_text="Any vulnerable groups? (young workers, pregnant, disabled, etc.)"
    )
    
    class Meta:
        verbose_name = "Risk Exposure"
        verbose_name_plural = "Risk Exposures"
    
    def __str__(self):
        return f"{self.risk_assessment.event_number} - {self.number_exposed} {self.affected_personnel}"


# =============================
# Control Barriers
# =============================
class ControlBarrier(models.Model):
    """Preventive and protective barriers/controls."""
    
    BARRIER_TYPE_CHOICES = [
        ('PREVENTIVE', 'Preventive (Prevent event occurrence)'),
        ('PROTECTIVE', 'Protective (Reduce consequences)'),
    ]
    
    HIERARCHY_CHOICES = [
        (1, 'Elimination'),
        (2, 'Substitution'),
        (3, 'Engineering Controls'),
        (4, 'Administrative Controls'),
        (5, 'Personal Protective Equipment (PPE)'),
    ]
    
    EFFECTIVENESS_CHOICES = [
        (5, 'Very High - Highly Effective'),
        (4, 'High - Effective'),
        (3, 'Medium - Moderately Effective'),
        (2, 'Low - Limited Effectiveness'),
        (1, 'Very Low - Ineffective'),
    ]
    
    CONDITION_CHOICES = [
        ('EXCELLENT', 'Excellent'),
        ('GOOD', 'Good'),
        ('FAIR', 'Fair'),
        ('POOR', 'Poor'),
        ('FAILED', 'Failed/Not Working'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    risk_assessment = models.ForeignKey(
        RiskAssessment,
        on_delete=models.CASCADE,
        related_name='barriers'
    )
    
    barrier_type = models.CharField(max_length=20, choices=BARRIER_TYPE_CHOICES)
    description = models.TextField(help_text="Control/barrier description")
    hierarchy_level = models.IntegerField(
        choices=HIERARCHY_CHOICES,
        help_text="Hierarchy of controls (1=best, 5=least effective)"
    )
    effectiveness_rating = models.IntegerField(
        choices=EFFECTIVENESS_CHOICES,
        help_text="How effective is this barrier?"
    )
    evidence = models.TextField(
        blank=True,
        help_text="Evidence that barrier is effective (e.g., inspection records, test results)"
    )
    last_inspected_date = models.DateField(null=True, blank=True)
    next_inspection_date = models.DateField(null=True, blank=True)
    condition = models.CharField(
        max_length=20,
        choices=CONDITION_CHOICES,
        default='GOOD'
    )
    barrier_owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='barriers_owned',
        help_text="Person responsible for maintaining this barrier"
    )
    
    order = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['barrier_type', 'hierarchy_level', 'order']
    
    def __str__(self):
        return f"{self.get_barrier_type_display()} - {self.description[:50]}"
    
    @property
    def is_overdue_for_inspection(self):
        """Check if barrier inspection is overdue."""
        if self.next_inspection_date:
            return date.today() > self.next_inspection_date
        return False


# =============================
# Risk Treatment Actions
# =============================
class RiskTreatmentAction(models.Model):
    """Additional controls/barriers to be implemented."""
    
    STATUS_CHOICES = [
        ('PLANNED', 'Planned'),
        ('IN_PROGRESS', 'In Progress'),
        ('IMPLEMENTED', 'Implemented'),
        ('VERIFIED', 'Verified'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    HIERARCHY_CHOICES = [
        (1, 'Elimination'),
        (2, 'Substitution'),
        (3, 'Engineering Controls'),
        (4, 'Administrative Controls'),
        (5, 'Personal Protective Equipment (PPE)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    risk_assessment = models.ForeignKey(
        RiskAssessment,
        on_delete=models.CASCADE,
        related_name='treatment_actions'
    )
    
    action_description = models.TextField(help_text="Barrier/control to be implemented")
    barrier_type = models.CharField(
        max_length=20,
        choices=[('PREVENTIVE', 'Preventive'), ('PROTECTIVE', 'Protective')]
    )
    hierarchy_level = models.IntegerField(
        choices=HIERARCHY_CHOICES,
        help_text="Hierarchy of controls"
    )
    
    responsible_person = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='risk_actions_responsible'
    )
    target_date = models.DateField(help_text="Target implementation date")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNED')
    actual_implementation_date = models.DateField(null=True, blank=True)
    
    # Link to CAPA system (integration!)
    linked_capa = models.ForeignKey(
        'audits.CAPA',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='risk_actions',
        help_text="Link to CAPA if action requires formal corrective action"
    )
    
    verification_method = models.TextField(
        blank=True,
        help_text="How will effectiveness be verified?"
    )
    verification_date = models.DateField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='risk_actions_verified'
    )
    
    order = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.risk_assessment.event_number} - {self.action_description[:50]}"
    
    @property
    def is_overdue(self):
        """Check if action is overdue."""
        if self.status not in ['IMPLEMENTED', 'VERIFIED', 'CANCELLED']:
            if self.target_date:
                return date.today() > self.target_date
        return False
    
    @property
    def days_remaining(self):
        """Days until target date."""
        if self.target_date:
            delta = self.target_date - date.today()
            return delta.days
        return None


# =============================
# Risk Review History
# =============================
class RiskReview(models.Model):
    """Track review history of risk assessments."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    risk_assessment = models.ForeignKey(
        RiskAssessment,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    
    review_date = models.DateField(default=date.today)
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='risk_reviews_conducted'
    )
    
    changes_made = models.TextField(help_text="What changed since last review?")
    previous_risk_level = models.IntegerField(null=True, blank=True)
    new_risk_level = models.IntegerField(null=True, blank=True)
    
    controls_effective = models.BooleanField(
        default=True,
        help_text="Are existing controls still effective?"
    )
    new_hazards_identified = models.BooleanField(
        default=False,
        help_text="Were new hazards identified?"
    )
    
    next_review_date = models.DateField(
        null=True,
        blank=True,
        help_text="When should next review occur?"
    )
    
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-review_date']
    
    def __str__(self):
        return f"Review of {self.risk_assessment.event_number} on {self.review_date}"


# =============================
# Risk Attachments
# =============================
class RiskAttachment(models.Model):
    """Attachments for risk assessments (photos, diagrams, JSAs)."""
    
    FILE_TYPE_CHOICES = [
        ('PHOTO', 'Photograph'),
        ('BOWTIE', 'Bowtie Diagram'),
        ('JSA', 'Job Safety Analysis'),
        ('PROCEDURE', 'Procedure/SOP'),
        ('INSPECTION', 'Inspection Report'),
        ('OTHER', 'Other Document'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    risk_assessment = models.ForeignKey(
        RiskAssessment,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    
    file = models.FileField(upload_to='risk_assessments/%Y/%m/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    description = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='risk_attachments_uploaded'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.get_file_type_display()} - {self.risk_assessment.event_number}"


# =============================
# Risk Matrix Configuration
# =============================
class RiskMatrixConfig(models.Model):
    """5x5 Risk Matrix configuration and definitions."""
    
    # Matrix dimensions (5x5 standard, but configurable)
    matrix_size = models.IntegerField(default=5)
    
    # Probability definitions (JSON for flexibility)
    probability_definitions = models.JSONField(
        default=dict,
        help_text="""
        {
            "1": {"label": "Rare", "description": "<10% chance, almost never", "examples": "..."},
            "2": {"label": "Unlikely", "description": "10-30%, rarely", "examples": "..."},
            ...
        }
        """
    )
    
    # Severity definitions
    severity_definitions = models.JSONField(
        default=dict,
        help_text="""
        {
            "1": {"label": "Negligible", "description": "Near miss, no injury", "examples": "..."},
            "2": {"label": "Minor", "description": "First aid injury", "examples": "..."},
            ...
        }
        """
    )
    
    # Risk tolerance levels
    low_threshold = models.IntegerField(default=5, help_text="Risk ≤ this is LOW")
    medium_threshold = models.IntegerField(default=12, help_text="Risk ≤ this is MEDIUM")
    # Above medium_threshold is HIGH/EXTREME
    
    # Colors
    low_risk_color = models.CharField(max_length=7, default='#388E3C')  # Green
    medium_risk_color = models.CharField(max_length=7, default='#F57C00')  # Orange
    high_risk_color = models.CharField(max_length=7, default='#D32F2F')  # Red
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='risk_matrix_updates'
    )
    
    class Meta:
        verbose_name = "Risk Matrix Configuration"
        verbose_name_plural = "Risk Matrix Configuration"
    
    def __str__(self):
        return f"Risk Matrix ({self.matrix_size}×{self.matrix_size})"
    
    def save(self, *args, **kwargs):
        # Ensure only one config exists
        if not self.pk and RiskMatrixConfig.objects.exists():
            raise ValueError("Risk Matrix Config already exists. Please update the existing record.")
        super().save(*args, **kwargs)
    
    @classmethod
    def get_config(cls):
        """Get or create risk matrix configuration."""
        config, created = cls.objects.get_or_create(id=1)
        return config
    
    def get_risk_rating(self, risk_level):
        """Get rating for a given risk level."""
        if risk_level <= self.low_threshold:
            return 'LOW'
        elif risk_level <= self.medium_threshold:
            return 'MEDIUM'
        else:
            return 'HIGH'
    
    def get_risk_color(self, risk_level):
        """Get color for a given risk level."""
        if risk_level <= self.low_threshold:
            return self.low_risk_color
        elif risk_level <= self.medium_threshold:
            return self.medium_risk_color
        else:
            return self.high_risk_color
