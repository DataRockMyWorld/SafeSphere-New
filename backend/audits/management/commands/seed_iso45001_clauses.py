"""
Management command to seed ISO 45001:2018 clause structure.
Usage: python manage.py seed_iso45001_clauses
"""
from django.core.management.base import BaseCommand
from audits.models import ISOClause45001


class Command(BaseCommand):
    help = 'Seed ISO 45001:2018 clause structure'
    
    def handle(self, *args, **kwargs):
        """Seed all ISO 45001:2018 clauses."""
        
        clauses_data = [
            # Clause 4: Context of the organization
            {
                'clause_number': '4',
                'title': 'Context of the organization',
                'description': 'Understanding the organization and its context, needs and expectations of workers and other interested parties, and determining the scope of the OH&S management system.',
                'requirements': [
                    'Understand internal and external issues',
                    'Identify interested parties',
                    'Determine scope of OH&S MS',
                    'Establish OH&S management system'
                ],
                'risk_category': 'HIGH',
                'guidance_notes': 'Focus on organizational context, stakeholder needs, and system boundaries.'
            },
            {
                'clause_number': '4.1',
                'title': 'Understanding the organization and its context',
                'description': 'The organization shall determine external and internal issues relevant to its purpose and that affect its ability to achieve intended outcomes.',
                'requirements': ['External issues (legal, regulatory)', 'Internal issues (culture, knowledge)', 'Worker expectations'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Review organizational context, industry, regulations, workforce.'
            },
            {
                'clause_number': '4.2',
                'title': 'Understanding needs and expectations of workers',
                'description': 'Determine interested parties relevant to OH&S MS and their requirements.',
                'requirements': ['Workers and their representatives', 'Legal and regulatory bodies', 'Customers', 'Contractors'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Identify all stakeholders and document their OH&S requirements.'
            },
            {
                'clause_number': '4.3',
                'title': 'Determining scope of OH&S management system',
                'description': 'Establish boundaries and applicability of the OH&S MS.',
                'requirements': ['Define scope boundaries', 'Consider context issues', 'Document scope'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Clear scope definition is critical for system effectiveness.'
            },
            {
                'clause_number': '4.4',
                'title': 'OH&S management system',
                'description': 'Establish, implement, maintain and continually improve OH&S MS.',
                'requirements': ['Processes and interactions', 'Documented information', 'Resource allocation'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Ensure system is established and maintained according to standard.'
            },
            
            # Clause 5: Leadership and worker participation
            {
                'clause_number': '5',
                'title': 'Leadership and worker participation',
                'description': 'Top management commitment, OH&S policy, organizational roles, consultation and participation of workers.',
                'requirements': ['Leadership and commitment', 'OH&S policy', 'Roles and responsibilities', 'Worker consultation'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Leadership commitment is fundamental to system success.'
            },
            {
                'clause_number': '5.1',
                'title': 'Leadership and commitment',
                'description': 'Top management shall demonstrate leadership and commitment to OH&S MS.',
                'requirements': ['Taking accountability', 'Ensuring policy and objectives align', 'Ensuring resources available'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Review evidence of top management involvement.'
            },
            {
                'clause_number': '5.2',
                'title': 'OH&S policy',
                'description': 'Top management shall establish an OH&S policy.',
                'requirements': ['Commitment to safe conditions', 'Commitment to consultation', 'Commitment to legal compliance', 'Framework for objectives'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Policy must be documented, communicated, and available.'
            },
            {
                'clause_number': '5.3',
                'title': 'Organizational roles, responsibilities and authorities',
                'description': 'Top management shall assign responsibilities and authorities for OH&S.',
                'requirements': ['Assign roles', 'Communicate responsibilities', 'Document authorities'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Check role definitions, job descriptions, delegation records.'
            },
            {
                'clause_number': '5.4',
                'title': 'Consultation and participation of workers',
                'description': 'Establish processes for consultation and participation of workers.',
                'requirements': ['Timely access to information', 'Removal of barriers', 'Emphasis on non-managerial workers'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Evidence of worker involvement in OH&S processes.'
            },
            
            # Clause 6: Planning
            {
                'clause_number': '6',
                'title': 'Planning',
                'description': 'Actions to address risks and opportunities, OH&S objectives and planning to achieve them.',
                'requirements': ['Risk assessment', 'Legal requirements', 'Objectives and planning'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Planning is critical for proactive OH&S management.'
            },
            {
                'clause_number': '6.1',
                'title': 'Actions to address risks and opportunities',
                'description': 'Determine risks and opportunities for OH&S MS.',
                'requirements': ['Hazard identification', 'Risk assessment', 'Determine legal requirements', 'Plan actions'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Core OH&S process - must be systematic and comprehensive.'
            },
            {
                'clause_number': '6.1.1',
                'title': 'General',
                'description': 'Plan to address risks/opportunities and integrate actions.',
                'requirements': ['Prevent/reduce undesired effects', 'Achieve continual improvement'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Check integration of risk actions into business processes.'
            },
            {
                'clause_number': '6.1.2',
                'title': 'Hazard identification and risk assessment',
                'description': 'Establish processes for ongoing hazard identification and risk assessment.',
                'requirements': ['Routine and non-routine activities', 'Human behavior', 'Emergency situations', 'Design of workplaces'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Must be proactive, comprehensive, and documented.'
            },
            {
                'clause_number': '6.1.3',
                'title': 'Determination of legal and other requirements',
                'description': 'Establish process to determine applicable legal requirements.',
                'requirements': ['Identify applicable laws', 'Determine how requirements apply', 'Maintain documented information'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Link to legal register. Verify currency of legal knowledge.'
            },
            {
                'clause_number': '6.1.4',
                'title': 'Planning action',
                'description': 'Plan actions to address risks/opportunities and legal requirements.',
                'requirements': ['Integrate actions into processes', 'Evaluate effectiveness'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Check action plans, responsibilities, timelines.'
            },
            {
                'clause_number': '6.2',
                'title': 'OH&S objectives and planning to achieve them',
                'description': 'Establish OH&S objectives and plan to achieve them.',
                'requirements': ['Measurable objectives', 'Action plans', 'Resources', 'Responsibilities', 'Timelines', 'Evaluation methods'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Objectives must be SMART and tracked.'
            },
            
            # Clause 7: Support
            {
                'clause_number': '7',
                'title': 'Support',
                'description': 'Resources, competence, awareness, communication, and documented information.',
                'requirements': ['Resources', 'Competence', 'Awareness', 'Communication', 'Documented information'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Support mechanisms are essential for system effectiveness.'
            },
            {
                'clause_number': '7.1',
                'title': 'Resources',
                'description': 'Determine and provide resources needed for OH&S MS.',
                'requirements': ['Financial resources', 'Human resources', 'Infrastructure', 'Technology'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Verify adequate resource allocation.'
            },
            {
                'clause_number': '7.2',
                'title': 'Competence',
                'description': 'Ensure workers are competent on basis of education, training, experience.',
                'requirements': ['Determine competencies', 'Ensure competence', 'Take actions (training)', 'Retain evidence'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Check training records, competency assessments, qualifications.'
            },
            {
                'clause_number': '7.3',
                'title': 'Awareness',
                'description': 'Workers shall be aware of OH&S policy, objectives, and their contribution.',
                'requirements': ['OH&S policy awareness', 'Incident consequences', 'Ability to remove themselves from danger'],
                'risk_category': 'MEDIUM',
                'guidance_notes': 'Interview workers to verify awareness.'
            },
            {
                'clause_number': '7.4',
                'title': 'Communication',
                'description': 'Establish processes for internal and external communication.',
                'requirements': ['What to communicate', 'When to communicate', 'To whom', 'How to communicate'],
                'risk_category': 'MEDIUM',
                'guidance_notes': 'Review communication procedures, meeting minutes, notices.'
            },
            {
                'clause_number': '7.5',
                'title': 'Documented information',
                'description': 'OH&S MS shall include documented information required by standard.',
                'requirements': ['Create and update', 'Control documented information', 'Distribution and access', 'Retention'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Check document control system, version control, access controls.'
            },
            
            # Clause 8: Operation
            {
                'clause_number': '8',
                'title': 'Operation',
                'description': 'Operational planning and control, emergency preparedness and response.',
                'requirements': ['Operational planning', 'Elimination of hazards', 'Management of change', 'Procurement', 'Contractors', 'Emergency preparedness'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Operational controls are where hazards are managed.'
            },
            {
                'clause_number': '8.1',
                'title': 'Operational planning and control',
                'description': 'Plan, implement and control processes needed to meet requirements.',
                'requirements': ['Eliminate hazards', 'Minimize risks', 'Implement controls', 'Manage change'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Review operational procedures, risk controls, change management.'
            },
            {
                'clause_number': '8.1.1',
                'title': 'General',
                'description': 'Establish criteria for processes and implement control.',
                'requirements': ['Process criteria', 'Implement controls', 'Maintain documented information'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Check operational procedures exist and are followed.'
            },
            {
                'clause_number': '8.1.2',
                'title': 'Eliminating hazards and reducing OH&S risks',
                'description': 'Establish process for elimination of hazards and reduction of OH&S risks.',
                'requirements': ['Hierarchy of controls', 'Eliminate hazards', 'Substitute', 'Engineering controls', 'Administrative controls', 'PPE'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Verify hierarchy of controls is applied systematically.'
            },
            {
                'clause_number': '8.1.3',
                'title': 'Management of change',
                'description': 'Establish process for implementation and control of planned temporary and permanent changes.',
                'requirements': ['Review consequences', 'Ensure risk controls', 'Review change before implementation'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Check MOC procedures, change records, risk assessments.'
            },
            {
                'clause_number': '8.1.4',
                'title': 'Procurement',
                'description': 'Establish process to control procurement of products and services.',
                'requirements': ['Hazard elimination in specifications', 'Define requirements for contractors', 'Consider impacts on organization'],
                'risk_category': 'MEDIUM',
                'guidance_notes': 'Review procurement procedures, supplier OH&S requirements.'
            },
            {
                'clause_number': '8.2',
                'title': 'Emergency preparedness and response',
                'description': 'Establish, implement and maintain processes for emergency preparedness.',
                'requirements': ['Plan emergency response', 'Provide training', 'Test and exercise', 'Evaluate and revise'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Check emergency procedures, training records, drill records.'
            },
            
            # Clause 9: Performance evaluation
            {
                'clause_number': '9',
                'title': 'Performance evaluation',
                'description': 'Monitoring, measurement, analysis, internal audit, and management review.',
                'requirements': ['Monitoring and measurement', 'Internal audit', 'Management review'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Performance evaluation drives improvement.'
            },
            {
                'clause_number': '9.1',
                'title': 'Monitoring, measurement, analysis and evaluation',
                'description': 'Determine what needs to be monitored and measured.',
                'requirements': ['Methods for monitoring', 'Criteria for evaluation', 'When to analyze', 'Calibration requirements'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Check monitoring programs, KPIs, measurement records.'
            },
            {
                'clause_number': '9.2',
                'title': 'Internal audit',
                'description': 'Conduct internal audits at planned intervals.',
                'requirements': ['Audit program', 'Audit criteria', 'Competent auditors', 'Report results', 'Corrective actions'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'This is what you are auditing! Meta-audit check.'
            },
            {
                'clause_number': '9.2.1',
                'title': 'General',
                'description': 'Internal audits shall provide information on OH&S MS conformity.',
                'requirements': ['Plan audit program', 'Define audit criteria', 'Select auditors', 'Ensure objectivity'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Check audit program, schedules, auditor competency.'
            },
            {
                'clause_number': '9.2.2',
                'title': 'Internal audit programme',
                'description': 'Plan, establish, implement and maintain audit programme.',
                'requirements': ['Frequency of audits', 'Methods', 'Responsibilities', 'Reporting requirements', 'Previous audit results'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Verify audit program covers all areas systematically.'
            },
            {
                'clause_number': '9.3',
                'title': 'Management review',
                'description': 'Top management shall review OH&S MS at planned intervals.',
                'requirements': ['Status of previous actions', 'Changes in context', 'Policy and objectives suitability', 'Audit results', 'Performance data', 'Opportunities for improvement'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Check management review meeting records, actions, decisions.'
            },
            
            # Clause 10: Improvement
            {
                'clause_number': '10',
                'title': 'Improvement',
                'description': 'Incident investigation, nonconformity and corrective action, continual improvement.',
                'requirements': ['Incident investigation', 'Nonconformity and corrective action', 'Continual improvement'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Improvement is the heart of the system.'
            },
            {
                'clause_number': '10.1',
                'title': 'General',
                'description': 'Determine opportunities for improvement and implement necessary actions.',
                'requirements': ['Identify improvement opportunities', 'Implement actions'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Check improvement initiatives, kaizen, suggestions.'
            },
            {
                'clause_number': '10.2',
                'title': 'Incident, nonconformity and corrective action',
                'description': 'Establish process to react to incidents and nonconformities.',
                'requirements': ['React promptly', 'Investigate', 'Determine root cause', 'Take corrective action', 'Evaluate effectiveness', 'Update risks'],
                'risk_category': 'CRITICAL',
                'guidance_notes': 'Check incident records, investigations, CAPA effectiveness.'
            },
            {
                'clause_number': '10.3',
                'title': 'Continual improvement',
                'description': 'Continually improve suitability, adequacy and effectiveness of OH&S MS.',
                'requirements': ['Enhance performance', 'Promote culture of improvement', 'Communicate results', 'Maintain evidence'],
                'risk_category': 'HIGH',
                'guidance_notes': 'Look for trends in performance, evidence of systematic improvement.'
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for clause_data in clauses_data:
            clause, created = ISOClause45001.objects.update_or_create(
                clause_number=clause_data['clause_number'],
                defaults={
                    'title': clause_data['title'],
                    'description': clause_data['description'],
                    'requirements': clause_data['requirements'],
                    'risk_category': clause_data['risk_category'],
                    'guidance_notes': clause_data['guidance_notes'],
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {clause.clause_number} - {clause.title}'))
            else:
                updated_count += 1
                self.stdout.write(f'  Updated: {clause.clause_number} - {clause.title}')
        
        # Set parent relationships
        self.stdout.write('\nSetting parent relationships...')
        for clause in ISOClause45001.objects.all():
            # If clause number has a dot, set parent
            if '.' in clause.clause_number:
                parts = clause.clause_number.split('.')
                if len(parts) == 2:
                    # e.g., 4.1 -> parent is 4
                    parent_number = parts[0]
                elif len(parts) == 3:
                    # e.g., 4.1.1 -> parent is 4.1
                    parent_number = f"{parts[0]}.{parts[1]}"
                else:
                    continue
                
                try:
                    parent = ISOClause45001.objects.get(clause_number=parent_number)
                    clause.parent_clause = parent
                    clause.save()
                except ISOClause45001.DoesNotExist:
                    pass
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Seeding complete!'))
        self.stdout.write(self.style.SUCCESS(f'   Created: {created_count}'))
        self.stdout.write(f'   Updated: {updated_count}')
        self.stdout.write(f'   Total: {ISOClause45001.objects.count()} ISO 45001:2018 clauses')

