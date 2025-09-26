from rest_framework import generics, status, viewsets, filters
from rest_framework.views import APIView
from documents.models import (
    ISOClause, Tag, Document, ApprovalWorkflow, 
    ChangeRequest, DocumentTemplate, Record
)
from documents.serializers import (
    ISOClauseSerializer, TagSerializer, DocumentSerializer, 
    ApprovalWorkflowSerializer, ChangeRequestSerializer, 
    DocumentTemplateSerializer, CreateDocumentFromTemplateSerializer,
    RecordSerializer, RecordApprovalSerializer
)
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import Q, Sum, Count, Avg
from collections import defaultdict
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from rest_framework.decorators import action
from .permissions import IsHSSEManager
from legals.models import (
    LawCategory, LawResource, LawResourceChange,
    LegalRegisterEntry, LegalRegisterComment, LegalRegisterDocument, Position, LegislationTracker
)
from legals.serializers import (
    LawCategorySerializer, LawResourceSerializer, LawResourceChangeSerializer,
    LegalRegisterEntrySerializer, LegalRegisterCommentSerializer, LegalRegisterDocumentSerializer,
    PositionSerializer, LegislationTrackerSerializer
)
from ppes.models import (
    PPECategory, Vendor, PPEPurchase, PPEInventory, PPEIssue, 
    PPERequest, PPEDamageReport, PPETransfer, PPEReturn, PPEPurchaseReceipt
)
from ppes.serializers import (
    PPECategorySerializer, VendorSerializer, PPEPurchaseSerializer, PPEInventorySerializer,
    PPEIssueSerializer, PPERequestSerializer, PPERequestApprovalSerializer,
    PPEDamageReportSerializer, PPEDamageReportReviewSerializer,
    PPETransferSerializer, PPETransferApprovalSerializer, PPEReturnSerializer,
    PPEStockPositionSerializer, PPEMovementSerializer, PPEMostRequestedSerializer,
    PPECostAnalysisSerializer, PPEExpiryAlertSerializer, PPELowStockAlertSerializer,
    PPEUserStockSerializer, BulkPPEIssueSerializer, BulkPPERequestApprovalSerializer,
    PPEPurchaseReceiptSerializer
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.core.cache import cache
from django.conf import settings
import os

User = get_user_model()

# =============================
# Generic API Views
# =============================
class DocumentListCreateAPIView(generics.ListCreateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Document.objects.all()
        
        # Handle search filtering
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(content__icontains=search)
            )
        
        # Handle category filtering
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(document_type=category)
        
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DocumentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'  # This will use the UUID field

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), id=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ISOClauseListCreateAPIView(generics.ListCreateAPIView):
    queryset = ISOClause.objects.all()
    serializer_class = ISOClauseSerializer


class TagListCreateAPIView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class ChangeRequestListCreateAPIView(generics.ListCreateAPIView):
    queryset = ChangeRequest.objects.all()
    serializer_class = ChangeRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class ChangeRequestRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    queryset = ChangeRequest.objects.all()
    serializer_class = ChangeRequestSerializer


class ApprovalWorkflowListCreateAPIView(generics.ListCreateAPIView):
    queryset = ApprovalWorkflow.objects.all()
    serializer_class = ApprovalWorkflowSerializer
    

