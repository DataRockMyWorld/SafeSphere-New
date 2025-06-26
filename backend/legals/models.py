from django.db import models
from django_countries.fields import CountryField
from django.conf import settings

# Create your models here.

class LawCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class LawResource(models.Model):
    JURISDICTION_CHOICES = [
        ('district', 'District'),
        ('local', 'Local Authority'),
        ('national', 'National'),
        ('industrial', 'Industrial'),
    ]
    title = models.CharField(max_length=255)
    country = CountryField()
    category = models.ForeignKey(LawCategory, on_delete=models.CASCADE, related_name='resources')
    jurisdiction = models.CharField(max_length=20, choices=JURISDICTION_CHOICES)
    is_repealed = models.BooleanField(default=False)
    document = models.FileField(upload_to='law_library/')
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class LawResourceChange(models.Model):
    resource = models.ForeignKey(LawResource, on_delete=models.CASCADE, related_name='changes')
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    change_description = models.TextField()
    changed_at = models.DateTimeField(auto_now_add=True)

class LegalRegisterEntry(models.Model):
    DEPARTMENT_CHOICES = [
        ('OPERATIONS', 'Operations'),
        ('MARKETING', 'Marketing'),
        ('HSSE', 'HSSE'),
        ('FINANCE', 'Finance'),
    ]
    COMPLIANCE_STATUS_CHOICES = [
        ('compliant', 'Compliant'),
        ('non-compliant', 'Non-compliant'),
        ('partial', 'Partial'),
    ]
    title = models.CharField(max_length=255)
    regulatory_requirement = models.TextField()
    owner_department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='OPERATIONS')
    legislation_reference = models.ForeignKey(LawResource, on_delete=models.SET_NULL, null=True, related_name='legal_register_entries')
    last_updated = models.DateTimeField(auto_now=True)
    action = models.TextField(default='No action specified')
    evaluation_compliance = models.TextField()
    compliance_status = models.CharField(max_length=20, choices=COMPLIANCE_STATUS_CHOICES)
    assigned_to = models.ManyToManyField('Position', blank=True, related_name='legal_register_assignments')
    further_actions = models.TextField(blank=True)
    country = CountryField()
    category = models.CharField(max_length=100)
    legal_obligation = models.TextField()
    related_legislation = models.ManyToManyField(LawResource, blank=True, related_name='related_entries')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Position(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self):
        return self.name

class LegalRegisterComment(models.Model):
    entry = models.ForeignKey(LegalRegisterEntry, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class LegalRegisterDocument(models.Model):
    entry = models.ForeignKey(LegalRegisterEntry, on_delete=models.CASCADE, related_name='documents')
    document = models.FileField(upload_to='legal_register/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class LegislationTracker(models.Model):
    STATUS_CHOICES = [
        ('valid', 'Valid'),
        ('expired', 'Expired'),
    ]
    permit = models.CharField(max_length=255)
    issuing_authority = models.CharField(max_length=255)
    license_number = models.CharField(max_length=100)
    unit = models.CharField(max_length=255)
    date_of_issue = models.DateField()
    expiring_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    action_taken = models.TextField()
    evidence = models.FileField(upload_to='legislation_tracker/evidence/', blank=True, null=True)

    @property
    def days_left(self):
        from datetime import date
        return (self.expiring_date - date.today()).days

    def __str__(self):
        return f"{self.permit} ({self.license_number})"
