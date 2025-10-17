"""
ISO 45001:2018 Internal Audit Management System
Comprehensive audit tracking with findings, CAPAs, and evidence management.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from datetime import timedelta, date

User = get_user_model()


# =============================
# Audit Scoring Criteria
# =============================
class AuditScoringCriteria(models.Model):
    """Industry standard definitions for audit findings and scoring."""
    
    FINDING_TYPE_CHOICES = [
        ('COMPLIANT', 'Compliant'),
        ('OFI', 'Opportunity for Improvement'),
        ('MINOR_NC', 'Minor Non-Conformity'),
        ('MAJOR_NC', 'Major Non-Conformity'),
    ]
    
    finding_type = models.CharField(max_length=20, choices=FINDING_TYPE_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    color_code = models.CharField(max_length=20, help_text="GREEN, YELLOW, ORANGE, RED")
    score_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Score contribution (0-100%)"
    )
    definition = models.TextField(help_text="Industry standard definition")
    action_required = models.TextField(help_text="Required action for this finding type")
    examples = models.TextField(blank=True, help_text="Examples of this finding type")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-score_percentage']
        verbose_name = "Audit Scoring Criteria"
        verbose_name_plural = "Audit Scoring Criteria"
    
    def __str__(self):
        return f"{self.display_name} - {self.score_percentage}%"


# =============================
# Audit Type Configuration
# =============================
class AuditType(models.Model):
    """Configurable audit types for flexibility."""
    
    name = models.CharField(max_length=100, unique=True, help_text="e.g., System Audit, Compliance Audit")
    code = models.CharField(max_length=20, unique=True, help_text="Short code for the audit type")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Audit Type"
        verbose_name_plural = "Audit Types"
    
    def __str__(self):
        return self.name


# =============================
# Audit Checklist Templates
# =============================
class AuditChecklistTemplate(models.Model):
    """Template for audit checklists based on audit type."""
    
    audit_type = models.ForeignKey(
        AuditType, 
        on_delete=models.CASCADE, 
        related_name='checklist_templates'
    )
    name = models.CharField(max_length=255, help_text="e.g., 'System Audit Checklist v1.0'")
    description = models.TextField(blank=True)
    version = models.CharField(max_length=20, default='1.0')
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        'accounts.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='audit_templates_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['audit_type', '-version']
        verbose_name = "Audit Checklist Template"
        verbose_name_plural = "Audit Checklist Templates"
        unique_together = ['audit_type', 'version']
    
    def __str__(self):
        return f"{self.audit_type.name} - {self.name}"
    
    def validate_weights(self):
        """Validate that all category weights sum to 100%."""
        from decimal import Decimal
        
        total_weight = sum(c.weight for c in self.categories.all())
        if self.categories.exists() and abs(total_weight - Decimal('100')) > Decimal('0.05'):
            return False, f"Category weights sum to {total_weight}%, must be 100%"
        return True, "OK"


class AuditChecklistCategory(models.Model):
    """Category/Section in an audit checklist."""
    
    template = models.ForeignKey(
        AuditChecklistTemplate, 
        on_delete=models.CASCADE, 
        related_name='categories'
    )
    section_number = models.IntegerField(help_text="e.g., 1, 2, 3")
    category_name = models.CharField(max_length=255, help_text="e.g., 'Leadership & HSSE Culture'")
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Category weight in % (all categories must sum to 100%)"
    )
    
    class Meta:
        ordering = ['template', 'order', 'section_number']
        verbose_name = "Audit Checklist Category"
        verbose_name_plural = "Audit Checklist Categories"
        unique_together = ['template', 'section_number']
    
    def __str__(self):
        return f"{self.section_number}. {self.category_name}"
    
    def validate_weights(self):
        """Validate that all question weights sum to 100%."""
        from decimal import Decimal
        
        total_weight = sum(q.weight for q in self.questions.all())
        if self.questions.exists() and abs(total_weight - Decimal('100')) > Decimal('0.05'):
            return False, f"Question weights sum to {total_weight}%, must be 100%"
        return True, "OK"
    
    def calculate_score(self, finding):
        """Calculate score for this category based on question responses."""
        from decimal import Decimal
        
        questions = self.questions.all()
        if not questions:
            return Decimal('100')
        
        total_weight = sum(q.weight for q in questions)
        if total_weight == 0:
            return Decimal('100')
        
        weighted_score = Decimal('0')
        
        for question in questions:
            response = finding.question_responses.filter(question=question).first()
            if response:
                question_score = self.get_compliance_score(response.compliance_status)
                weighted_score += (question_score * question.weight) / total_weight
        
        return weighted_score
    
    @staticmethod
    def get_compliance_score(status):
        """Get score based on compliance status."""
        from decimal import Decimal
        
        scores = {
            'COMPLIANT': Decimal('100'),
            'OBSERVATION': Decimal('90'),
            'OPPORTUNITY': Decimal('90'),
            'NON_COMPLIANT': Decimal('0'),
            'NOT_APPLICABLE': Decimal('100'),  # N/A doesn't affect score
        }
        return scores.get(status, Decimal('100'))


class AuditChecklistQuestion(models.Model):
    """Individual question in an audit checklist."""
    
    RESPONSE_TYPE_CHOICES = [
        ('TEXT', 'Text'),
        ('YES_NO', 'Yes/No'),
        ('RATING', 'Rating (1-5)'),
        ('FILE', 'File Upload'),
        ('MULTI_TEXT', 'Multiple Text Fields'),
    ]
    
    category = models.ForeignKey(
        AuditChecklistCategory, 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    subsection_name = models.CharField(
        max_length=255, 
        blank=True,
        help_text="e.g., 'Commitment to HSE'"
    )
    reference_number = models.CharField(
        max_length=20, 
        help_text="e.g., '1.1', '2.1'"
    )
    question_letter = models.CharField(
        max_length=10, 
        help_text="e.g., 'a', 'b', 'c'"
    )
    question_text = models.TextField(help_text="The actual question")
    expected_response_type = models.CharField(
        max_length=20, 
        choices=RESPONSE_TYPE_CHOICES, 
        default='TEXT'
    )
    is_mandatory = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Question weight in % within category (all questions in category must sum to 100%)"
    )
    help_text = models.TextField(blank=True, help_text="Additional guidance for auditors")
    
    class Meta:
        ordering = ['category', 'order', 'reference_number', 'question_letter']
        verbose_name = "Audit Checklist Question"
        verbose_name_plural = "Audit Checklist Questions"
        unique_together = ['category', 'reference_number', 'question_letter']
    
    def __str__(self):
        return f"{self.reference_number}{self.question_letter}) {self.question_text[:50]}"
    
    @property
    def full_reference(self):
        """Get full reference like '1.1a'"""
        return f"{self.reference_number}{self.question_letter}"


# =============================
# ISO 45001:2018 Clause Structure
# =============================
class ISOClause45001(models.Model):
    """ISO 45001:2018 clause structure for audit alignment."""
    
    clause_number = models.CharField(max_length=10, unique=True, help_text="e.g., 4.1, 8.1.2")
    title = models.CharField(max_length=255)
    description = models.TextField()
    parent_clause = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='sub_clauses'
    )
    requirements = models.JSONField(
        default=list, 
        help_text="List of specific requirements for this clause"
    )
    is_mandatory = models.BooleanField(default=True)
    risk_category = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Low'),
            ('MEDIUM', 'Medium'),
            ('HIGH', 'High'),
            ('CRITICAL', 'Critical'),
        ],
        default='MEDIUM'
    )
    guidance_notes = models.TextField(blank=True, help_text="Audit guidance for this clause")
    
    class Meta:
        ordering = ['clause_number']
        verbose_name = "ISO 45001:2018 Clause"
        verbose_name_plural = "ISO 45001:2018 Clauses"
    
    def __str__(self):
        return f"{self.clause_number} - {self.title}"
    
    def get_full_path(self):
        """Get the full clause path (e.g., 4 > 4.1 > 4.1.1)."""
        if self.parent_clause:
            return f"{self.parent_clause.get_full_path()} > {self.clause_number}"
        return self.clause_number


# =============================
# Audit Planning
# =============================
class AuditPlan(models.Model):
    """Master audit plan record."""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('REPORT_PENDING', 'Report Pending'),
        ('CLOSED', 'Closed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audit_code = models.CharField(max_length=50, unique=True, editable=False)
    title = models.CharField(max_length=255)
    audit_type = models.ForeignKey(AuditType, on_delete=models.PROTECT, related_name='audits', help_text="Type of audit")
    
    # Scope
    scope_description = models.TextField(blank=True, help_text="Detailed audit scope")
    departments = models.JSONField(default=list, blank=True, help_text="List of departments to audit")
    processes = models.JSONField(default=list, blank=True, help_text="List of processes to audit")
    locations = models.JSONField(default=list, blank=True, help_text="Physical locations to audit")
    iso_clauses = models.ManyToManyField(ISOClause45001, related_name='audits')
    
    # Schedule
    planned_start_date = models.DateField()
    planned_end_date = models.DateField()
    actual_start_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    
    # Team
    lead_auditor = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='audits_led'
    )
    audit_team = models.ManyToManyField(User, related_name='audits_participated', blank=True)
    
    # Objectives & Methodology
    objectives = models.JSONField(
        default=list, 
        blank=True,
        help_text="List of audit objectives"
    )
    methodology = models.JSONField(
        default=dict,
        blank=True,
        help_text="Audit methodology: interviews, document review, observations, etc."
    )
    audit_criteria = models.TextField(
        blank=True,
        help_text="Standards, regulations, procedures against which audit is conducted"
    )
    
    # Status & Workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    # Meta
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='audits_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='audits_approved'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        permissions = [
            ('can_manage_audits', 'Can manage audit plans'),
            ('can_execute_audits', 'Can execute audits'),
            ('can_close_audits', 'Can close audits'),
        ]
    
    def __str__(self):
        return f"{self.audit_code} - {self.title}"
    
    def save(self, *args, **kwargs):
        """Generate audit code on creation."""
        if not self.audit_code:
            self.audit_code = self.generate_audit_code()
        super().save(*args, **kwargs)
    
    def generate_audit_code(self):
        """Generate unique audit code: AUD-YYYY-XXXX."""
        from datetime import datetime
        current_year = datetime.now().year
        
        last_audit = AuditPlan.objects.filter(
            audit_code__startswith=f'AUD-{current_year}-'
        ).order_by('-audit_code').first()
        
        if last_audit:
            try:
                last_number = int(last_audit.audit_code.split('-')[-1])
                new_number = last_number + 1
            except (ValueError, IndexError):
                new_number = 1
        else:
            new_number = 1
        
        return f'AUD-{current_year}-{new_number:04d}'
    
    @property
    def is_overdue(self):
        """Check if audit is overdue."""
        if self.status in ['COMPLETED', 'CLOSED']:
            return False
        return date.today() > self.planned_end_date
    
    @property
    def days_until_start(self):
        """Calculate days until audit starts."""
        return (self.planned_start_date - date.today()).days
    
    @property
    def duration_days(self):
        """Calculate planned audit duration."""
        return (self.planned_end_date - self.planned_start_date).days + 1


# =============================
# Audit Checklist
# =============================
class AuditChecklist(models.Model):
    """Audit checklist items/questions."""
    
    QUESTION_TYPE_CHOICES = [
        ('YES_NO', 'Yes/No'),
        ('RATING', 'Rating (1-5)'),
        ('TEXT', 'Text Response'),
        ('NUMERIC', 'Numeric Value'),
        ('CONFORMITY', 'Conformity Assessment'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audit_plan = models.ForeignKey(AuditPlan, on_delete=models.CASCADE, related_name='checklist_items')
    iso_clause = models.ForeignKey(ISOClause45001, on_delete=models.CASCADE, related_name='checklist_items')
    
    sequence_order = models.PositiveIntegerField(default=1)
    question_text = models.TextField()
    expected_evidence = models.TextField(help_text="What evidence should be present?")
    audit_criteria = models.TextField(help_text="What to check against")
    
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='CONFORMITY')
    is_mandatory = models.BooleanField(default=True)
    weight = models.PositiveIntegerField(
        default=1, 
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Importance weight for scoring (1-5)"
    )
    
    # Custom fields for flexibility
    custom_fields = models.JSONField(
        default=dict,
        help_text="Additional custom fields defined by user"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['audit_plan', 'sequence_order']
        unique_together = ['audit_plan', 'sequence_order']
    
    def __str__(self):
        return f"{self.audit_plan.audit_code} - Q{self.sequence_order}: {self.question_text[:50]}"


# =============================
# Audit Execution
# =============================
class AuditChecklistResponse(models.Model):
    """Responses to audit checklist items during execution."""
    
    CONFORMITY_CHOICES = [
        ('CONFORMING', 'Conforming'),
        ('MINOR_NC', 'Minor Non-Conformity'),
        ('MAJOR_NC', 'Major Non-Conformity'),
        ('OBSERVATION', 'Observation'),
        ('OPPORTUNITY', 'Opportunity for Improvement'),
        ('N_A', 'Not Applicable'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    checklist_item = models.ForeignKey(
        AuditChecklist, 
        on_delete=models.CASCADE, 
        related_name='responses'
    )
    auditor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_responses')
    
    # Response data
    response_value = models.JSONField(
        help_text="Flexible format for different question types"
    )
    conformity_status = models.CharField(max_length=20, choices=CONFORMITY_CHOICES)
    
    # Evidence & Context
    evidence_description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    interviewed_person = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='interviews_received'
    )
    location_audited = models.CharField(max_length=255, blank=True)
    
    # Timestamp
    response_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['checklist_item__sequence_order']
    
    def __str__(self):
        return f"Response to {self.checklist_item.sequence_order} - {self.conformity_status}"


# =============================
# Findings & Non-Conformities
# =============================
class AuditFinding(models.Model):
    """Audit findings, non-conformities, and observations."""
    
    FINDING_TYPE_CHOICES = [
        ('MAJOR_NC', 'Major Non-Conformity'),
        ('MINOR_NC', 'Minor Non-Conformity'),
        ('OBSERVATION', 'Observation'),
        ('OPPORTUNITY', 'Opportunity for Improvement'),
    ]
    
    SEVERITY_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('LOW', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('CAPA_ASSIGNED', 'CAPA Assigned'),
        ('IN_PROGRESS', 'In Progress'),
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('CLOSED', 'Closed'),
    ]
    
    IMPACT_CHOICES = [
        ('SAFETY', 'Safety'),
        ('LEGAL', 'Legal/Compliance'),
        ('OPERATIONAL', 'Operational'),
        ('FINANCIAL', 'Financial'),
        ('REPUTATIONAL', 'Reputational'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    finding_code = models.CharField(max_length=50, unique=True, editable=False)
    
    # Audit context
    audit_plan = models.ForeignKey(AuditPlan, on_delete=models.CASCADE, related_name='findings')
    iso_clause = models.ForeignKey(ISOClause45001, on_delete=models.CASCADE, related_name='findings')
    checklist_response = models.ForeignKey(
        AuditChecklistResponse, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='findings'
    )
    
    # Finding details
    finding_type = models.CharField(max_length=20, choices=FINDING_TYPE_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Detailed description of the finding")
    
    # Root cause analysis
    root_cause_analysis = models.JSONField(
        default=dict,
        help_text="5-Why analysis, Fishbone diagram data, etc."
    )
    
    # Impact
    impact_assessment = models.CharField(
        max_length=20, 
        choices=IMPACT_CHOICES,
        help_text="Primary impact area"
    )
    risk_level = models.IntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Risk level (1-10)"
    )
    
    # Location
    department_affected = models.CharField(max_length=100)
    process_affected = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    
    # Identification
    identified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='findings_identified'
    )
    identified_date = models.DateField(default=date.today)
    
    # Audit session details
    audit_date = models.DateField(
        null=True, 
        blank=True,
        help_text="Date when the audit was conducted"
    )
    attendees = models.JSONField(
        default=list,
        blank=True,
        help_text="List of attendee names present during audit"
    )
    
    # Checklist responses (if finding is based on checklist)
    checklist_responses = models.JSONField(
        default=dict,
        blank=True,
        help_text="Responses to checklist questions"
    )
    
    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='OPEN')
    requires_immediate_action = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-identified_date', '-severity']
        permissions = [
            ('can_create_findings', 'Can create audit findings'),
            ('can_close_findings', 'Can close audit findings'),
        ]
    
    def __str__(self):
        return f"{self.finding_code} - {self.title}"
    
    def save(self, *args, **kwargs):
        """Generate finding code on creation."""
        if not self.finding_code:
            self.finding_code = self.generate_finding_code()
        super().save(*args, **kwargs)
    
    def generate_finding_code(self):
        """Generate unique finding code based on type."""
        from datetime import datetime
        current_year = datetime.now().year
        
        # Prefix based on finding type
        prefix_map = {
            'MAJOR_NC': 'MNC',
            'MINOR_NC': 'mnc',
            'OBSERVATION': 'OBS',
            'OPPORTUNITY': 'OFI',
        }
        prefix = prefix_map.get(self.finding_type, 'FND')
        
        last_finding = AuditFinding.objects.filter(
            finding_code__startswith=f'{prefix}-{current_year}-'
        ).order_by('-finding_code').first()
        
        if last_finding:
            try:
                last_number = int(last_finding.finding_code.split('-')[-1])
                new_number = last_number + 1
            except (ValueError, IndexError):
                new_number = 1
        else:
            new_number = 1
        
        return f'{prefix}-{current_year}-{new_number:04d}'
    
    @property
    def has_capa(self):
        """Check if finding has assigned CAPA."""
        return self.capas.exists()
    
    @property
    def all_capas_closed(self):
        """Check if all CAPAs are closed."""
        return self.capas.filter(status='CLOSED').count() == self.capas.count()
    
    def calculate_overall_score(self):
        """Calculate overall audit score based on category scores and weights."""
        from decimal import Decimal
        from audits.models import AuditChecklistCategory
        
        # Get template from audit plan
        template = self.audit_plan.audit_type.checklist_templates.filter(is_active=True).first()
        if not template:
            return None
        
        categories = template.categories.all()
        total_category_weight = sum(c.weight for c in categories)
        
        if total_category_weight == 0:
            return None
        
        weighted_score = Decimal('0')
        category_scores = {}
        
        for category in categories:
            category_score = category.calculate_score(self)
            category_scores[category.id] = {
                'name': category.category_name,
                'score': float(category_score),
                'weight': float(category.weight),
                'weighted_contribution': float((category_score * category.weight) / 100)
            }
            weighted_score += (category_score * category.weight) / 100
        
        return {
            'overall_score': float(weighted_score),
            'grade': self.get_grade(weighted_score),
            'color': self.get_score_color(weighted_score),
            'category_scores': category_scores,
            'total_questions_answered': self.question_responses.count(),
        }
    
    @staticmethod
    def get_grade(score):
        """Get grade based on score."""
        from decimal import Decimal
        
        if score >= Decimal('80'):
            return 'DISTINCTION'
        elif score >= Decimal('50'):
            return 'PASS'
        else:
            return 'FAIL'
    
    @staticmethod
    def get_score_color(score):
        """Get color code based on score."""
        from decimal import Decimal
        
        if score >= Decimal('80'):
            return 'GREEN'
        elif score >= Decimal('50'):
            return 'AMBER'
        else:
            return 'RED'


# =============================
# Audit Question Responses
# =============================
class AuditQuestionResponse(models.Model):
    """Responses to individual checklist questions during audit."""
    
    COMPLIANCE_STATUS_CHOICES = [
        ('COMPLIANT', 'Compliant'),
        ('NON_COMPLIANT', 'Non-Compliant'),
        ('OBSERVATION', 'Observation'),
        ('NOT_APPLICABLE', 'Not Applicable'),
        ('OPPORTUNITY', 'Opportunity for Improvement'),
    ]
    
    finding = models.ForeignKey(
        AuditFinding, 
        on_delete=models.CASCADE, 
        related_name='question_responses'
    )
    question = models.ForeignKey(
        AuditChecklistQuestion, 
        on_delete=models.CASCADE, 
        related_name='responses'
    )
    answer_text = models.TextField(blank=True, help_text="Answer to the question")
    compliance_status = models.CharField(
        max_length=20, 
        choices=COMPLIANCE_STATUS_CHOICES,
        default='COMPLIANT'
    )
    notes = models.TextField(blank=True, help_text="Additional notes or observations")
    evidence_files = models.JSONField(
        default=list,
        blank=True,
        help_text="List of evidence file URLs/paths"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['question__order']
        unique_together = ['finding', 'question']
        verbose_name = "Audit Question Response"
        verbose_name_plural = "Audit Question Responses"
    
    def __str__(self):
        return f"{self.finding.finding_code} - {self.question.full_reference}"


# =============================
# CAPA (Corrective & Preventive Actions)
# =============================
class CAPA(models.Model):
    """Corrective and Preventive Actions."""
    
    ACTION_TYPE_CHOICES = [
        ('CORRECTIVE', 'Corrective Action'),
        ('PREVENTIVE', 'Preventive Action'),
        ('BOTH', 'Both Corrective & Preventive'),
    ]
    
    PRIORITY_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('LOW', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('ASSIGNED', 'Assigned'),
        ('ACKNOWLEDGED', 'Acknowledged'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
        ('CLOSED', 'Closed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action_code = models.CharField(max_length=50, unique=True, editable=False)
    
    # Related finding
    finding = models.ForeignKey(AuditFinding, on_delete=models.CASCADE, related_name='capas')
    
    # Action details
    action_type = models.CharField(max_length=20, choices=ACTION_TYPE_CHOICES, default='CORRECTIVE')
    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Detailed action description")
    root_cause = models.TextField(help_text="Root cause from finding")
    action_plan = models.TextField(help_text="Step-by-step action plan")
    
    # Assignment
    responsible_person = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='capas_responsible'
    )
    assigned_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='capas_assigned'
    )
    assigned_date = models.DateField(auto_now_add=True)
    acknowledged_date = models.DateField(null=True, blank=True)
    
    # Timeline
    target_completion_date = models.DateField()
    actual_completion_date = models.DateField(null=True, blank=True)
    
    # Priority & Status
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='ASSIGNED')
    
    # Resources
    resources_required = models.TextField(blank=True, help_text="Resources needed for implementation")
    cost_estimate = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Estimated cost of implementation"
    )
    
    # Verification
    effectiveness_criteria = models.TextField(
        help_text="How will effectiveness be measured?"
    )
    verification_method = models.CharField(
        max_length=100,
        choices=[
            ('RE_AUDIT', 'Re-audit'),
            ('INSPECTION', 'Inspection'),
            ('DOCUMENT_REVIEW', 'Document Review'),
            ('OBSERVATION', 'Observation'),
            ('INTERVIEW', 'Interview'),
        ],
        default='RE_AUDIT'
    )
    verification_date = models.DateField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='capas_verified'
    )
    verification_notes = models.TextField(blank=True)
    is_effective = models.BooleanField(null=True, blank=True, help_text="Was the CAPA effective?")
    
    # Extension tracking
    extension_requests = models.JSONField(
        default=list,
        help_text="History of extension requests and approvals"
    )
    
    # Progress tracking
    progress_percentage = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    progress_notes = models.TextField(blank=True)
    last_progress_update = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['target_completion_date', '-priority']
        verbose_name = "CAPA"
        verbose_name_plural = "CAPAs"
    
    def __str__(self):
        return f"{self.action_code} - {self.title}"
    
    def save(self, *args, **kwargs):
        """Generate CAPA code on creation."""
        if not self.action_code:
            self.action_code = self.generate_capa_code()
        super().save(*args, **kwargs)
    
    def generate_capa_code(self):
        """Generate unique CAPA code: CAPA-YYYY-XXXX."""
        from datetime import datetime
        current_year = datetime.now().year
        
        last_capa = CAPA.objects.filter(
            action_code__startswith=f'CAPA-{current_year}-'
        ).order_by('-action_code').first()
        
        if last_capa:
            try:
                last_number = int(last_capa.action_code.split('-')[-1])
                new_number = last_number + 1
            except (ValueError, IndexError):
                new_number = 1
        else:
            new_number = 1
        
        return f'CAPA-{current_year}-{new_number:04d}'
    
    @property
    def is_overdue(self):
        """Check if CAPA is overdue."""
        if self.status in ['COMPLETED', 'VERIFIED', 'CLOSED']:
            return False
        return date.today() > self.target_completion_date
    
    @property
    def days_overdue(self):
        """Calculate days overdue."""
        if not self.is_overdue:
            return 0
        return (date.today() - self.target_completion_date).days
    
    @property
    def days_remaining(self):
        """Calculate days remaining until deadline."""
        return (self.target_completion_date - date.today()).days
    
    def request_extension(self, new_date, reason, requested_by):
        """Request deadline extension."""
        extension = {
            'requested_date': timezone.now().isoformat(),
            'requested_by': requested_by.email,
            'current_deadline': self.target_completion_date.isoformat(),
            'new_deadline': new_date.isoformat(),
            'reason': reason,
            'status': 'PENDING'
        }
        
        if not self.extension_requests:
            self.extension_requests = []
        self.extension_requests.append(extension)
        self.save()


# =============================
# Audit Evidence
# =============================
class AuditEvidence(models.Model):
    """Evidence files (photos, documents, videos) attached to audits."""
    
    FILE_TYPE_CHOICES = [
        ('PHOTO', 'Photo'),
        ('DOCUMENT', 'Document'),
        ('VIDEO', 'Video'),
        ('AUDIO', 'Audio Recording'),
        ('CHECKLIST', 'Completed Checklist'),
        ('OTHER', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    file = models.FileField(upload_to='audit_evidence/%Y/%m/')
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, default='PHOTO')
    file_size = models.PositiveIntegerField(help_text="File size in bytes", editable=False, null=True)
    
    # Relationships (flexible - can be linked to multiple entities)
    audit_plan = models.ForeignKey(
        AuditPlan, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='evidence'
    )
    finding = models.ForeignKey(
        AuditFinding, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='evidence'
    )
    capa = models.ForeignKey(
        CAPA, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='evidence'
    )
    checklist_response = models.ForeignKey(
        AuditChecklistResponse, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='evidence'
    )
    
    # Metadata
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_evidence_uploaded')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_confidential = models.BooleanField(default=False)
    
    # Tags for organization
    tags = models.JSONField(default=list, help_text="Tags for categorization")
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Audit Evidence"
        verbose_name_plural = "Audit Evidence"
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Calculate file size on save."""
        if self.file and not self.file_size:
            self.file_size = self.file.size
        super().save(*args, **kwargs)


