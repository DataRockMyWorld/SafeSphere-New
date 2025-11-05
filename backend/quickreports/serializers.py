from rest_framework import serializers
from .models import QuickReport
from accounts.serializers import UserMeSerializer


class QuickReportSerializer(serializers.ModelSerializer):
    reported_by = UserMeSerializer(read_only=True)
    reviewed_by = UserMeSerializer(read_only=True)
    photo_evidence_url = serializers.SerializerMethodField()
    additional_document_url = serializers.SerializerMethodField()
    created_record_number = serializers.SerializerMethodField()
    
    class Meta:
        model = QuickReport
        fields = [
            'id', 'report_number', 'report_type', 'title', 'description',
            'location', 'incident_date', 'severity', 'reported_by',
            'persons_involved', 'witnesses', 'immediate_actions_taken',
            'contributing_factors', 'photo_evidence', 'photo_evidence_url',
            'additional_document', 'additional_document_url', 'status',
            'created_at', 'updated_at', 'reviewed_by', 'reviewed_at',
            'review_comments', 'rejection_reason', 'created_record',
            'created_record_number'
        ]
        read_only_fields = [
            'report_number', 'reported_by', 'status', 'created_at', 'updated_at',
            'reviewed_by', 'reviewed_at', 'review_comments', 'rejection_reason',
            'created_record'
        ]
    
    def get_photo_evidence_url(self, obj):
        if obj.photo_evidence:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo_evidence.url)
            return obj.photo_evidence.url
        return None
    
    def get_additional_document_url(self, obj):
        if obj.additional_document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.additional_document.url)
            return obj.additional_document.url
        return None
    
    def get_created_record_number(self, obj):
        if obj.created_record:
            return obj.created_record.record_number
        return None
    
    def create(self, validated_data):
        validated_data['reported_by'] = self.context['request'].user
        return super().create(validated_data)


class QuickReportReviewSerializer(serializers.Serializer):
    """Serializer for reviewing (approving/rejecting) quick reports."""
    action = serializers.ChoiceField(choices=['approve', 'reject'], required=True)
    comments = serializers.CharField(required=False, allow_blank=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        if data['action'] == 'reject' and not data.get('rejection_reason'):
            raise serializers.ValidationError({
                'rejection_reason': 'Rejection reason is required when rejecting a report.'
            })
        return data

