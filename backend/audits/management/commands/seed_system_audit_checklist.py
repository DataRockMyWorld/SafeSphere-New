"""
Management command to seed System Audit checklist template with categories and questions.
"""
from django.core.management.base import BaseCommand
from audits.models import AuditType, AuditChecklistTemplate, AuditChecklistCategory, AuditChecklistQuestion


class Command(BaseCommand):
    help = 'Seeds the database with System Audit checklist template'

    def handle(self, *args, **kwargs):
        # Get or create System Audit type
        system_audit, _ = AuditType.objects.get_or_create(
            code='SYSTEM',
            defaults={
                'name': 'System Audit',
                'description': 'Comprehensive audit of the entire management system',
                'is_active': True
            }
        )
        
        # Create template
        template, created = AuditChecklistTemplate.objects.get_or_create(
            audit_type=system_audit,
            version='1.0',
            defaults={
                'name': 'System Audit Checklist v1.0',
                'description': 'Comprehensive checklist for system audits covering all HSSE aspects',
                'is_active': True
            }
        )
        
        if not created:
            self.stdout.write(self.style.WARNING('Template already exists. Updating questions...'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Created template: {template.name}'))
        
        # Define all categories and questions
        categories_data = [
            {
                'section_number': 1,
                'category_name': 'Leadership & HSSE Culture',
                'description': 'Assessment of leadership commitment and HSSE culture',
                'order': 1,
                'subsections': [
                    {
                        'name': 'Commitment to HSE aspects through leadership',
                        'ref': '1.1',
                        'questions': [
                            {'letter': 'a', 'text': 'How are senior managers personally involved in HSE management for example objective-setting and monitoring?'},
                            {'letter': 'b', 'text': 'Provide evidence of commitment at all levels of the organisation?'},
                            {'letter': 'c', 'text': 'How do you promote a positive culture towards HSE matters?'},
                        ]
                    }
                ]
            },
            {
                'section_number': 2,
                'category_name': 'HSSE Policy & Strategic Objectives',
                'description': 'Review of HSSE policy documents and strategic objectives',
                'order': 2,
                'subsections': [
                    {
                        'name': 'HSE Policy Documents',
                        'ref': '2.1',
                        'questions': [
                            {'letter': 'a', 'text': 'Does your company have an HSE policy document? If the answer is YES please attach a copy.'},
                            {'letter': 'b', 'text': 'Who has overall and final responsibility for HSE in your organisation?'},
                            {'letter': 'c', 'text': 'Who is the most senior person in the organisation responsible for this policy being carried out at the premises and on site where his employees are working? Provide name and title.'},
                            {'letter': 'd', 'text': 'Itemise the methods by which you have drawn your policy statements to the attention of all your employees?'},
                            {'letter': 'e', 'text': 'What are your arrangements for advising employees of changes in the policy?'},
                        ]
                    },
                    {
                        'name': 'HSE contract strategic objectives',
                        'ref': '2.2',
                        'questions': [
                            {'letter': 'a', 'text': 'Does your company have strategic HSE objectives? If the answer is YES please attach a copy.'},
                            {'letter': 'b', 'text': 'Itemise the methods by which you have communicated your strategic HSE objectives to the attention of all your employees?'},
                        ]
                    }
                ]
            },
            {
                'section_number': 3,
                'category_name': 'Organisation, responsibilities, resources, standards and documentation',
                'description': 'Organizational structure and resource allocation for HSSE',
                'order': 3,
                'subsections': [
                    {
                        'name': 'Organisational structure for HSE management',
                        'ref': '3.1',
                        'questions': [
                            {'letter': 'a', 'text': 'How is your organisation structured to manage and communicate HSE effectively?'},
                            {'letter': 'b', 'text': 'Do HSE meetings promote HSE awareness?'},
                            {'letter': 'c', 'text': 'Do client and contractor meet regularly to discuss and action any interface situations?'},
                            {'letter': 'd', 'text': 'What provision does your company make for HSE communication meetings? Please provide an organisation chart'},
                        ]
                    },
                    {
                        'name': 'HSE training of managers, supervisors and HSE critical positions',
                        'ref': '3.2',
                        'questions': [
                            {'letter': 'a', 'text': 'Have the managers and supervisors at all levels who will plan, monitor, oversee and carry out the work received formal HSE training in their responsibilities with respect to conducting work to HSE requirements?'},
                            {'letter': 'b', 'text': 'If YES please give details. Where the training is given in-house please describe the content and duration of courses. Please provide an example of training matrix.'},
                            {'letter': 'c', 'text': 'How have you identified areas of your company\'s operations where specialised training is required, for instance training related to health hazard such as radiation, asbestos and chemicals?'},
                            {'letter': 'd', 'text': 'What specialist HSE resources does your organisation have available?'},
                            {'letter': 'e', 'text': 'How does your company provide HSE specialised training for HSE staff?'},
                        ]
                    },
                    {
                        'name': 'General HSE training',
                        'ref': '3.3',
                        'questions': [
                            {'letter': 'a', 'text': 'What arrangements does your company have to ensure new employees have knowledge of basic industrial HSE, and to keep this knowledge up to date?'},
                            {'letter': 'b', 'text': 'What arrangements does your company have to ensure new employees also have knowledge of your HSE policies, practices and company requirements?'},
                            {'letter': 'c', 'text': 'What arrangements does your company have to ensure new employees have been instructed and have received information on any specific hazards arising out of the nature of the activities?'},
                        ]
                    },
                    {
                        'name': 'Competence assurance',
                        'ref': '3.4',
                        'questions': [
                            {'letter': 'a', 'text': 'Does your organisation have a competence system in place? If YES, please describe the scope and content of your competence system.'},
                            {'letter': 'b', 'text': 'What arrangements does your company have to ensure existing staff HSE knowledge is up to date?'},
                        ]
                    },
                    {
                        'name': 'Contractor management process',
                        'ref': '3.5',
                        'questions': [
                            {'letter': 'a', 'text': 'Does your company have a contractor management process or system? If yes, provide an outline of the process.'},
                            {'letter': 'b', 'text': 'How do you assess contractors, HSE competence or HSE performance?'},
                            {'letter': 'c', 'text': 'Where do you define the company standards you require your contractors to meet?'},
                            {'letter': 'd', 'text': 'How do you ensure these standards are met and verified?'},
                        ]
                    },
                    {
                        'name': 'HSE standards',
                        'ref': '3.6',
                        'questions': [
                            {'letter': 'a', 'text': 'How do you identify new industry or regulatory standards that may be applicable to your activities?'},
                            {'letter': 'b', 'text': 'Is there an overall structure for producing, updating and disseminating standards?'},
                            {'letter': 'c', 'text': 'Are your company standards aligned with OGP/industry guidelines or recommended practices? If yes state which one.'},
                        ]
                    }
                ]
            },
            {
                'section_number': 4,
                'category_name': 'Risk Management',
                'description': 'Risk assessment and control processes',
                'order': 4,
                'subsections': [
                    {
                        'name': 'Risk Assessment & Control',
                        'ref': '4.1',
                        'questions': [
                            {'letter': 'a', 'text': 'How does your company identify hazards, assess risk, control and mitigation consequences, to a level as low as reasonably practicable?'},
                        ]
                    },
                    {
                        'name': 'Health Hazards',
                        'ref': '4.2',
                        'questions': [
                            {'letter': 'a', 'text': 'Do you have specific policies and programmes on specific health hazards e.g. substance abuse, blood borne pathogens, malaria pandemic diseases etc.'},
                            {'letter': 'b', 'text': 'What type of health hazards (chemical, vibration, noise, radiation, etc) are associated with the scope of your services? Explain how occupational health hazards are identified, assessed and controlled.'},
                            {'letter': 'c', 'text': 'What systems are in place to control these hazards and monitor the effectiveness of these controls? Is worker\'s regular exposure monitoring part of these systems?'},
                        ]
                    },
                    {
                        'name': 'Safety hazards',
                        'ref': '4.3',
                        'questions': [
                            {'letter': 'a', 'text': 'What type of safety hazards (mechanical guarding, work at height, lifting and hoisting, confined space entry, explosive atmospheres etc.) are associated with the scope of your services?'},
                            {'letter': 'b', 'text': 'What systems are in place to control these hazards and monitor the effectiveness of these controls?'},
                        ]
                    },
                    {
                        'name': 'Logistics hazards',
                        'ref': '4.4',
                        'questions': [
                            {'letter': 'a', 'text': 'What type of logistics hazards (land transport, air transport, marine transport, materials handling etc.) are associated with the scope of your services?'},
                            {'letter': 'b', 'text': 'What systems are in place to control these hazards and monitor the effectiveness of these controls?'},
                        ]
                    },
                    {
                        'name': 'Environmental hazards',
                        'ref': '4.5',
                        'questions': [
                            {'letter': 'a', 'text': 'What type of environmental hazards (chemical spill, atmospheric emissions, waste disposal etc.) are associated with the scope of your services?'},
                            {'letter': 'b', 'text': 'What systems are in place to control these hazards and monitor the effectiveness of these controls?'},
                        ]
                    },
                    {
                        'name': 'Security hazards',
                        'ref': '4.6',
                        'questions': [
                            {'letter': 'a', 'text': 'What type of security hazards (terrorism, hostage taking, robbery, hostile local population etc.) are associated with the scope of your services?'},
                            {'letter': 'b', 'text': 'What systems are in place to control these hazards and monitor the effectiveness of these controls?'},
                        ]
                    },
                    {
                        'name': 'Social responsibility hazards',
                        'ref': '4.7',
                        'questions': [
                            {'letter': 'a', 'text': 'What type of social hazards are associated with the scope of your services?'},
                            {'letter': 'b', 'text': 'What systems are in place to control these hazards and impacts and monitor the effectiveness of these controls?'},
                        ]
                    }
                ]
            },
            {
                'section_number': 5,
                'category_name': 'Planning & Procedures',
                'description': 'Operational planning and procedures',
                'order': 5,
                'subsections': [
                    {
                        'name': 'HSE operations manual',
                        'ref': '5.1',
                        'questions': [
                            {'letter': 'a', 'text': 'Do you have a company HSE-MS manual (or operations manual with integrated HSE requirements) which describes in detail your company approved HSE working practices relating to your work activities? If the answer is YES please attach a copy of an index and relevant supporting documentation.'},
                        ]
                    },
                    {
                        'name': 'Infrastructure and equipment integrity',
                        'ref': '5.2',
                        'questions': [
                            {'letter': 'a', 'text': 'How do you ensure that infrastructure, plant and equipment used within your operations (own premises, client site, or at other locations) are correctly certified, registered, controlled and maintained in a safe working condition?'},
                        ]
                    },
                    {
                        'name': 'Management of change',
                        'ref': '5.3',
                        'questions': [
                            {'letter': 'a', 'text': 'How do you manage changes and assess associated risks e.g. personnel, equipment, processes, documentation?'},
                        ]
                    },
                    {
                        'name': 'Emergency planning and response',
                        'ref': '5.4',
                        'questions': [
                            {'letter': 'a', 'text': 'What arrangements does your company have for emergency planning and response?'},
                            {'letter': 'b', 'text': 'Which emergency situations are included?'},
                        ]
                    }
                ]
            },
            {
                'section_number': 6,
                'category_name': 'Implementation and performance monitoring',
                'description': 'Implementation and monitoring of HSSE performance',
                'order': 6,
                'subsections': [
                    {
                        'name': 'HSE-MS implementation and active performance monitoring of work activities',
                        'ref': '6.1',
                        'questions': [
                            {'letter': 'a', 'text': 'What arrangements does your organisation have for monitoring the implementation of your HSE-MS?'},
                            {'letter': 'b', 'text': 'How does your company assure the implementation of work procedures within your work-site operations e.g. compliance with procedures, toolbox talks, safety meetings, supervision, job observations?'},
                            {'letter': 'c', 'text': 'How do you monitor employee HSE performance e.g. hazard identification systems, HSE participation?'},
                            {'letter': 'd', 'text': 'What active HSE monitoring is performed (i.e. where no incident has occurred)?'},
                            {'letter': 'e', 'text': 'How do you report and correct deficiencies identified?'},
                            {'letter': 'f', 'text': 'How do you communicate the results of active performance monitoring to relevant personnel?'},
                        ]
                    },
                    {
                        'name': 'Safety performance indicators',
                        'ref': '6.2',
                        'questions': [
                            {'letter': 'a', 'text': 'See separate spreadsheet'},
                        ]
                    },
                    {
                        'name': 'HSE performance monitoring',
                        'ref': '6.3',
                        'questions': [
                            {'letter': 'a', 'text': 'How is health performance monitored and recorded?'},
                            {'letter': 'b', 'text': 'How is environmental performance monitored and recorded?'},
                            {'letter': 'c', 'text': 'How is security performance monitored and recorded?'},
                            {'letter': 'd', 'text': 'How and what near miss incidents are reported?'},
                            {'letter': 'e', 'text': 'How often is HSE performance reviewed? By whom?'},
                            {'letter': 'f', 'text': 'How is logistics performance monitored and reported?'},
                            {'letter': 'g', 'text': 'Do you record vehicle incidents?'},
                        ]
                    },
                    {
                        'name': 'HSE incident and investigation follow-up',
                        'ref': '6.4',
                        'questions': [
                            {'letter': 'a', 'text': 'What types of HSE incident are investigated?'},
                            {'letter': 'b', 'text': 'What process is used to investigate HSE incidents?'},
                            {'letter': 'c', 'text': 'Who conducts HSE incident investigations?'},
                            {'letter': 'd', 'text': 'How are the findings of an incident investigation followed up to ensure effective prevention of recurrence?'},
                            {'letter': 'e', 'text': 'How is incident learning communicated to all relevant personnel?'},
                        ]
                    },
                    {
                        'name': 'Statutory notifiable incidents or non compliance notices',
                        'ref': '6.5',
                        'questions': [
                            {'letter': 'a', 'text': 'Has your company suffered any statutory notifiable incidents in the last five years (safety, occupational health and environmental)? Answers with details including dates, country and location, summary of incident and follow-up preventative measures taken.'},
                        ]
                    }
                ]
            },
            {
                'section_number': 7,
                'category_name': 'HSE auditing and management review of HSE-MS',
                'description': 'Audit processes and management reviews',
                'order': 7,
                'subsections': [
                    {
                        'name': 'Audits',
                        'ref': '7.1',
                        'questions': [
                            {'letter': 'a', 'text': 'Do you have a written procedure for HSE auditing? If yes, please attach a copy.'},
                            {'letter': 'b', 'text': 'Who is involved in conducting HSE audits? How are audit team members selected to have specific expertise and be independent from the activities being audited? What are the qualifications required for auditors?'},
                            {'letter': 'c', 'text': 'How does your company schedule HSE audit and what scope of auditing is covered? e.g. internal, regulatory compliance, supplier/contractor, HSE management system implementation.'},
                            {'letter': 'd', 'text': 'How does management follow up on audit findings and ensure effective close out of action items?'},
                        ]
                    },
                    {
                        'name': 'Management review and follow-up',
                        'ref': '7.2',
                        'questions': [
                            {'letter': 'a', 'text': 'Do you have a written procedure for management review of the HSE-MS? If yes, please attach a copy'},
                            {'letter': 'b', 'text': 'How often are HSE-MS reviews conducted and who is involved in the process?'},
                            {'letter': 'c', 'text': 'How are identified actions and improvement efforts recorded and tracked to effective completion?'},
                        ]
                    }
                ]
            },
            {
                'section_number': 8,
                'category_name': 'HSE management - additional features',
                'description': 'Additional HSSE management features',
                'order': 8,
                'subsections': [
                    {
                        'name': 'Certification of your HSE-MS',
                        'ref': '8.1',
                        'questions': [
                            {'letter': 'a', 'text': 'Please provide information on any certification which you have received from certification bodies'},
                        ]
                    },
                    {
                        'name': 'Membership of associations',
                        'ref': '8.2',
                        'questions': [
                            {'letter': 'a', 'text': 'Describe the nature and extent of your company\'s participation in relevant industry, trade, and governmental organisations'},
                        ]
                    },
                    {
                        'name': 'Additional features of your HSE-MS',
                        'ref': '8.3',
                        'questions': [
                            {'letter': 'a', 'text': 'Does your organisation (globally, regionally or locally) have any HSE features or arrangements not described elsewhere in your response to the questionnaire?'},
                        ]
                    }
                ]
            }
        ]
        
        # Create categories and questions
        total_categories = 0
        total_questions = 0
        
        for cat_data in categories_data:
            category, cat_created = AuditChecklistCategory.objects.get_or_create(
                template=template,
                section_number=cat_data['section_number'],
                defaults={
                    'category_name': cat_data['category_name'],
                    'description': cat_data['description'],
                    'order': cat_data['order']
                }
            )
            
            if cat_created:
                total_categories += 1
                self.stdout.write(f"  Created category: {category.section_number}. {category.category_name}")
            
            # Create questions for each subsection
            order_counter = 1
            for subsection in cat_data['subsections']:
                for question_data in subsection['questions']:
                    question, q_created = AuditChecklistQuestion.objects.get_or_create(
                        category=category,
                        reference_number=subsection['ref'],
                        question_letter=question_data['letter'],
                        defaults={
                            'subsection_name': subsection['name'],
                            'question_text': question_data['text'],
                            'expected_response_type': 'TEXT',
                            'is_mandatory': True,
                            'order': order_counter
                        }
                    )
                    
                    if q_created:
                        total_questions += 1
                    
                    order_counter += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Seeding complete!'
                f'\n   Template: {template.name}'
                f'\n   Categories: {total_categories} created'
                f'\n   Questions: {total_questions} created'
                f'\n   Total questions in system: {AuditChecklistQuestion.objects.filter(category__template=template).count()}'
            )
        )

