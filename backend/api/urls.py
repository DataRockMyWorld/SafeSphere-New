from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api import views
from api.views import (
    DocumentListCreateAPIView,
    DocumentRetrieveUpdateDestroyAPIView,
    DocumentFolderListCreateAPIView,
    DocumentFolderRetrieveUpdateDestroyAPIView,
    ISOClauseListCreateAPIView,
    TagListCreateAPIView,
    ChangeRequestListCreateAPIView,
    VerifyDocumentAPIView,
    ApproveDocumentAPIView,
    RejectDocumentAPIView,
    SubmitDocumentAPIView,
    DocumentWorkflowHistoryAPIView,
    CreateNewVersionAPIView,
    DocumentTemplateListCreateAPIView,
    DocumentTemplateRetrieveUpdateDestroyAPIView,
    CreateDocumentFromTemplateAPIView,
    ApproveTemplateAPIView,
    ChangeRequestApproveAPIView,
    ChangeRequestRejectAPIView,
    SubmitForOpsReviewAPIView,
    OpsReviewAPIView,
    MDApprovalAPIView,
    RecordViewSet,
    # Document Dashboard
    DocumentDashboardAPIView,
    # Audit Management Views
    AuditTypeListView, AuditChecklistTemplateListView, AuditChecklistTemplateDetailView,
    AuditScoringCriteriaListView, AuditScoreCalculationView, AuditFindingPDFReportView,
    ISOClause45001ListView, ISOClause45001DetailView,
    AuditPlanListCreateView, AuditPlanDetailView,
    AuditChecklistListCreateView, AuditChecklistDetailView,
    AuditChecklistResponseListCreateView, AuditChecklistResponseDetailView,
    AuditFindingListCreateView, AuditFindingDetailView,
    CAPAListCreateView, CAPADetailView, CAPAProgressUpdateCreateView,
    AuditEvidenceListCreateView, AuditEvidenceDetailView,
    AuditReportListCreateView, AuditReportDetailView,
    AuditMeetingListCreateView, AuditCommentListCreateView,
    AuditDashboardView, BulkCAPAAssignView, MyCAPAsView,
    SendAuditPlanNotificationView, SendCAPANotificationView, SendFindingNotificationView,
    CompanySettingsView,
    # Risk Management Views
    RiskMatrixConfigView, RiskAssessmentListCreateView, RiskAssessmentDetailView,
    RiskAssessmentApproveView, RiskDashboardView, RiskExcelExportView, MyRiskAssessmentsView,
    LawCategoryListCreateAPIView,
    LawCategoryRetrieveUpdateDestroyAPIView,
    LawResourceListCreateAPIView,
    LawResourceRetrieveUpdateDestroyAPIView,
    LawResourceChangeListCreateAPIView,
    LawResourceChangeRetrieveUpdateDestroyAPIView,
    LegalRegisterEntryListCreateAPIView,
    LegalRegisterEntryRetrieveUpdateDestroyAPIView,
    LegalRegisterCommentListCreateAPIView,
    LegalRegisterCommentRetrieveUpdateDestroyAPIView,
    LegalRegisterDocumentListCreateAPIView,
    LegalRegisterDocumentRetrieveUpdateDestroyAPIView,
    PositionListCreateAPIView, PositionRetrieveUpdateDestroyAPIView,
    LegislationTrackerListCreateAPIView, LegislationTrackerRetrieveUpdateDestroyAPIView,
    # PPE Management Views
    PPECategoryListCreateAPIView, PPECategoryRetrieveUpdateDestroyAPIView,
    VendorListCreateAPIView, VendorRetrieveUpdateDestroyAPIView,
    PPEPurchaseListCreateAPIView, PPEPurchaseRetrieveUpdateDestroyAPIView,
    PPEPurchaseStatusUpdateAPIView, PPEPurchaseReceiptCreateAPIView, PPEPurchaseReceiptListAPIView,
    PPEInventoryListAPIView, PPEInventoryRetrieveUpdateAPIView,
    PPEIssueListCreateAPIView, PPEIssueMyIssuesAPIView, PPEIssueRetrieveUpdateDestroyAPIView,
    PPERequestListCreateAPIView, PPERequestRetrieveUpdateDestroyAPIView, PPERequestApprovalAPIView,
    PPEDamageReportListCreateAPIView, PPEDamageReportRetrieveUpdateDestroyAPIView, PPEDamageReportReviewAPIView,
    PPETransferListCreateAPIView, PPETransferRetrieveUpdateDestroyAPIView, PPETransferApprovalAPIView,
    PPEReturnListCreateAPIView, PPEReturnRetrieveUpdateDestroyAPIView,
    # PPE Dashboard and Reporting Views
    PPEStockPositionAPIView, PPEMovementAPIView, PPEMostRequestedAPIView,
    PPECostAnalysisAPIView, PPEExpiryAlertsAPIView, PPELowStockAlertsAPIView, PPEUserStockAPIView,
    # PPE Bulk Operations
    BulkPPEIssueAPIView, BulkPPERequestApprovalAPIView,
    # Health check
    health_check, system_info,
)