# =============================
# Approval Action Views
# =============================
class SubmitDocumentAPIView(APIView):
    def post(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
            if not doc.is_editable(request.user):
                return Response({"error": "You don't have permission to submit this document."}, status=403)
            
            doc.transition_to('VERIFICATION', request.user)
            return Response({'status': 'Document submitted for verification'})
        except Document.DoesNotExist:
            return Response({"error": "Document not found."}, status=404)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class VerifyDocumentAPIView(APIView):
    def post(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
            if not doc.is_verifiable(request.user):
                return Response({"error": "You don't have permission to verify this document."}, status=403)
            
            doc.transition_to('APPROVAL', request.user)
            doc.verified_by = request.user
            doc.verified_at = timezone.now()
            doc.save()
            return Response({'status': 'Document verified, pending approval'})
        except Document.DoesNotExist:
            return Response({"error": "Document not found."}, status=404)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class ApproveDocumentAPIView(APIView):
    def post(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
            if not doc.is_approvable(request.user):
                return Response({"error": "You don't have permission to approve this document."}, status=403)
            
            doc.transition_to('APPROVED', request.user)
            doc.approved_by = request.user
            doc.approved_at = timezone.now()
            doc.revision_number += 1
            doc.save()
            return Response({'status': 'Document approved'})
        except Document.DoesNotExist:
            return Response({"error": "Document not found."}, status=404)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class RejectDocumentAPIView(APIView):
    def post(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
            if not doc.is_rejectable(request.user):
                return Response({"error": "You don't have permission to reject this document."}, status=403)
            
            reason = request.data.get('reason', '')
            if not reason:
                return Response({"error": "Rejection reason is required."}, status=400)
            
            doc.transition_to('REJECTED', request.user, comment=reason)
            doc.rejection_reason = reason
            doc.save()
            return Response({'status': 'Document rejected'})
        except Document.DoesNotExist:
            return Response({"error": "Document not found."}, status=404)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class DocumentWorkflowHistoryAPIView(APIView):
    def get(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
            workflow_history = doc.get_workflow_history()
            serializer = ApprovalWorkflowSerializer(workflow_history, many=True)
            return Response(serializer.data)
        except Document.DoesNotExist:
            return Response({"error": "Document not found."}, status=404)


class CreateNewVersionAPIView(APIView):
    def post(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk)
            if not doc.is_editable(request.user):
                return Response({"error": "You don't have permission to create a new version."}, status=403)
            
            doc.create_new_version()
            return Response({
                'status': 'New version created',
                'version': doc.get_current_version()
            })
        except Document.DoesNotExist:
            return Response({"error": "Document not found."}, status=404)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


# =============================
# Template Management Views
# =============================
class DocumentTemplateListCreateAPIView(generics.ListCreateAPIView):
    queryset = DocumentTemplate.objects.filter(is_active=True)
    serializer_class = DocumentTemplateSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class DocumentTemplateRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DocumentTemplate.objects.all()
    serializer_class = DocumentTemplateSerializer
    
    def perform_update(self, serializer):
        # Only allow updates if user is the creator or has appropriate permissions
        if self.request.user != serializer.instance.created_by and not self.request.user.is_staff:
            raise PermissionDenied("You don't have permission to update this template")
        serializer.save()


class CreateDocumentFromTemplateAPIView(APIView):
    def post(self, request, template_id):
        try:
            template = DocumentTemplate.objects.get(id=template_id, is_active=True)
            serializer = CreateDocumentFromTemplateSerializer(
                data=request.data,
                context={'template': template}
            )
            serializer.is_valid(raise_exception=True)
            
            # Create document from template
            document = template.create_document_from_template(
                user=request.user,
                title=serializer.validated_data['title'],
                description=serializer.validated_data.get('description', '')
            )
            
            # Update document metadata if provided
            if 'metadata' in serializer.validated_data:
                document.metadata.update(serializer.validated_data['metadata'])
                document.save()
            
            return Response({
                'status': 'Document created successfully',
                'document_id': document.id
            })
            
        except DocumentTemplate.DoesNotExist:
            return Response({"error": "Template not found or inactive"}, status=404)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class ApproveTemplateAPIView(APIView):
    def post(self, request, template_id):
        try:
            template = DocumentTemplate.objects.get(id=template_id)
            if not request.user.position == 'MD':
                return Response({"error": "Only MD can approve templates"}, status=403)
            
            template.approved_by = request.user
            template.approved_at = timezone.now()
            template.save()
            
            return Response({'status': 'Template approved successfully'})
            
        except DocumentTemplate.DoesNotExist:
            return Response({"error": "Template not found"}, status=404)


# =============================
# Document Dashboard API View
# =============================
class DocumentDashboardAPIView(APIView):
    """API endpoint for document management dashboard metrics."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get basic document counts
            total_documents = Document.objects.count()
            
            # Get documents by status
            status_counts = Document.objects.values('status').annotate(count=Count('id'))
            status_dict = {item['status']: item['count'] for item in status_counts}
            
            # Get documents by type
            type_counts = Document.objects.values('document_type').annotate(count=Count('id'))
            type_dict = {item['document_type']: item['count'] for item in type_counts}
            
            # Get change requests count
            change_requests_count = ChangeRequest.objects.count()
            
            # Get recent activities (last 10 workflow entries)
            recent_activities = ApprovalWorkflow.objects.select_related(
                'document', 'performed_by'
            ).order_by('-timestamp')[:10]
            
            # Format recent activities
            activities = []
            for activity in recent_activities:
                activities.append({
                    'id': activity.id,
                    'document_title': activity.document.title,
                    'action': activity.action,
                    'performed_by': activity.performed_by.get_full_name() if activity.performed_by else 'System',
                    'created_at': activity.timestamp,
                    'comment': activity.comment
                })
            
            # Calculate percentages for document types
            document_types = {
                'policy': type_dict.get('POLICY', 0),
                'system_document': type_dict.get('SYSTEM DOCUMENT', 0),
                'procedure': type_dict.get('PROCEDURE', 0),
                'form': type_dict.get('FORM', 0),
                'ssow': type_dict.get('SSOW', 0),
                'other': type_dict.get('OTHER', 0)
            }
            
            # Calculate status percentages
            status_breakdown = {
                'draft': status_dict.get('DRAFT', 0),
                'hsse_review': status_dict.get('HSSE_REVIEW', 0),
                'ops_review': status_dict.get('OPS_REVIEW', 0),
                'md_approval': status_dict.get('MD_APPROVAL', 0),
                'approved': status_dict.get('APPROVED', 0),
                'rejected': status_dict.get('REJECTED', 0)
            }
            
            # Calculate pending approvals (documents in review stages)
            pending_approvals = (
                status_dict.get('HSSE_REVIEW', 0) + 
                status_dict.get('OPS_REVIEW', 0) + 
                status_dict.get('MD_APPROVAL', 0)
            )
            
            response_data = {
                'metrics': {
                    'total_documents': total_documents,
                    'pending_approvals': pending_approvals,
                    'change_requests': change_requests_count,
                    'approved_documents': status_dict.get('APPROVED', 0),
                    'rejected_documents': status_dict.get('REJECTED', 0),
                    'draft_documents': status_dict.get('DRAFT', 0),
                },
                'document_types': document_types,
                'status_breakdown': status_breakdown,
                'recent_activities': activities
            }
            
            return Response(response_data)
            
        except Exception as e:
            return Response(
                {"error": f"Failed to fetch dashboard data: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChangeRequestApproveAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        change_request = get_object_or_404(ChangeRequest, pk=pk)
        if not change_request.can_be_approved_by(request.user):
            return Response({'error': 'Only HSSE Manager can approve change requests.'}, status=403)
        response = request.data.get('response', '')
        try:
            change_request.approve(request.user, response)
            return Response({'status': 'Change request approved.'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class ChangeRequestRejectAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        change_request = get_object_or_404(ChangeRequest, pk=pk)
        if not change_request.can_be_rejected_by(request.user):
            return Response({'error': 'Only HSSE Manager can reject change requests.'}, status=403)
        response = request.data.get('response', '')
        try:
            change_request.reject(request.user, response)
            return Response({'status': 'Change request rejected.'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class SubmitForOpsReviewAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        doc = get_object_or_404(Document, id=pk)
        if not (doc.status == 'DRAFT' and request.user.position == 'HSSE MANAGER'):
            return Response({'error': 'Only HSSE Manager can submit for OPS review.'}, status=403)
        try:
            doc.transition_to('OPS_REVIEW', request.user)
            return Response({'status': 'Document submitted for OPS review.'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class OpsReviewAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        doc = get_object_or_404(Document, id=pk)
        action = request.data.get('action')  # 'approve' or 'reject'
        comment = request.data.get('comment', '')
        if not doc.status == 'OPS_REVIEW':
            return Response({'error': 'Document is not in OPS review stage.'}, status=400)
        if request.user.position != 'OPS MANAGER':
            return Response({'error': 'Only OPS Manager can review at this stage.'}, status=403)
        try:
            if action == 'approve':
                doc.transition_to('MD_APPROVAL', request.user, comment)
                return Response({'status': 'Document approved and sent to MD for approval.'})
            elif action == 'reject':
                doc.transition_to('REJECTED', request.user, comment)
                return Response({'status': 'Document rejected by OPS Manager.'})
            else:
                return Response({'error': 'Invalid action.'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


class MDApprovalAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        doc = get_object_or_404(Document, pk=pk)
        action_type = request.data.get('action') # 'approve' or 'reject'
        comment = request.data.get('comment', '')

        if not doc.is_md_approvable(request.user):
            raise PermissionDenied("You do not have permission to review this document.")

        if action_type == 'approve':
            doc.transition_to('APPROVED', request.user, comment)
            doc.approved_by = request.user
            doc.approved_at = timezone.now()
            doc.save()
            return Response({'status': 'Document approved by MD.'})
        elif action_type == 'reject':
            doc.transition_to('REJECTED', request.user, comment)
            doc.rejection_reason = comment
            doc.save()
            return Response({'status': 'Document rejected by MD.'})
        else:
            return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)


# =================================
# Form Template & Record Management
# =================================

class RecordViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Records (submitted forms).
    Users can create (submit) records.
    HSSE Managers can review, approve, and reject them.
    """
    queryset = Record.objects.all().order_by('-created_at')
    serializer_class = RecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.position == 'HSSE MANAGER' or user.is_staff:
            return Record.objects.all().order_by('-created_at')
        return Record.objects.filter(submitted_by=user).order_by('-created_at')

    def perform_create(self, serializer):
        # The form_document_id is expected from the request data
        serializer.save(submitted_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsHSSEManager])
    def approve(self, request, pk=None):
        record = self.get_object()
        try:
            record.approve(request.user)
            return Response({'status': 'Record approved'}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsHSSEManager])
    def reject(self, request, pk=None):
        record = self.get_object()
        serializer = RecordApprovalSerializer(data=request.data, context={'action': 'reject'})
        if serializer.is_valid():
            try:
                record.reject(request.user, reason=serializer.validated_data.get('rejection_reason', ''))
                return Response({'status': 'Record rejected'}, status=status.HTTP_200_OK)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# LawCategory Views
class LawCategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = LawCategory.objects.all()
    serializer_class = LawCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsHSSEManager()]
        return super().get_permissions()

class LawCategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LawCategory.objects.all()
    serializer_class = LawCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return super().get_permissions()

# LawResource Views
class LawResourceListCreateAPIView(generics.ListCreateAPIView):
    queryset = LawResource.objects.all()
    serializer_class = LawResourceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['country', 'category', 'jurisdiction', 'is_repealed']
    search_fields = ['title', 'summary']
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsHSSEManager()]
        return super().get_permissions()

class LawResourceRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LawResource.objects.all()
    serializer_class = LawResourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return super().get_permissions()

# LawResourceChange Views
class LawResourceChangeListCreateAPIView(generics.ListCreateAPIView):
    queryset = LawResourceChange.objects.all()
    serializer_class = LawResourceChangeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsHSSEManager()]
        return super().get_permissions()

class LawResourceChangeRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LawResourceChange.objects.all()
    serializer_class = LawResourceChangeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return super().get_permissions()

# LegalRegisterEntry Views
class LegalRegisterEntryListCreateAPIView(generics.ListCreateAPIView):
    queryset = LegalRegisterEntry.objects.all()
    serializer_class = LegalRegisterEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['country', 'category', 'legislation_reference']
    search_fields = ['title', 'legal_obligation']
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsHSSEManager()]
        return super().get_permissions()

class LegalRegisterEntryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LegalRegisterEntry.objects.all()
    serializer_class = LegalRegisterEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return super().get_permissions()

# LegalRegisterComment Views
class LegalRegisterCommentListCreateAPIView(generics.ListCreateAPIView):
    queryset = LegalRegisterComment.objects.all()
    serializer_class = LegalRegisterCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsHSSEManager()]
        return super().get_permissions()

class LegalRegisterCommentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LegalRegisterComment.objects.all()
    serializer_class = LegalRegisterCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return super().get_permissions()

# LegalRegisterDocument Views
class LegalRegisterDocumentListCreateAPIView(generics.ListCreateAPIView):
    queryset = LegalRegisterDocument.objects.all()
    serializer_class = LegalRegisterDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsHSSEManager()]
        return super().get_permissions()

class LegalRegisterDocumentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LegalRegisterDocument.objects.all()
    serializer_class = LegalRegisterDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return super().get_permissions()

# Position Views
class PositionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated]
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsHSSEManager()]
        return super().get_permissions()

class PositionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated]
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return super().get_permissions()

# LegislationTracker Views
class LegislationTrackerListCreateAPIView(generics.ListCreateAPIView):
    queryset = LegislationTracker.objects.all()
    serializer_class = LegislationTrackerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsHSSEManager()]
        return super().get_permissions()

class LegislationTrackerRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LegislationTracker.objects.all()
    serializer_class = LegislationTrackerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return super().get_permissions()

# =============================
# PPE Management Views
# =============================

class PPECategoryListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating PPE categories."""
    queryset = PPECategory.objects.all()
    serializer_class = PPECategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class PPECategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, and deleting PPE categories."""
    queryset = PPECategory.objects.all()
    serializer_class = PPECategorySerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class VendorListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating vendors."""
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'country']
    search_fields = ['name', 'contact_person', 'email']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class VendorRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, and deleting vendors."""
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class PPEPurchaseListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating PPE purchases."""
    queryset = PPEPurchase.objects.all().order_by('-purchase_date')
    serializer_class = PPEPurchaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['vendor', 'ppe_category', 'status', 'received_by']
    search_fields = ['purchase_order_number', 'invoice_number', 'notes']
    
    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class PPEPurchaseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, and deleting PPE purchases."""
    queryset = PPEPurchase.objects.all()
    serializer_class = PPEPurchaseSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class PPEInventoryListAPIView(generics.ListAPIView):
    """API endpoint for listing PPE inventory."""
    queryset = PPEInventory.objects.all()
    serializer_class = PPEInventorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['ppe_category']
    search_fields = ['ppe_category__name']


class PPEInventoryRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    """API endpoint for retrieving and updating PPE inventory."""
    queryset = PPEInventory.objects.all()
    serializer_class = PPEInventorySerializer
    permission_classes = [IsHSSEManager]


class PPEIssueListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating PPE issues."""
    queryset = PPEIssue.objects.all().order_by('-issue_date')
    serializer_class = PPEIssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'ppe_category', 'issued_by']
    search_fields = ['employee__first_name', 'employee__last_name', 'ppe_category__name']

    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class PPEIssueMyIssuesAPIView(generics.ListAPIView):
    """API endpoint for listing current user's PPE issues."""
    serializer_class = PPEIssueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['ppe_category', 'status']
    search_fields = ['ppe_category__name']

    def get_queryset(self):
        """Filter to show only current user's PPE issues."""
        return PPEIssue.objects.filter(employee=self.request.user).order_by('-issue_date')


class PPEIssueRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, and deleting PPE issues."""
    queryset = PPEIssue.objects.all()
    serializer_class = PPEIssueSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class PPERequestListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating PPE requests."""
    queryset = PPERequest.objects.all().order_by('-created_at')
    serializer_class = PPERequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'ppe_category', 'status']
    search_fields = ['employee__first_name', 'employee__last_name', 'ppe_category__name', 'reason']

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)

    def get_queryset(self):
        """Filter requests based on user role."""
        queryset = super().get_queryset()
        if self.request.user.position != 'HSSE MANAGER':
            # Regular users can only see their own requests
            queryset = queryset.filter(employee=self.request.user)
        return queryset


class PPERequestRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, and deleting PPE requests."""
    queryset = PPERequest.objects.all()
    serializer_class = PPERequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter requests based on user role."""
        queryset = super().get_queryset()
        if self.request.user.position != 'HSSE MANAGER':
            # Regular users can only see their own requests
            queryset = queryset.filter(employee=self.request.user)
        return queryset

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class PPERequestApprovalAPIView(APIView):
    """API endpoint for approving/rejecting PPE requests."""
    permission_classes = [IsHSSEManager]

    def post(self, request, pk):
        try:
            ppe_request = get_object_or_404(PPERequest, pk=pk)
            serializer = PPERequestApprovalSerializer(data=request.data)
            
            if serializer.is_valid():
                status = serializer.validated_data['status']
                rejection_reason = serializer.validated_data.get('rejection_reason', '')
                
                ppe_request.status = status
                ppe_request.approved_by = request.user
                ppe_request.approved_at = timezone.now()
                
                if status == 'REJECTED':
                    ppe_request.rejection_reason = rejection_reason
                
                ppe_request.save()
                
                # If approved, create PPE issue
                if status == 'APPROVED':
                    PPEIssue.objects.create(
                        employee=ppe_request.employee,
                        ppe_category=ppe_request.ppe_category,
                        quantity=ppe_request.quantity,
                        issue_date=timezone.now().date(),
                        expiry_date=ppe_request.ppe_category.calculate_expiry_date(),
                        issued_by=request.user,
                        notes=f"Approved from request #{ppe_request.id}"
                    )
                
                return Response({'status': f'Request {status.lower()}'})
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except PPERequest.DoesNotExist:
            return Response({"error": "PPE request not found."}, status=404)


class PPEDamageReportListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating PPE damage reports."""
    queryset = PPEDamageReport.objects.all().order_by('-reported_at')
    serializer_class = PPEDamageReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'ppe_issue__ppe_category', 'is_approved', 'replacement_issued']
    search_fields = ['employee__first_name', 'employee__last_name', 'damage_description']

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)

    def get_queryset(self):
        """Filter reports based on user role."""
        queryset = super().get_queryset()
        if self.request.user.position != 'HSSE MANAGER':
            # Regular users can only see their own reports
            queryset = queryset.filter(employee=self.request.user)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class PPEDamageReportRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, and deleting PPE damage reports."""
    queryset = PPEDamageReport.objects.all()
    serializer_class = PPEDamageReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter reports based on user role."""
        queryset = super().get_queryset()
        if self.request.user.position != 'HSSE MANAGER':
            # Regular users can only see their own reports
            queryset = queryset.filter(employee=self.request.user)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class PPEDamageReportReviewAPIView(APIView):
    """API endpoint for reviewing PPE damage reports."""
    permission_classes = [IsHSSEManager]

    def post(self, request, pk):
        try:
            damage_report = get_object_or_404(PPEDamageReport, pk=pk)
            serializer = PPEDamageReportReviewSerializer(data=request.data)
            
            if serializer.is_valid():
                is_approved = serializer.validated_data['is_approved']
                replacement_issued = serializer.validated_data.get('replacement_issued', False)
                
                damage_report.is_approved = is_approved
                damage_report.replacement_issued = replacement_issued
                damage_report.reviewed_by = request.user
                damage_report.reviewed_at = timezone.now()
                damage_report.save()
                
                return Response({'status': 'Damage report reviewed'})
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except PPEDamageReport.DoesNotExist:
            return Response({"error": "Damage report not found."}, status=404)


class PPETransferListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating PPE transfers."""
    queryset = PPETransfer.objects.all().order_by('-transfer_date')
    serializer_class = PPETransferSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['from_employee', 'to_employee', 'status']
    search_fields = ['from_employee__first_name', 'from_employee__last_name', 
                    'to_employee__first_name', 'to_employee__last_name']

    def perform_create(self, serializer):
        serializer.save(from_employee=self.request.user)

    def get_queryset(self):
        """Filter transfers based on user role."""
        queryset = super().get_queryset()
        if self.request.user.position != 'HSSE MANAGER':
            # Regular users can only see transfers involving them
            queryset = queryset.filter(
                Q(from_employee=self.request.user) | Q(to_employee=self.request.user)
            )
        return queryset


class PPETransferRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, and deleting PPE transfers."""
    queryset = PPETransfer.objects.all()
    serializer_class = PPETransferSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter transfers based on user role."""
        queryset = super().get_queryset()
        if self.request.user.position != 'HSSE MANAGER':
            # Regular users can only see transfers involving them
            queryset = queryset.filter(
                Q(from_employee=self.request.user) | Q(to_employee=self.request.user)
            )
        return queryset

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]


