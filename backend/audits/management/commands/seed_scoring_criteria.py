"""
Management command to seed audit scoring criteria with industry standards.
"""
from django.core.management.base import BaseCommand
from audits.models import AuditScoringCriteria
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seeds audit scoring criteria with ISO 45001 industry standards'

    def handle(self, *args, **kwargs):
        criteria_data = [
            {
                'finding_type': 'COMPLIANT',
                'display_name': 'Compliant (C)',
                'color_code': 'GREEN',
                'score_percentage': Decimal('100.00'),
                'definition': """
FULL CONFORMITY: The organization has fully implemented the requirement and provides 
objective evidence of conformity. All aspects of the requirement are being met 
consistently. No gaps or deficiencies identified.

ISO 45001 Context: The organization demonstrates full compliance with the relevant 
clause requirements. Evidence shows systematic implementation, monitoring, and 
maintenance of the requirement.
                """.strip(),
                'action_required': """
ACTION REQUIRED:
• Continue current practices
• Maintain evidence and records
• Monitor for continued conformity
• Share as best practice example
• No corrective action needed

TIMELINE: N/A (Maintain ongoing compliance)
                """.strip(),
                'examples': """
Examples:
• Complete training records with evidence of competency verification
• Documented and implemented emergency procedures with drill records
• Risk assessments current, reviewed, and controlled
• Policy documents available, communicated, and understood
                """.strip(),
            },
            {
                'finding_type': 'OFI',
                'display_name': 'Opportunity for Improvement (OFI)',
                'color_code': 'YELLOW',
                'score_percentage': Decimal('90.00'),
                'definition': """
SUGGESTION FOR ENHANCEMENT: An observation of a practice that, while conforming 
to requirements, could be improved to enhance effectiveness, efficiency, or 
integration with other processes. Not a non-conformity but represents potential 
for better performance.

ISO 45001 Context: The requirement is being met, but there are opportunities to 
improve the effectiveness of the OH&S management system or enhance the maturity 
of implementation.
                """.strip(),
                'action_required': """
ACTION REQUIRED:
• Consider for inclusion in improvement plans
• Evaluate cost-benefit of implementation
• No mandatory timeline (discretionary)
• Document decision to implement or not
• Optional tracking in improvement register

TIMELINE: As per organization's improvement schedule (typically 6-12 months)
                """.strip(),
                'examples': """
Examples:
• Training effective but could benefit from e-learning platform
• Incident reporting system works but could be streamlined
• Documentation adequate but could be digitized for better access
• Communication effective but could leverage mobile technology
                """.strip(),
            },
            {
                'finding_type': 'MINOR_NC',
                'display_name': 'Minor Non-Conformity (Minor NC)',
                'color_code': 'ORANGE',
                'score_percentage': Decimal('60.00'),
                'definition': """
ISOLATED FAILURE: A non-conformity that is judged to be an isolated lapse or 
one-off failure to meet a requirement. Does not indicate a systemic failure of 
the management system. The requirement is generally being met, but evidence shows 
a single deviation or gap.

ISO 45001 Context: A single or random failure that doesn't affect the overall 
capability of the OH&S management system to achieve intended outcomes. The system 
is generally effective but has specific gaps.
                """.strip(),
                'action_required': """
ACTION REQUIRED:
• Investigate root cause
• Implement immediate correction
• Develop and implement corrective action (CAPA)
• Provide evidence of correction within 30 days
• Verify effectiveness of corrective action
• Update procedures if needed
• Communicate to relevant personnel

TIMELINE: 
• Immediate correction: Within 7 days
• CAPA implementation: Within 30 days
• Effectiveness verification: Within 60 days
                """.strip(),
                'examples': """
Examples:
• Single employee missing required training certificate
• One piece of equipment missing inspection sticker
• Isolated instance of incomplete hazard identification
• Single document not reviewed on schedule
• One area where PPE not readily available
• Individual record not up to date
                """.strip(),
            },
            {
                'finding_type': 'MAJOR_NC',
                'display_name': 'Major Non-Conformity (Major NC)',
                'color_code': 'RED',
                'score_percentage': Decimal('0.00'),
                'definition': """
SYSTEMIC FAILURE: A non-conformity that indicates a breakdown or absence of a 
systematic approach to meeting a requirement. Affects the overall capability of 
the management system. Either:
1. Complete absence of required process/control
2. Multiple related minor non-conformities indicating systemic failure
3. Situation that presents immediate significant risk

ISO 45001 Context: The requirement is not being met in a way that fundamentally 
affects the OH&S management system's ability to achieve its intended outcomes and 
ensure worker safety.
                """.strip(),
                'action_required': """
ACTION REQUIRED:
• IMMEDIATE containment action (stop work if safety risk)
• Urgent investigation of root cause
• Develop comprehensive corrective action plan
• Senior management notification and involvement
• Implement systemic corrective actions (CAPA)
• Provide evidence of correction within 14 days
• Management review of systemic issues
• Possible suspension of operations in affected area
• Mandatory follow-up audit
• May affect certification status

TIMELINE:
• Immediate containment: Within 24 hours
• Investigation completion: Within 7 days
• CAPA plan submission: Within 14 days
• CAPA implementation: Within 60-90 days
• Effectiveness verification: Within 120 days
• Follow-up audit: Within 6 months
                """.strip(),
                'examples': """
Examples:
• No hazard identification process exists
• Complete absence of required training program
• Multiple employees across different areas lack required competency
• No emergency response procedures in place
• Systemic failure to conduct required inspections
• No process for legal compliance identification
• Management review not conducted (systemic gap)
• No documented OH&S policy
• Widespread non-use of required PPE with no controls
                """.strip(),
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for criteria in criteria_data:
            obj, created = AuditScoringCriteria.objects.update_or_create(
                finding_type=criteria['finding_type'],
                defaults={
                    'display_name': criteria['display_name'],
                    'color_code': criteria['color_code'],
                    'score_percentage': criteria['score_percentage'],
                    'definition': criteria['definition'],
                    'action_required': criteria['action_required'],
                    'examples': criteria['examples'],
                    'is_active': True,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✅ Created: {obj.display_name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'📝 Updated: {obj.display_name}'))
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Scoring criteria seeded!'
                f'\n   Created: {created_count}'
                f'\n   Updated: {updated_count}'
                f'\n\nScoring System:'
                f'\n   • Compliant (Green): 100% - Full conformity'
                f'\n   • OFI (Yellow): 90% - Suggestion for improvement'
                f'\n   • Minor NC (Orange): 60% - Isolated failure'
                f'\n   • Major NC (Red): 0% - Systemic failure'
                f'\n\nOverall Audit Grades:'
                f'\n   • >80% = GREEN (Pass with Distinction)'
                f'\n   • 50-79% = AMBER (Pass)'
                f'\n   • <50% = RED (Fail)'
            )
        )