# =============================
# Audit Report
# =============================
class AuditReport(models.Model):
    """Final audit report with findings summary and recommendations."""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted for Review'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
        ('PUBLISHED', 'Published'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audit_plan = models.OneToOneField(AuditPlan, on_delete=models.CASCADE, related_name='report')
    report_code = models.CharField(max_length=50, unique=True, editable=False)
    
    # Report content
    executive_summary = models.TextField(help_text="High-level summary for management")
    audit_scope_actual = models.TextField(help_text="Actual scope covered (may differ from planned)")
    methodology_used = models.TextField()
    
    # Findings summary
    key_findings_summary = models.JSONField(
        default=list,
        help_text="Summary of key findings"
    )
    strengths_identified = models.JSONField(
        default=list,
        help_text="Areas of strength identified during audit"
    )
    areas_for_improvement = models.JSONField(
        default=list,
        help_text="Areas needing improvement"
    )
    
    # Scoring
    overall_conformity_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Overall conformity score (0-100%)"
    )
    conformity_by_clause = models.JSONField(
        default=dict,
        help_text="Conformity scores broken down by ISO clause"
    )
    
    # Statistics
    major_ncs_count = models.PositiveIntegerField(default=0)
    minor_ncs_count = models.PositiveIntegerField(default=0)
    observations_count = models.PositiveIntegerField(default=0)
    opportunities_count = models.PositiveIntegerField(default=0)
    
    # Recommendations
    recommendations = models.TextField()
    conclusion = models.TextField()
    next_audit_recommendation_date = models.DateField(
        null=True, 
        blank=True,
        help_text="Recommended date for next audit"
    )
    
    # Workflow
    report_date = models.DateField(default=date.today)
    prepared_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='audit_reports_prepared'
    )
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='audit_reports_reviewed'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='audit_reports_approved'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    # Generated files
    pdf_report = models.FileField(upload_to='audit_reports/%Y/%m/', null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-report_date']
    
    def __str__(self):
        return f"{self.report_code} - {self.audit_plan.title}"
    
    def save(self, *args, **kwargs):
        """Generate report code and calculate statistics on save."""
        if not self.report_code:
            self.report_code = self.generate_report_code()
        
        # Auto-calculate finding counts from audit plan
        if self.audit_plan_id:
            findings = self.audit_plan.findings.all()
            self.major_ncs_count = findings.filter(finding_type='MAJOR_NC').count()
            self.minor_ncs_count = findings.filter(finding_type='MINOR_NC').count()
            self.observations_count = findings.filter(finding_type='OBSERVATION').count()
            self.opportunities_count = findings.filter(finding_type='OPPORTUNITY').count()
        
        super().save(*args, **kwargs)
    
    def generate_report_code(self):
        """Generate unique report code: REP-YYYY-XXXX."""
        from datetime import datetime
        current_year = datetime.now().year
        
        last_report = AuditReport.objects.filter(
            report_code__startswith=f'REP-{current_year}-'
        ).order_by('-report_code').first()
        
        if last_report:
            try:
                last_number = int(last_report.report_code.split('-')[-1])
                new_number = last_number + 1
            except (ValueError, IndexError):
                new_number = 1
        else:
            new_number = 1
        
        return f'REP-{current_year}-{new_number:04d}'
    
    @property
    def total_findings(self):
        """Total number of all findings."""
        return self.major_ncs_count + self.minor_ncs_count + self.observations_count + self.opportunities_count


# =============================
# CAPA Progress Updates
# =============================
class CAPAProgressUpdate(models.Model):
    """Track progress updates on CAPAs."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    capa = models.ForeignKey(CAPA, on_delete=models.CASCADE, related_name='progress_updates')
    
    update_text = models.TextField()
    progress_percentage = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    challenges_faced = models.TextField(blank=True)
    next_steps = models.TextField(blank=True)
    
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='capa_updates_made')
    update_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-update_date']
    
    def __str__(self):
        return f"{self.capa.action_code} - {self.progress_percentage}% - {self.update_date.date()}"


# =============================
# Audit Meeting Minutes
# =============================
class AuditMeeting(models.Model):
    """Opening and closing meeting records."""
    
    MEETING_TYPE_CHOICES = [
        ('OPENING', 'Opening Meeting'),
        ('CLOSING', 'Closing Meeting'),
        ('PROGRESS', 'Progress Meeting'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audit_plan = models.ForeignKey(AuditPlan, on_delete=models.CASCADE, related_name='meetings')
    
    meeting_type = models.CharField(max_length=20, choices=MEETING_TYPE_CHOICES)
    meeting_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(help_text="Meeting duration in minutes")
    location = models.CharField(max_length=255)
    
    # Attendees
    attendees = models.ManyToManyField(User, related_name='audit_meetings_attended')
    chairperson = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='audit_meetings_chaired'
    )
    
    # Minutes
    agenda = models.JSONField(default=list, help_text="Meeting agenda items")
    minutes = models.TextField(help_text="Meeting minutes/notes")
    action_items = models.JSONField(default=list, help_text="Action items from meeting")
    
    # Attachments
    presentation_file = models.FileField(upload_to='audit_meetings/', null=True, blank=True)
    minutes_file = models.FileField(upload_to='audit_meetings/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['meeting_date']
    
    def __str__(self):
        return f"{self.audit_plan.audit_code} - {self.meeting_type} - {self.meeting_date.date()}"


# =============================
# Audit Comments (for collaboration)
# =============================
class AuditComment(models.Model):
    """Comments on findings, CAPAs, or audit plans for collaboration."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Flexible linking
    audit_plan = models.ForeignKey(
        AuditPlan, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='comments'
    )
    finding = models.ForeignKey(
        AuditFinding, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='comments'
    )
    capa = models.ForeignKey(
        CAPA, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='comments'
    )
    
    comment_text = models.TextField()
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_comments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Threading support
    parent_comment = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author} on {self.created_at.date()}"


# =============================
# Company Settings
# =============================
class CompanySettings(models.Model):
    """Company settings for audit reports (e.g., logo, company name)."""
    
    company_name = models.CharField(max_length=255, default="SafeSphere")
    company_logo = models.ImageField(
        upload_to='company_logos/',
        null=True,
        blank=True,
        help_text="Company logo for audit reports (recommended: 200x80 pixels)"
    )
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='company_settings_updates'
    )
    
    class Meta:
        verbose_name = "Company Settings"
        verbose_name_plural = "Company Settings"
    
    def __str__(self):
        return f"{self.company_name} Settings"
    
    def save(self, *args, **kwargs):
        # Ensure only one settings instance exists
        if not self.pk and CompanySettings.objects.exists():
            raise ValueError("Company Settings already exists. Please update the existing record.")
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create company settings."""
        settings, created = cls.objects.get_or_create(id=1)
        return settings