class PPETransferApprovalAPIView(APIView):
    """API endpoint for approving/rejecting PPE transfers."""
    permission_classes = [IsHSSEManager]

    def post(self, request, pk):
        try:
            transfer = get_object_or_404(PPETransfer, pk=pk)
            serializer = PPETransferApprovalSerializer(data=request.data)
            
            if serializer.is_valid():
                status = serializer.validated_data['status']
                rejection_reason = serializer.validated_data.get('rejection_reason', '')
                
                transfer.status = status
                transfer.approved_by = request.user
                transfer.approved_at = timezone.now()
                
                if status == 'REJECTED':
                    transfer.rejection_reason = rejection_reason
                
                transfer.save()
                
                return Response({'status': f'Transfer {status.lower()}'})
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except PPETransfer.DoesNotExist:
            return Response({"error": "PPE transfer not found."}, status=404)


class PPEReturnListCreateAPIView(generics.ListCreateAPIView):
    """API endpoint for listing and creating PPE returns."""
    queryset = PPEReturn.objects.all().order_by('-return_date')
    serializer_class = PPEReturnSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'ppe_issue__ppe_category', 'received_by']
    search_fields = ['employee__first_name', 'employee__last_name', 'return_reason']

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user, received_by=self.request.user)

    def get_queryset(self):
        """Filter returns based on user role."""
        queryset = super().get_queryset()
        if self.request.user.position != 'HSSE MANAGER':
            # Regular users can only see their own returns
            queryset = queryset.filter(employee=self.request.user)
        return queryset


class PPEReturnRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """API endpoint for retrieving, updating, and deleting PPE returns."""
    queryset = PPEReturn.objects.all()
    serializer_class = PPEReturnSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter returns based on user role."""
        queryset = super().get_queryset()
        if self.request.user.position != 'HSSE MANAGER':
            # Regular users can only see their own returns
            queryset = queryset.filter(employee=self.request.user)
        return queryset

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]


# =============================
# PPE Dashboard and Reporting Views
# =============================

class PPEStockPositionAPIView(APIView):
    """API endpoint for PPE stock position summary."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = PPECategory.objects.all()
        stock_data = []
        
        for category in categories:
            try:
                inventory = category.inventory
                total_received = PPEPurchase.objects.filter(
                    ppe_category=category
                ).aggregate(total=Sum('quantity'))['total'] or 0
                
                total_issued = PPEIssue.objects.filter(
                    ppe_category=category
                ).aggregate(total=Sum('quantity'))['total'] or 0
                
                total_damaged = PPEDamageReport.objects.filter(
                    ppe_issue__ppe_category=category,
                    is_approved=True
                ).count()
                
                # Filter expired issues in Python since is_expired is a property
                ppe_issues = PPEIssue.objects.filter(ppe_category=category)
                total_expired = sum(1 for issue in ppe_issues if issue.is_expired)
                
                stock_data.append({
                    'ppe_category': category,
                    'total_received': total_received,
                    'total_issued': total_issued,
                    'total_damaged': total_damaged,
                    'total_expired': total_expired,
                    'current_stock': inventory.current_stock,
                    'is_low_stock': inventory.is_low_stock
                })
            except PPEInventory.DoesNotExist:
                continue
        
        serializer = PPEStockPositionSerializer(stock_data, many=True, context={'request': request})
        return Response(serializer.data)


class PPEMovementAPIView(APIView):
    """API endpoint for PPE movement summary."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', 'this_month')
        
        if period == 'this_month':
            start_date = timezone.now().replace(day=1)
        elif period == 'last_month':
            start_date = (timezone.now().replace(day=1) - timezone.timedelta(days=1)).replace(day=1)
        else:
            start_date = timezone.now().replace(day=1)
        
        end_date = timezone.now()
        
        categories = PPECategory.objects.all()
        movement_data = []
        
        for category in categories:
            total_received = PPEPurchase.objects.filter(
                ppe_category=category,
                purchase_date__range=[start_date, end_date]
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            total_issued = PPEIssue.objects.filter(
                ppe_category=category,
                issue_date__range=[start_date, end_date]
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            movement_data.append({
                'ppe_category': category,
                'total_received': total_received,
                'total_issued': total_issued,
                'movement_period': period.replace('_', ' ').title()
            })
        
        serializer = PPEMovementSerializer(movement_data, many=True, context={'request': request})
        return Response(serializer.data)


class PPEMostRequestedAPIView(APIView):
    """API endpoint for most requested PPE items."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.query_params.get('period', '30')  # days
        
        start_date = timezone.now() - timezone.timedelta(days=int(period))
        
        # Get most requested PPE categories
        most_requested = PPERequest.objects.filter(
            created_at__gte=start_date
        ).values('ppe_category').annotate(
            request_count=Count('id'),
            total_quantity_requested=Sum('quantity')
        ).order_by('-request_count')[:10]
        
        data = []
        for item in most_requested:
            category = PPECategory.objects.get(id=item['ppe_category'])
            data.append({
                'ppe_category': category,
                'request_count': item['request_count'],
                'total_quantity_requested': item['total_quantity_requested']
            })
        
        serializer = PPEMostRequestedSerializer(data, many=True, context={'request': request})
        return Response(serializer.data)


