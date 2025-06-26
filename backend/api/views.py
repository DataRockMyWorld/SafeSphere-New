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
from django.db.models import Q
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
from django_filters.rest_framework import DjangoFilterBackend

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
    def get_permissions(self):
        if self.request.method in ['POST']:
            return [IsHSSEManager()]
        return super().get_permissions()

class LegislationTrackerRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LegislationTracker.objects.all()
    serializer_class = LegislationTrackerSerializer
    permission_classes = [IsAuthenticated]
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsHSSEManager()]
        return super().get_permissions()