# Router for ViewSets
router = DefaultRouter()
router.register(r'records', RecordViewSet, basename='record')
router.register(r'quick-reports', views.QuickReportViewSet, basename='quickreport')

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('system-info/', system_info, name='system_info'),
    path('documents/', DocumentListCreateAPIView.as_view(), name='document-list-create'),
    path('documents/<uuid:pk>/', DocumentRetrieveUpdateDestroyAPIView.as_view(), name='document-retrieve-update-destroy'),
    path('documents/folders/', DocumentFolderListCreateAPIView.as_view(), name='document-folder-list-create'),
    path('documents/folders/<uuid:pk>/', DocumentFolderRetrieveUpdateDestroyAPIView.as_view(), name='document-folder-retrieve-update-destroy'),
    path('documents/iso-clauses/', ISOClauseListCreateAPIView.as_view(), name='iso-clause-list-create'),
    path('documents/tags/', TagListCreateAPIView.as_view(), name='tag-list-create'),
    path('documents/change-requests/', ChangeRequestListCreateAPIView.as_view(), name='change-request-list-create'),
    path('documents/verify/', VerifyDocumentAPIView.as_view(), name='document-verify'),
    path('documents/approve/', ApproveDocumentAPIView.as_view(), name='document-approve'),
    path('documents/reject/', RejectDocumentAPIView.as_view(), name='document-reject'),
    path('documents/submit/', SubmitDocumentAPIView.as_view(), name='document-submit'),
    path('documents/<uuid:pk>/workflow-history/', DocumentWorkflowHistoryAPIView.as_view(), name='document-workflow-history'),
    path('documents/<uuid:pk>/new-version/', CreateNewVersionAPIView.as_view(), name='document-new-version'),
    path('templates/', DocumentTemplateListCreateAPIView.as_view(), name='template-list-create'),
    path('templates/<int:pk>/', DocumentTemplateRetrieveUpdateDestroyAPIView.as_view(), name='template-retrieve-update-destroy'),
    path('templates/<int:pk>/create-document/', CreateDocumentFromTemplateAPIView.as_view(), name='template-create-document'),
    path('templates/<int:pk>/approve/', ApproveTemplateAPIView.as_view(), name='template-approve'),
    path('change-requests/<int:pk>/approve/', ChangeRequestApproveAPIView.as_view(), name='change-request-approve'),
    path('change-requests/<int:pk>/reject/', ChangeRequestRejectAPIView.as_view(), name='change-request-reject'),
    path('documents/<uuid:pk>/submit-for-ops-review/', SubmitForOpsReviewAPIView.as_view(), name='document-submit-for-ops-review'),
    path('documents/<uuid:pk>/ops-review/', OpsReviewAPIView.as_view(), name='document-ops-review'),
    path('documents/<uuid:pk>/md-approval/', MDApprovalAPIView.as_view(), name='document-md-approval'),
    path('documents/dashboard/', DocumentDashboardAPIView.as_view(), name='document-dashboard'),
    path('legals/categories/', LawCategoryListCreateAPIView.as_view(), name='lawcategory-list-create'),
    path('legals/categories/<int:pk>/', LawCategoryRetrieveUpdateDestroyAPIView.as_view(), name='lawcategory-detail'),
    path('legals/resources/', LawResourceListCreateAPIView.as_view(), name='lawresource-list-create'),
    path('legals/resources/<int:pk>/', LawResourceRetrieveUpdateDestroyAPIView.as_view(), name='lawresource-detail'),
    path('legals/resource-changes/', LawResourceChangeListCreateAPIView.as_view(), name='lawresourcechange-list-create'),
    path('legals/resource-changes/<int:pk>/', LawResourceChangeRetrieveUpdateDestroyAPIView.as_view(), name='lawresourcechange-detail'),
    path('legals/register-entries/', LegalRegisterEntryListCreateAPIView.as_view(), name='legalregisterentry-list-create'),
    path('legals/register-entries/<int:pk>/', LegalRegisterEntryRetrieveUpdateDestroyAPIView.as_view(), name='legalregisterentry-detail'),
    path('legals/register-comments/', LegalRegisterCommentListCreateAPIView.as_view(), name='legalregistercomment-list-create'),
    path('legals/register-comments/<int:pk>/', LegalRegisterCommentRetrieveUpdateDestroyAPIView.as_view(), name='legalregistercomment-detail'),
    path('legals/register-documents/', LegalRegisterDocumentListCreateAPIView.as_view(), name='legalregisterdocument-list-create'),
    path('legals/register-documents/<int:pk>/', LegalRegisterDocumentRetrieveUpdateDestroyAPIView.as_view(), name='legalregisterdocument-detail'),
    path('legals/positions/', PositionListCreateAPIView.as_view(), name='position-list-create'),
    path('legals/positions/<int:pk>/', PositionRetrieveUpdateDestroyAPIView.as_view(), name='position-detail'),
    path('legals/legislation-trackers/', LegislationTrackerListCreateAPIView.as_view(), name='legislationtracker-list-create'),
    path('legals/legislation-trackers/<int:pk>/', LegislationTrackerRetrieveUpdateDestroyAPIView.as_view(), name='legislationtracker-detail'),
    
    # =============================
    # PPE Management URLs
    # =============================
    
    # PPE Categories
    path('ppes/categories/', PPECategoryListCreateAPIView.as_view(), name='ppecategory-list-create'),
    path('ppes/categories/<int:pk>/', PPECategoryRetrieveUpdateDestroyAPIView.as_view(), name='ppecategory-detail'),
    
    # Vendors
    path('ppes/vendors/', VendorListCreateAPIView.as_view(), name='vendor-list-create'),
    path('ppes/vendors/<int:pk>/', VendorRetrieveUpdateDestroyAPIView.as_view(), name='vendor-detail'),
    
    # PPE Purchases
    path('ppes/purchases/', PPEPurchaseListCreateAPIView.as_view(), name='ppepurchase-list-create'),
    path('ppes/purchases/<int:pk>/', PPEPurchaseRetrieveUpdateDestroyAPIView.as_view(), name='ppepurchase-detail'),
    path('ppes/purchases/<int:pk>/status/', PPEPurchaseStatusUpdateAPIView.as_view(), name='ppepurchase-status-update'),
    path('ppes/purchases/<int:pk>/receipt/', PPEPurchaseReceiptCreateAPIView.as_view(), name='ppepurchase-receipt-create'),
    path('ppes/purchases/<int:pk>/receipts/', PPEPurchaseReceiptListAPIView.as_view(), name='ppepurchase-receipt-list'),
    
    # PPE Inventory
    path('ppes/inventory/', PPEInventoryListAPIView.as_view(), name='ppeinventory-list'),
    path('ppes/inventory/<int:pk>/', PPEInventoryRetrieveUpdateAPIView.as_view(), name='ppeinventory-detail'),
    
    # PPE Issues
    path('ppes/issues/', PPEIssueListCreateAPIView.as_view(), name='ppeissue-list-create'),
    path('ppes/issues/my-issues/', PPEIssueMyIssuesAPIView.as_view(), name='ppeissue-my-issues'),
    path('ppes/issues/<int:pk>/', PPEIssueRetrieveUpdateDestroyAPIView.as_view(), name='ppeissue-detail'),
    
    # PPE Requests
    path('ppes/requests/', PPERequestListCreateAPIView.as_view(), name='pperequest-list-create'),
    path('ppes/requests/<int:pk>/', PPERequestRetrieveUpdateDestroyAPIView.as_view(), name='pperequest-detail'),
    path('ppes/requests/<int:pk>/approve/', PPERequestApprovalAPIView.as_view(), name='pperequest-approval'),
    
    # PPE Damage Reports
    path('ppes/damage-reports/', PPEDamageReportListCreateAPIView.as_view(), name='ppedamagereport-list-create'),
    path('ppes/damage-reports/<int:pk>/', PPEDamageReportRetrieveUpdateDestroyAPIView.as_view(), name='ppedamagereport-detail'),
    path('ppes/damage-reports/<int:pk>/review/', PPEDamageReportReviewAPIView.as_view(), name='ppedamagereport-review'),
    
    # PPE Transfers
    path('ppes/transfers/', PPETransferListCreateAPIView.as_view(), name='ppetransfer-list-create'),
    path('ppes/transfers/<int:pk>/', PPETransferRetrieveUpdateDestroyAPIView.as_view(), name='ppetransfer-detail'),
    path('ppes/transfers/<int:pk>/approve/', PPETransferApprovalAPIView.as_view(), name='ppetransfer-approval'),
    
    # PPE Returns
    path('ppes/returns/', PPEReturnListCreateAPIView.as_view(), name='ppereturn-list-create'),
    path('ppes/returns/<int:pk>/', PPEReturnRetrieveUpdateDestroyAPIView.as_view(), name='ppereturn-detail'),
    
    # =============================
    # PPE Dashboard and Reporting URLs
    # =============================
    
    # Stock and Movement
    path('ppes/dashboard/stock-position/', PPEStockPositionAPIView.as_view(), name='ppe-stock-position'),
    path('ppes/dashboard/movement/', PPEMovementAPIView.as_view(), name='ppe-movement'),
    path('ppes/dashboard/most-requested/', PPEMostRequestedAPIView.as_view(), name='ppe-most-requested'),
    
    # Cost Analysis (HSSE Manager only)
    path('ppes/dashboard/cost-analysis/', PPECostAnalysisAPIView.as_view(), name='ppe-cost-analysis'),
    
    # Alerts
    path('ppes/dashboard/expiry-alerts/', PPEExpiryAlertsAPIView.as_view(), name='ppe-expiry-alerts'),
    path('ppes/dashboard/low-stock-alerts/', PPELowStockAlertsAPIView.as_view(), name='ppe-low-stock-alerts'),
    
    # User Stock
    path('ppes/dashboard/user-stock/', PPEUserStockAPIView.as_view(), name='ppe-user-stock'),
    path('ppes/dashboard/user-stock/<int:user_id>/', PPEUserStockAPIView.as_view(), name='ppe-user-stock-detail'),
    
    # =============================
    # PPE Bulk Operations URLs
    # =============================
    
    path('ppes/bulk/issue/', BulkPPEIssueAPIView.as_view(), name='ppe-bulk-issue'),
    path('ppes/bulk/request-approval/', BulkPPERequestApprovalAPIView.as_view(), name='ppe-bulk-request-approval'),
    
    # =============================
    # Audit Management URLs
    # =============================
    
    # Audit Types
    path('audits/types/', AuditTypeListView.as_view(), name='audit-type-list'),
    
    # Checklist Templates
    path('audits/templates/', AuditChecklistTemplateListView.as_view(), name='audit-template-list'),
    path('audits/templates/<int:pk>/', AuditChecklistTemplateDetailView.as_view(), name='audit-template-detail'),
    
    # Scoring
    path('audits/scoring-criteria/', AuditScoringCriteriaListView.as_view(), name='scoring-criteria-list'),
    path('audits/findings/<uuid:pk>/score/', AuditScoreCalculationView.as_view(), name='finding-score'),
    path('audits/findings/<uuid:pk>/pdf-report/', AuditFindingPDFReportView.as_view(), name='finding-pdf-report'),
    
    # ISO 45001 Clauses
    path('audits/iso-clauses/', ISOClause45001ListView.as_view(), name='iso-clause-45001-list'),
    path('audits/iso-clauses/<int:pk>/', ISOClause45001DetailView.as_view(), name='iso-clause-45001-detail'),
    
    # Company Settings
    path('company-settings/', CompanySettingsView.as_view(), name='company-settings'),
    
    # Audit Plans
    path('audits/plans/', AuditPlanListCreateView.as_view(), name='audit-plan-list'),
    path('audits/plans/<uuid:pk>/', AuditPlanDetailView.as_view(), name='audit-plan-detail'),
    
    # Audit Checklists
    path('audits/checklists/', AuditChecklistListCreateView.as_view(), name='audit-checklist-list'),
    path('audits/checklists/<uuid:pk>/', AuditChecklistDetailView.as_view(), name='audit-checklist-detail'),
    
    # Checklist Responses
    path('audits/responses/', AuditChecklistResponseListCreateView.as_view(), name='audit-response-list'),
    path('audits/responses/<uuid:pk>/', AuditChecklistResponseDetailView.as_view(), name='audit-response-detail'),
    
    # Findings
    path('audits/findings/', AuditFindingListCreateView.as_view(), name='audit-finding-list'),
    path('audits/findings/<uuid:pk>/', AuditFindingDetailView.as_view(), name='audit-finding-detail'),
    
    # CAPAs
    path('audits/capas/', CAPAListCreateView.as_view(), name='capa-list'),
    path('audits/capas/<uuid:pk>/', CAPADetailView.as_view(), name='capa-detail'),
    path('audits/capas/my-capas/', MyCAPAsView.as_view(), name='my-capas'),
    path('audits/capas/progress-update/', CAPAProgressUpdateCreateView.as_view(), name='capa-progress-update'),
    path('audits/capas/bulk-assign/', BulkCAPAAssignView.as_view(), name='capa-bulk-assign'),
    
    # Evidence
    path('audits/evidence/', AuditEvidenceListCreateView.as_view(), name='audit-evidence-list'),
    path('audits/evidence/<uuid:pk>/', AuditEvidenceDetailView.as_view(), name='audit-evidence-detail'),
    
    # Reports
    path('audits/reports/', AuditReportListCreateView.as_view(), name='audit-report-list'),
    path('audits/reports/<uuid:pk>/', AuditReportDetailView.as_view(), name='audit-report-detail'),
    
    # Meetings
    path('audits/meetings/', AuditMeetingListCreateView.as_view(), name='audit-meeting-list'),
    
    # Comments
    path('audits/comments/', AuditCommentListCreateView.as_view(), name='audit-comment-list'),
    
    # Dashboard
    path('audits/dashboard/', AuditDashboardView.as_view(), name='audit-dashboard'),
    
    # Email Notifications
    path('audits/plans/<uuid:pk>/send-notification/', SendAuditPlanNotificationView.as_view(), name='send-audit-notification'),
    path('audits/capas/<uuid:pk>/send-notification/', SendCAPANotificationView.as_view(), name='send-capa-notification'),
    path('audits/findings/<uuid:pk>/send-notification/', SendFindingNotificationView.as_view(), name='send-finding-notification'),
    
    # ===========================================
    # RISK MANAGEMENT ENDPOINTS
    # ===========================================
    
    # Risk Matrix
    path('risks/matrix-config/', RiskMatrixConfigView.as_view(), name='risk-matrix-config'),
    
    # Risk Assessments
    path('risks/assessments/', RiskAssessmentListCreateView.as_view(), name='risk-assessment-list'),
    path('risks/assessments/<uuid:pk>/', RiskAssessmentDetailView.as_view(), name='risk-assessment-detail'),
    path('risks/assessments/<uuid:pk>/approve/', RiskAssessmentApproveView.as_view(), name='risk-assessment-approve'),
    path('risks/my-assessments/', MyRiskAssessmentsView.as_view(), name='my-risk-assessments'),
    
    # Risk Dashboard & Exports
    path('risks/dashboard/', RiskDashboardView.as_view(), name='risk-dashboard'),
    path('risks/export-excel/', RiskExcelExportView.as_view(), name='risk-export-excel'),
    
    path('', include(router.urls)),
]