class PPECostAnalysisAPIView(APIView):
    """API endpoint for PPE cost analysis."""
    permission_classes = [IsHSSEManager]

    def get(self, request):
        period = request.query_params.get('period', 'this_year')
        
        if period == 'this_year':
            start_date = timezone.now().replace(month=1, day=1)
        elif period == 'last_year':
            start_date = (timezone.now().replace(month=1, day=1) - timezone.timedelta(days=365))
        else:
            start_date = timezone.now().replace(day=1)
        
        end_date = timezone.now()
        
        categories = PPECategory.objects.all()
        cost_data = []
        
        for category in categories:
            purchases = PPEPurchase.objects.filter(
                ppe_category=category,
                purchase_date__range=[start_date, end_date]
            )
            
            total_cost = purchases.aggregate(total=Sum('total_cost'))['total'] or 0
            total_units = purchases.aggregate(total=Sum('quantity'))['total'] or 0
            avg_cost = total_cost / total_units if total_units > 0 else 0
            
            cost_data.append({
                'ppe_category': category,
                'total_cost': total_cost,
                'average_cost_per_unit': avg_cost,
                'total_units_purchased': total_units
            })
        
        serializer = PPECostAnalysisSerializer(cost_data, many=True, context={'request': request})
        return Response(serializer.data)


class PPEExpiryAlertsAPIView(APIView):
    """API endpoint for PPE expiry alerts."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days_threshold = int(request.query_params.get('days', 30))
        
        # Get PPE issues that are expiring soon or already expired
        expiring_issues = PPEIssue.objects.filter(
            expiry_date__lte=timezone.now().date() + timezone.timedelta(days=days_threshold)
        ).order_by('expiry_date')
        
        alerts = []
        for issue in expiring_issues:
            days_until_expiry = (issue.expiry_date - timezone.now().date()).days
            alerts.append({
                'ppe_issue': issue,
                'days_until_expiry': days_until_expiry,
                'is_expired': days_until_expiry < 0
            })
        
        serializer = PPEExpiryAlertSerializer(alerts, many=True, context={'request': request})
        return Response(serializer.data)


class PPELowStockAlertsAPIView(APIView):
    """API endpoint for PPE low stock alerts."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all inventories and filter by low stock in Python
        all_inventories = PPEInventory.objects.all()
        low_stock_inventories = [inv for inv in all_inventories if inv.is_low_stock]
        
        alerts = []
        for inventory in low_stock_inventories:
            alerts.append({
                'ppe_category': inventory.ppe_category,
                'current_stock': inventory.current_stock,
                'threshold': inventory.ppe_category.low_stock_threshold
            })
        
        serializer = PPELowStockAlertSerializer(alerts, many=True, context={'request': request})
        return Response(serializer.data)


class PPEUserStockAPIView(APIView):
    """API endpoint for user's current PPE stock."""
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        if user_id and request.user.position == 'HSSE MANAGER':
            user = get_object_or_404(User, id=user_id)
        else:
            user = request.user
        
        ppe_items = PPEIssue.objects.filter(
            employee=user,
            is_expired=False
        ).order_by('expiry_date')
        
        data = {
            'employee': user,
            'ppe_items': ppe_items,
            'total_items': ppe_items.count()
        }
        
        serializer = PPEUserStockSerializer(data, context={'request': request})
        return Response(serializer.data)


# =============================
# PPE Bulk Operations
# =============================

