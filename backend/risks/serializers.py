"""
Serializers for Risk Management System.
"""
from rest_framework import serializers
from risks.models import (
    RiskAssessment, RiskHazard, RiskExposure, ControlBarrier,
    RiskTreatmentAction, RiskReview, RiskAttachment, RiskMatrixConfig
)
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


# =============================
# Risk Matrix Config Serializers
# =============================
class RiskMatrixConfigSerializer(serializers.ModelSerializer):
    """Serializer for risk matrix configuration."""
    
    class Meta:
        model = RiskMatrixConfig
        fields = [
            'id', 'matrix_size', 'probability_definitions', 'severity_definitions',
            'low_threshold', 'medium_threshold', 'low_risk_color', 
            'medium_risk_color', 'high_risk_color', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


# =============================
# Risk Hazard Serializers
# =============================
class RiskHazardSerializer(serializers.ModelSerializer):
    """Serializer for risk hazards."""
    
    class Meta:
        model = RiskHazard
        fields = [
            'id', 'hazard_type', 'hazard_description', 'event_description',
            'causes', 'consequences', 'impact_type', 'order'
        ]


# =============================
# Risk Exposure Serializers
# =============================
class RiskExposureSerializer(serializers.ModelSerializer):
    """Serializer for risk exposure information."""
    
    class Meta:
        model = RiskExposure
        fields = [
            'id', 'affected_personnel', 'number_exposed', 'exposure_frequency',
            'exposure_duration', 'vulnerable_groups'
        ]


# =============================
# Control Barrier Serializers
# =============================
class ControlBarrierSerializer(serializers.ModelSerializer):
    """Serializer for control barriers."""
    
    barrier_owner_detail = UserSerializer(source='barrier_owner', read_only=True)
    hierarchy_display = serializers.CharField(source='get_hierarchy_level_display', read_only=True)
    effectiveness_display = serializers.CharField(source='get_effectiveness_rating_display', read_only=True)
    is_overdue = serializers.ReadOnlyField(source='is_overdue_for_inspection')
    
    # Write-only ID for barrier owner
    barrier_owner_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='barrier_owner',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = ControlBarrier
        fields = [
            'id', 'barrier_type', 'description', 'hierarchy_level', 'hierarchy_display',
            'effectiveness_rating', 'effectiveness_display', 'evidence',
            'last_inspected_date', 'next_inspection_date', 'condition',
            'barrier_owner', 'barrier_owner_detail', 'barrier_owner_id',
            'is_overdue', 'order'
        ]
        read_only_fields = ['id', 'barrier_owner']


# =============================
# Risk Treatment Action Serializers
# =============================
class RiskTreatmentActionSerializer(serializers.ModelSerializer):
    """Serializer for risk treatment actions."""
    
    responsible_person_detail = UserSerializer(source='responsible_person', read_only=True)
    verified_by_detail = UserSerializer(source='verified_by', read_only=True)
    hierarchy_display = serializers.CharField(source='get_hierarchy_level_display', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    
    # Write-only IDs
    responsible_person_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='responsible_person',
        write_only=True,
        required=False,
        allow_null=True
    )
    verified_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='verified_by',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = RiskTreatmentAction
        fields = [
            'id', 'action_description', 'barrier_type', 'hierarchy_level', 'hierarchy_display',
            'responsible_person', 'responsible_person_detail', 'responsible_person_id',
            'target_date', 'status', 'actual_implementation_date',
            'linked_capa', 'verification_method', 'verification_date',
            'verified_by', 'verified_by_detail', 'verified_by_id',
            'is_overdue', 'days_remaining', 'order'
        ]
        read_only_fields = ['id', 'responsible_person', 'verified_by']


# =============================
# Risk Review Serializers
# =============================
class RiskReviewSerializer(serializers.ModelSerializer):
    """Serializer for risk reviews."""
    
    reviewed_by_detail = UserSerializer(source='reviewed_by', read_only=True)
    
    # Write-only ID
    reviewed_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='reviewed_by',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = RiskReview
        fields = [
            'id', 'review_date', 'reviewed_by', 'reviewed_by_detail', 'reviewed_by_id',
            'changes_made', 'previous_risk_level', 'new_risk_level',
            'controls_effective', 'new_hazards_identified', 'next_review_date',
            'comments', 'created_at'
        ]
        read_only_fields = ['id', 'reviewed_by', 'created_at']


# =============================
# Risk Attachment Serializers
# =============================
class RiskAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for risk attachments."""
    
    uploaded_by_detail = UserSerializer(source='uploaded_by', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = RiskAttachment
        fields = [
            'id', 'file', 'file_type', 'description',
            'uploaded_by', 'uploaded_by_detail', 'uploaded_at',
            'file_url', 'file_size_mb'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None
    
    def get_file_size_mb(self, obj):
        if obj.file:
            return round(obj.file.size / (1024 * 1024), 2)
        return 0


# =============================
# Risk Assessment Serializers
# =============================
class RiskAssessmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for risk assessment lists."""
    
    assessed_by_name = serializers.CharField(source='assessed_by.get_full_name', read_only=True)
    risk_owner_name = serializers.CharField(source='risk_owner.get_full_name', read_only=True)
    initial_risk_level = serializers.ReadOnlyField()
    residual_risk_level = serializers.ReadOnlyField()
    initial_risk_rating = serializers.ReadOnlyField()
    residual_risk_rating = serializers.ReadOnlyField()
    initial_risk_color = serializers.ReadOnlyField()
    residual_risk_color = serializers.ReadOnlyField()
    is_overdue_for_review = serializers.ReadOnlyField()
    days_until_review = serializers.ReadOnlyField()
    hazard_count = serializers.SerializerMethodField()
    barrier_count = serializers.SerializerMethodField()
    
    class Meta:
        model = RiskAssessment
        fields = [
            'id', 'event_number', 'status', 'version', 'assessment_date',
            'location', 'process_area', 'activity_type', 'risk_category',
            'assessed_by_name', 'risk_owner_name',
            'initial_probability', 'initial_severity', 'initial_risk_level',
            'initial_risk_rating', 'initial_risk_color',
            'residual_probability', 'residual_severity', 'residual_risk_level',
            'residual_risk_rating', 'residual_risk_color',
            'risk_acceptable', 'next_review_date', 'is_overdue_for_review',
            'days_until_review', 'hazard_count', 'barrier_count', 'created_at'
        ]
    
    def get_hazard_count(self, obj):
        return obj.hazards.count()
    
    def get_barrier_count(self, obj):
        return obj.barriers.count()


class RiskAssessmentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for risk assessments."""
    
    assessed_by = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    risk_owner = UserSerializer(read_only=True)
    
    hazards = RiskHazardSerializer(many=True, read_only=True)
    exposure = RiskExposureSerializer(read_only=True)
    barriers = ControlBarrierSerializer(many=True, read_only=True)
    treatment_actions = RiskTreatmentActionSerializer(many=True, read_only=True)
    reviews = RiskReviewSerializer(many=True, read_only=True)
    attachments = RiskAttachmentSerializer(many=True, read_only=True)
    
    # Write-only IDs
    assessed_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assessed_by',
        write_only=True,
        required=False,
        allow_null=True
    )
    approved_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='approved_by',
        write_only=True,
        required=False,
        allow_null=True
    )
    risk_owner_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='risk_owner',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    # Nested write data
    hazards_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    exposure_data = serializers.DictField(write_only=True, required=False)
    barriers_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    treatment_actions_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    # Computed fields
    initial_risk_level = serializers.ReadOnlyField()
    residual_risk_level = serializers.ReadOnlyField()
    initial_risk_rating = serializers.ReadOnlyField()
    residual_risk_rating = serializers.ReadOnlyField()
    initial_risk_color = serializers.ReadOnlyField()
    residual_risk_color = serializers.ReadOnlyField()
    is_overdue_for_review = serializers.ReadOnlyField()
    days_until_review = serializers.ReadOnlyField()
    
    class Meta:
        model = RiskAssessment
        fields = '__all__'
        read_only_fields = [
            'id', 'event_number', 'created_at', 'updated_at',
            'assessed_by', 'approved_by', 'risk_owner'
        ]
    
    def create(self, validated_data):
        """Create risk assessment with nested hazards, exposure, barriers."""
        from django.db import transaction
        
        hazards_data = validated_data.pop('hazards_data', [])
        exposure_data = validated_data.pop('exposure_data', None)
        barriers_data = validated_data.pop('barriers_data', [])
        treatment_actions_data = validated_data.pop('treatment_actions_data', [])
        
        try:
            with transaction.atomic():
                # Set assessed_by to current user
                if 'assessed_by' not in validated_data and hasattr(self.context.get('request'), 'user'):
                    validated_data['assessed_by'] = self.context['request'].user
                
                # Create risk assessment
                risk_assessment = super().create(validated_data)
                
                # Auto-set review schedule
                risk_assessment.set_review_schedule()
                risk_assessment.save()
                
                # Create hazards
                for hazard_data in hazards_data:
                    RiskHazard.objects.create(risk_assessment=risk_assessment, **hazard_data)
                
                # Create exposure
                if exposure_data:
                    RiskExposure.objects.create(risk_assessment=risk_assessment, **exposure_data)
                
                # Create barriers
                for barrier_data in barriers_data:
                    ControlBarrier.objects.create(risk_assessment=risk_assessment, **barrier_data)
                
                # Create treatment actions
                for action_data in treatment_actions_data:
                    RiskTreatmentAction.objects.create(risk_assessment=risk_assessment, **action_data)
                
                return risk_assessment
        
        except Exception as e:
            raise serializers.ValidationError(f"Error creating risk assessment: {str(e)}")
    
    def update(self, instance, validated_data):
        """Update risk assessment."""
        hazards_data = validated_data.pop('hazards_data', None)
        exposure_data = validated_data.pop('exposure_data', None)
        barriers_data = validated_data.pop('barriers_data', None)
        treatment_actions_data = validated_data.pop('treatment_actions_data', None)
        
        # Update main instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update nested objects if provided
        if hazards_data is not None:
            instance.hazards.all().delete()
            for hazard_data in hazards_data:
                RiskHazard.objects.create(risk_assessment=instance, **hazard_data)
        
        if exposure_data is not None:
            if hasattr(instance, 'exposure'):
                for attr, value in exposure_data.items():
                    setattr(instance.exposure, attr, value)
                instance.exposure.save()
            else:
                RiskExposure.objects.create(risk_assessment=instance, **exposure_data)
        
        if barriers_data is not None:
            instance.barriers.all().delete()
            for barrier_data in barriers_data:
                ControlBarrier.objects.create(risk_assessment=instance, **barrier_data)
        
        if treatment_actions_data is not None:
            instance.treatment_actions.all().delete()
            for action_data in treatment_actions_data:
                RiskTreatmentAction.objects.create(risk_assessment=instance, **action_data)
        
        return instance

