"""
Management command to seed the 5x5 Risk Matrix with industry-standard definitions.
"""
from django.core.management.base import BaseCommand
from risks.models import RiskMatrixConfig


class Command(BaseCommand):
    help = 'Seed 5x5 Risk Matrix with ISO 31000 & ISO 45001 standard definitions'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Seeding 5×5 Risk Matrix...'))
        
        # Get or create config
        config, created = RiskMatrixConfig.objects.get_or_create(id=1)
        
        # Probability definitions (Industry Standard)
        config.probability_definitions = {
            "1": {
                "label": "Rare",
                "description": "May occur only in exceptional circumstances",
                "frequency": "Less than 10% probability, almost never happens",
                "timeframe": "Once every 10+ years",
                "examples": [
                    "Extremely rare equipment failure",
                    "Natural disaster (earthquake, flood)",
                    "Unprecedented system failure"
                ]
            },
            "2": {
                "label": "Unlikely",
                "description": "Could occur at some time",
                "frequency": "10-30% probability, rarely happens",
                "timeframe": "Once every 2-10 years",
                "examples": [
                    "Rare equipment malfunction",
                    "Unusual weather conditions",
                    "Infrequent human error"
                ]
            },
            "3": {
                "label": "Possible",
                "description": "Might occur at some time",
                "frequency": "30-60% probability, happens sometimes",
                "timeframe": "Once per year",
                "examples": [
                    "Occasional equipment breakdown",
                    "Known hazard with some controls",
                    "Periodic procedural violations"
                ]
            },
            "4": {
                "label": "Likely",
                "description": "Will probably occur in most circumstances",
                "frequency": "60-90% probability, happens often",
                "timeframe": "Several times per year",
                "examples": [
                    "Frequent equipment issues",
                    "Regular procedural non-compliance",
                    "Known hazard with inadequate controls"
                ]
            },
            "5": {
                "label": "Almost Certain",
                "description": "Expected to occur in most circumstances",
                "frequency": "Greater than 90% probability, happens regularly",
                "timeframe": "Multiple times per year or continuously",
                "examples": [
                    "Ongoing exposure to hazard",
                    "Routine procedural violations",
                    "Inadequate or no controls in place"
                ]
            }
        }
        
        # Severity definitions (Industry Standard)
        config.severity_definitions = {
            "1": {
                "label": "Negligible",
                "description": "Minor inconvenience, no injury or impact",
                "safety": "Near miss, no treatment required",
                "health": "No health effects",
                "environmental": "No environmental impact",
                "financial": "< $1,000",
                "examples": [
                    "Minor discomfort",
                    "Near miss incident",
                    "Trivial property damage"
                ]
            },
            "2": {
                "label": "Minor",
                "description": "First aid treatment, minor impact",
                "safety": "First aid injury (cuts, bruises)",
                "health": "Minor health effects, reversible",
                "environmental": "Minor localized impact, easily cleaned",
                "financial": "$1,000 - $10,000",
                "examples": [
                    "First aid injury",
                    "Minor spill (contained)",
                    "Temporary discomfort"
                ]
            },
            "3": {
                "label": "Moderate",
                "description": "Medical treatment required, moderate impact",
                "safety": "Lost Time Injury (LTI), medical treatment",
                "health": "Reversible illness requiring treatment",
                "environmental": "Moderate impact, cleanup required",
                "financial": "$10,000 - $100,000",
                "examples": [
                    "Lost time injury (days away from work)",
                    "Occupational illness (reversible)",
                    "Moderate environmental release"
                ]
            },
            "4": {
                "label": "Major",
                "description": "Serious injury or permanent disability, significant impact",
                "safety": "Permanent partial disability, multiple injuries",
                "health": "Permanent health effects",
                "environmental": "Significant long-term environmental damage",
                "financial": "$100,000 - $1,000,000",
                "examples": [
                    "Permanent partial disability",
                    "Chronic occupational disease",
                    "Major environmental contamination",
                    "Severe property damage"
                ]
            },
            "5": {
                "label": "Catastrophic",
                "description": "Fatality or multiple fatalities, catastrophic impact",
                "safety": "Single or multiple fatalities",
                "health": "Fatal disease, multiple serious illnesses",
                "environmental": "Severe widespread environmental damage",
                "financial": "> $1,000,000",
                "examples": [
                    "Fatality",
                    "Multiple serious injuries",
                    "Major environmental disaster",
                    "Facility destruction",
                    "Regulatory shutdown"
                ]
            }
        }
        
        # Risk tolerance levels
        config.matrix_size = 5
        config.low_threshold = 5        # 1-5: LOW (Green)
        config.medium_threshold = 12    # 6-12: MEDIUM (Orange)
        # 15-25: HIGH/EXTREME (Red)
        
        # Colors (Material Design)
        config.low_risk_color = '#388E3C'      # Green
        config.medium_risk_color = '#F57C00'   # Orange
        config.high_risk_color = '#D32F2F'     # Red
        
        config.save()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Risk Matrix Configuration Seeded Successfully!\n'))
        self.stdout.write(self.style.SUCCESS('Matrix Details:'))
        self.stdout.write(f'  • Matrix Size: {config.matrix_size}×{config.matrix_size}')
        self.stdout.write(f'  • Low Risk: 1-{config.low_threshold} (Green)')
        self.stdout.write(f'  • Medium Risk: {config.low_threshold + 1}-{config.medium_threshold} (Orange)')
        self.stdout.write(f'  • High Risk: {config.medium_threshold + 1}-25 (Red)')
        self.stdout.write(f'  • Probability Levels: {len(config.probability_definitions)}')
        self.stdout.write(f'  • Severity Levels: {len(config.severity_definitions)}')
        self.stdout.write(self.style.SUCCESS('\n5×5 Risk Matrix ready for use! 🎯\n'))