class BulkPPEIssueAPIView(APIView):
    """API endpoint for bulk PPE issuance."""
    permission_classes = [IsHSSEManager]

    def post(self, request):
        serializer = BulkPPEIssueSerializer(data=request.data)
        
        if serializer.is_valid():
            employee_ids = serializer.validated_data['employee_ids']
            ppe_category_id = serializer.validated_data['ppe_category_id']
            quantity_per_employee = serializer.validated_data['quantity_per_employee']
            issue_date = serializer.validated_data['issue_date']
            notes = serializer.validated_data.get('notes', '')
            
            try:
                ppe_category = PPECategory.objects.get(id=ppe_category_id)
                inventory = ppe_category.inventory
                
                # Check if there's enough stock
                total_quantity_needed = len(employee_ids) * quantity_per_employee
                if inventory.current_stock < total_quantity_needed:
                    return Response({
                        'error': f'Insufficient stock. Available: {inventory.current_stock}, Needed: {total_quantity_needed}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Create PPE issues for each employee
                created_issues = []
                for employee_id in employee_ids:
                    try:
                        employee = User.objects.get(id=employee_id)
                        issue = PPEIssue.objects.create(
                            employee=employee,
                            ppe_category=ppe_category,
                            quantity=quantity_per_employee,
                            issue_date=issue_date,
                            expiry_date=ppe_category.calculate_expiry_date(),
                            issued_by=request.user,
                            notes=notes
                        )
                        created_issues.append(issue)
                    except User.DoesNotExist:
                        continue
                
                return Response({
                    'message': f'Successfully issued PPE to {len(created_issues)} employees',
                    'created_count': len(created_issues)
                })
                
            except PPECategory.DoesNotExist:
                return Response({'error': 'PPE category not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BulkPPERequestApprovalAPIView(APIView):
    """API endpoint for bulk PPE request approval."""
    permission_classes = [IsHSSEManager]
    
    def post(self, request):
        serializer = BulkPPERequestApprovalSerializer(data=request.data)
        if serializer.is_valid():
            request_ids = serializer.validated_data['request_ids']
            status = serializer.validated_data['status']
            rejection_reason = serializer.validated_data.get('rejection_reason', '')
            
            requests = PPERequest.objects.filter(id__in=request_ids)
            
            for req in requests:
                req.status = status
                if status == 'APPROVED':
                    req.approved_by = request.user
                    req.approved_at = timezone.now()
                elif status == 'REJECTED':
                    req.rejection_reason = rejection_reason
                req.save()
            
            return Response({
                'message': f'{len(requests)} requests {status.lower()} successfully'
            })
        return Response(serializer.errors, status=400)


class PPEPurchaseStatusUpdateAPIView(APIView):
    """API endpoint for updating purchase order status."""
    permission_classes = [IsHSSEManager]
    
    def post(self, request, pk):
        try:
            purchase = PPEPurchase.objects.get(pk=pk)
            new_status = request.data.get('status')
            
            if new_status not in dict(PPEPurchase.STATUS_CHOICES):
                return Response({'error': 'Invalid status'}, status=400)
            
            purchase.status = new_status
            purchase.save()
            
            return Response({
                'message': f'Purchase order status updated to {new_status}',
                'status': new_status
            })
        except PPEPurchase.DoesNotExist:
            return Response({'error': 'Purchase order not found'}, status=404)


class PPEPurchaseReceiptCreateAPIView(APIView):
    """API endpoint for creating purchase receipts."""
    permission_classes = [IsHSSEManager]
    
    def post(self, request, pk):
        try:
            purchase = PPEPurchase.objects.get(pk=pk)
            
            if not purchase.can_receive:
                return Response({
                    'error': 'Purchase order cannot be received. Status must be CONFIRMED or SHIPPED.'
                }, status=400)
            
            if hasattr(purchase, 'receipt'):
                return Response({
                    'error': 'Purchase order has already been received.'
                }, status=400)
            
            serializer = PPEPurchaseReceiptSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(
                    purchase=purchase,
                    received_by=request.user
                )
                return Response({
                    'message': 'Purchase receipt created successfully',
                    'receipt': serializer.data
                })
            return Response(serializer.errors, status=400)
        except PPEPurchase.DoesNotExist:
            return Response({'error': 'Purchase order not found'}, status=404)


class PPEPurchaseReceiptListAPIView(generics.ListAPIView):
    """API endpoint for listing purchase receipts."""
    queryset = PPEPurchaseReceipt.objects.all().order_by('-received_date')
    serializer_class = PPEPurchaseReceiptSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['purchase__vendor', 'purchase__ppe_category', 'quality_check_passed']
    search_fields = ['purchase__purchase_order_number', 'notes']
    
    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return [IsAuthenticated()]

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring
    """
    health_status = {
        'status': 'healthy',
        'timestamp': None,
        'database': 'unknown',
        'cache': 'unknown',
        'celery': 'unknown',
        'version': '1.0.0'
    }
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_status['database'] = 'connected'
    except Exception as e:
        health_status['database'] = f'error: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Check cache (Redis)
    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') == 'ok':
            health_status['cache'] = 'connected'
        else:
            health_status['cache'] = 'error'
            health_status['status'] = 'unhealthy'
    except Exception as e:
        health_status['cache'] = f'error: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Check Celery (if available)
    try:
        from celery import current_app
        if current_app.control.inspect().active():
            health_status['celery'] = 'connected'
        else:
            health_status['celery'] = 'disconnected'
    except Exception as e:
        health_status['celery'] = f'error: {str(e)}'
    
    # Add timestamp
    from django.utils import timezone
    health_status['timestamp'] = timezone.now().isoformat()
    
    # Return appropriate status code
    if health_status['status'] == 'healthy':
        return Response(health_status, status=status.HTTP_200_OK)
    else:
        return Response(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['GET'])
@permission_classes([AllowAny])
def system_info(request):
    """
    System information endpoint (for debugging)
    """
    import psutil
    
    info = {
        'python_version': os.sys.version,
        'django_version': '5.0.14',
        'cpu_count': psutil.cpu_count(),
        'memory_total': psutil.virtual_memory().total,
        'memory_available': psutil.virtual_memory().available,
        'disk_usage': psutil.disk_usage('/').percent,
        'environment': 'production' if not settings.DEBUG else 'development',
    }
    
    return Response(info, status=status.HTTP_200_OK)