"""
PDF Report Generation for Audit Findings.
"""
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from datetime import datetime
from django.conf import settings


class AuditFindingPDFReport:
    """Generate comprehensive PDF report for audit findings."""
    
    def __init__(self, finding):
        self.finding = finding
        self.buffer = BytesIO()
        self.doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=50,
        )
        self.styles = getSampleStyleSheet()
        self.story = []
        
        # Custom styles
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0052D4'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        self.heading_style = ParagraphStyle(
            'CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#0052D4'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )
        
        self.subheading_style = ParagraphStyle(
            'CustomSubheading',
            parent=self.styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#333333'),
            spaceAfter=8,
            fontName='Helvetica-Bold'
        )
    
    def add_header(self):
        """Add report header with company logo."""
        # Add company logo if available
        try:
            from audits.models import CompanySettings
            company_settings = CompanySettings.get_settings()
            
            if company_settings.company_logo:
                logo_path = company_settings.company_logo.path
                # Add logo (max height 80px, maintain aspect ratio)
                logo = Image(logo_path, width=2*inch, height=0.8*inch)
                logo.hAlign = 'CENTER'
                self.story.append(logo)
                self.story.append(Spacer(1, 12))
        except Exception as e:
            # If logo can't be loaded, continue without it
            pass
        
        # Title
        title = Paragraph("AUDIT FINDING REPORT", self.title_style)
        self.story.append(title)
        self.story.append(Spacer(1, 12))
        
        # Finding code and date
        info_data = [
            ['Finding Code:', self.finding.finding_code],
            ['Report Generated:', datetime.now().strftime('%B %d, %Y at %H:%M')],
            ['Status:', self.finding.status.replace('_', ' ').title()],
        ]
        
        info_table = Table(info_data, colWidths=[2*inch, 4*inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        self.story.append(info_table)
        self.story.append(Spacer(1, 20))
    
    def add_audit_information(self):
        """Add audit plan and session information."""
        self.story.append(Paragraph("AUDIT INFORMATION", self.heading_style))
        
        audit_data = [
            ['Audit Code:', self.finding.audit_plan.audit_code],
            ['Audit Title:', self.finding.audit_plan.title],
            ['Audit Type:', self.finding.audit_plan.audit_type.name],
            ['Audit Date:', str(self.finding.audit_date) if self.finding.audit_date else 'N/A'],
            ['Lead Auditor:', self.finding.audit_plan.lead_auditor.get_full_name if self.finding.audit_plan.lead_auditor else 'Not assigned'],
            ['ISO Clause:', f"{self.finding.iso_clause.clause_number} - {self.finding.iso_clause.title}"],
        ]
        
        if self.finding.attendees:
            audit_data.append(['Attendees:', ', '.join(self.finding.attendees)])
        
        audit_table = Table(audit_data, colWidths=[2*inch, 4*inch])
        audit_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#333333')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#EEEEEE')),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F5F5')),
        ]))
        
        self.story.append(audit_table)
        self.story.append(Spacer(1, 20))
    
    def add_finding_details(self):
        """Add finding details."""
        self.story.append(Paragraph("FINDING DETAILS", self.heading_style))
        
        # Finding type and severity with color
        severity_color = self.get_severity_color(self.finding.severity)
        type_color = self.get_type_color(self.finding.finding_type)
        
        finding_data = [
            ['Finding Type:', self.finding.get_finding_type_display()],
            ['Severity:', self.finding.get_severity_display()],
            ['Title:', self.finding.title],
            ['Department Affected:', self.finding.department_affected],
            ['Process Affected:', self.finding.process_affected or 'N/A'],
            ['Location:', self.finding.location or 'N/A'],
            ['Risk Level:', f"{self.finding.risk_level}/10"],
            ['Immediate Action Required:', 'Yes' if self.finding.requires_immediate_action else 'No'],
        ]
        
        finding_table = Table(finding_data, colWidths=[2*inch, 4*inch])
        finding_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#333333')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#EEEEEE')),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F5F5')),
            ('TEXTCOLOR', (1, 0), (1, 0), type_color),  # Finding type row
            ('TEXTCOLOR', (1, 1), (1, 1), severity_color),  # Severity row
            ('FONTNAME', (1, 0), (1, 1), 'Helvetica-Bold'),
        ]))
        
        self.story.append(finding_table)
        self.story.append(Spacer(1, 12))
        
        # Description
        if self.finding.description:
            self.story.append(Paragraph("Description:", self.subheading_style))
            desc_style = ParagraphStyle('Description', parent=self.styles['BodyText'], alignment=TA_JUSTIFY)
            self.story.append(Paragraph(self.finding.description, desc_style))
            self.story.append(Spacer(1, 12))
        
        # Impact Assessment
        self.story.append(Paragraph("Impact Assessment:", self.subheading_style))
        impact_text = f"Primary Impact Area: {self.finding.get_impact_assessment_display()}"
        self.story.append(Paragraph(impact_text, self.styles['BodyText']))
        self.story.append(Spacer(1, 20))
    
    def add_audit_score(self):
        """Add audit score breakdown."""
        score_data = self.finding.calculate_overall_score()
        
        if not score_data:
            return
        
        self.story.append(Paragraph("AUDIT SCORE", self.heading_style))
        
        # Overall score
        grade_color = self.get_grade_color(score_data['color'])
        
        overall_data = [
            ['Overall Score:', f"{score_data['overall_score']:.1f}%"],
            ['Grade:', score_data['grade'].replace('_', ' ').title()],
            ['Questions Answered:', f"{score_data['total_questions_answered']}"],
        ]
        
        overall_table = Table(overall_data, colWidths=[2*inch, 4*inch])
        overall_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#333333')),
            ('TEXTCOLOR', (1, 0), (1, 1), grade_color),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F9F9F9')),
            ('BOX', (0, 0), (-1, -1), 2, grade_color),
        ]))
        
        self.story.append(overall_table)
        self.story.append(Spacer(1, 15))
        
        # Category breakdown
        self.story.append(Paragraph("Category Scores:", self.subheading_style))
        
        category_data = [['Category', 'Score', 'Weight', 'Contribution']]
        
        for cat_id, cat_score in score_data['category_scores'].items():
            cat_color = self.get_category_color(cat_score['score'])
            category_data.append([
                cat_score['name'],
                f"{cat_score['score']:.1f}%",
                f"{cat_score['weight']:.1f}%",
                f"{cat_score['weighted_contribution']:.2f}%",
            ])
        
        category_table = Table(category_data, colWidths=[3*inch, 1*inch, 1*inch, 1.5*inch])
        category_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0052D4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9F9F9')]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        self.story.append(category_table)
        self.story.append(Spacer(1, 20))
    
    def add_question_responses(self):
        """Add detailed question responses."""
        if not self.finding.question_responses.exists():
            return
        
        self.story.append(PageBreak())
        self.story.append(Paragraph("AUDIT CHECKLIST RESPONSES", self.heading_style))
        self.story.append(Spacer(1, 10))
        
        # Group responses by category
        responses = self.finding.question_responses.select_related('question__category').all()
        
        current_category = None
        for response in responses:
            category = response.question.category
            
            # Category header
            if current_category != category.id:
                current_category = category.id
                self.story.append(Spacer(1, 12))
                category_title = Paragraph(
                    f"{category.section_number}. {category.category_name}",
                    self.subheading_style
                )
                self.story.append(category_title)
                self.story.append(Spacer(1, 8))
            
            # Question and response
            question_ref = response.question.full_reference
            question_text = response.question.question_text
            
            # Question
            q_style = ParagraphStyle('Question', parent=self.styles['BodyText'], fontName='Helvetica-Bold', fontSize=10)
            self.story.append(Paragraph(f"{question_ref}) {question_text}", q_style))
            self.story.append(Spacer(1, 4))
            
            # Answer
            if response.answer_text:
                answer_style = ParagraphStyle('Answer', parent=self.styles['BodyText'], leftIndent=20, fontSize=9)
                self.story.append(Paragraph(f"<b>Answer:</b> {response.answer_text}", answer_style))
                self.story.append(Spacer(1, 4))
            
            # Compliance status
            status_color = self.get_compliance_color(response.compliance_status)
            status_text = f"<b>Compliance:</b> <font color='{status_color.hexval()}'>{response.get_compliance_status_display()}</font>"
            status_style = ParagraphStyle('Status', parent=self.styles['BodyText'], leftIndent=20, fontSize=9)
            self.story.append(Paragraph(status_text, status_style))
            
            # Notes
            if response.notes:
                self.story.append(Spacer(1, 4))
                notes_style = ParagraphStyle('Notes', parent=self.styles['BodyText'], leftIndent=20, fontSize=9, textColor=colors.HexColor('#666666'))
                self.story.append(Paragraph(f"<i>Notes: {response.notes}</i>", notes_style))
            
            self.story.append(Spacer(1, 10))
    
    def add_capas(self):
        """Add CAPA information if any."""
        capas = self.finding.capas.all()
        
        if not capas:
            return
        
        self.story.append(PageBreak())
        self.story.append(Paragraph("CORRECTIVE & PREVENTIVE ACTIONS", self.heading_style))
        self.story.append(Spacer(1, 10))
        
        for capa in capas:
            # CAPA header
            capa_title = f"{capa.action_code} - {capa.title}"
            self.story.append(Paragraph(capa_title, self.subheading_style))
            
            # CAPA details
            capa_data = [
                ['Action Type:', capa.get_action_type_display()],
                ['Priority:', capa.priority],
                ['Status:', capa.get_status_display()],
                ['Responsible Person:', capa.responsible_person.get_full_name if capa.responsible_person else 'Not assigned'],
                ['Target Completion:', str(capa.target_completion_date)],
                ['Progress:', f"{capa.progress_percentage}%"],
            ]
            
            if capa.actual_completion_date:
                capa_data.append(['Completed:', str(capa.actual_completion_date)])
            
            capa_table = Table(capa_data, colWidths=[2*inch, 4*inch])
            capa_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F5F5F5')),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            self.story.append(capa_table)
            self.story.append(Spacer(1, 8))
            
            # Action plan
            if capa.action_plan:
                self.story.append(Paragraph("<b>Action Plan:</b>", self.styles['BodyText']))
                action_style = ParagraphStyle('ActionPlan', parent=self.styles['BodyText'], leftIndent=15)
                self.story.append(Paragraph(capa.action_plan, action_style))
            
            self.story.append(Spacer(1, 15))
    
    def add_footer_info(self):
        """Add footer information."""
        self.story.append(Spacer(1, 30))
        
        footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#666666'),
            alignment=TA_CENTER
        )
        
        footer_text = f"""
        <br/><br/>
        _______________________________________________<br/>
        This report was generated by SafeSphere Audit Management System<br/>
        Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')}<br/>
        <br/>
        CONFIDENTIAL - For internal use only
        """
        
        self.story.append(Paragraph(footer_text, footer_style))
    
    def get_severity_color(self, severity):
        """Get color for severity."""
        color_map = {
            'CRITICAL': colors.HexColor('#D32F2F'),
            'HIGH': colors.HexColor('#F57C00'),
            'MEDIUM': colors.HexColor('#FFA726'),
            'LOW': colors.HexColor('#66BB6A'),
        }
        return color_map.get(severity, colors.black)
    
    def get_type_color(self, finding_type):
        """Get color for finding type."""
        color_map = {
            'MAJOR_NC': colors.HexColor('#D32F2F'),
            'MINOR_NC': colors.HexColor('#F57C00'),
            'OBSERVATION': colors.HexColor('#2196F3'),
            'OPPORTUNITY': colors.HexColor('#66BB6A'),
        }
        return color_map.get(finding_type, colors.black)
    
    def get_compliance_color(self, status):
        """Get color for compliance status."""
        color_map = {
            'COMPLIANT': colors.HexColor('#66BB6A'),
            'NON_COMPLIANT': colors.HexColor('#D32F2F'),
            'OBSERVATION': colors.HexColor('#2196F3'),
            'NOT_APPLICABLE': colors.HexColor('#9E9E9E'),
            'OPPORTUNITY': colors.HexColor('#FFA726'),
        }
        return color_map.get(status, colors.black)
    
    def get_grade_color(self, grade_color):
        """Get color for grade."""
        color_map = {
            'GREEN': colors.HexColor('#66BB6A'),
            'AMBER': colors.HexColor('#FFA726'),
            'RED': colors.HexColor('#D32F2F'),
        }
        return color_map.get(grade_color, colors.black)
    
    def get_category_color(self, score):
        """Get color based on category score."""
        if score >= 80:
            return colors.HexColor('#66BB6A')
        elif score >= 50:
            return colors.HexColor('#FFA726')
        else:
            return colors.HexColor('#D32F2F')
    
    def generate(self):
        """Generate the PDF report."""
        # Add all sections
        self.add_header()
        self.add_audit_information()
        self.add_finding_details()
        self.add_audit_score()
        self.add_question_responses()
        self.add_capas()
        self.add_footer_info()
        
        # Build PDF
        self.doc.build(self.story)
        
        # Get PDF from buffer
        pdf = self.buffer.getvalue()
        self.buffer.close()
        
        return pdf


def generate_finding_pdf(finding):
    """Generate PDF report for a finding."""
    report = AuditFindingPDFReport(finding)
    return report.generate()

