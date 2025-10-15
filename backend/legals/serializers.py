from rest_framework import serializers
from .models import (
    LawCategory, LawResource, LawResourceChange,
    LegalRegisterEntry, LegalRegisterComment, LegalRegisterDocument, Position, LegislationTracker
)

class LawCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LawCategory
        fields = '__all__'

class LawResourceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    related_obligations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LawResource
        fields = '__all__'
    
    def get_related_obligations_count(self, obj):
        """Count obligations that reference this law"""
        return obj.legal_register_entries.count()

class LawResourceChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LawResourceChange
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = '__all__'

class LegalRegisterEntrySerializer(serializers.ModelSerializer):
    assigned_to = PositionSerializer(many=True, read_only=True)
    assigned_to_ids = serializers.PrimaryKeyRelatedField(
        queryset=Position.objects.all(), many=True, write_only=True, source='assigned_to'
    )
    class Meta:
        model = LegalRegisterEntry
        fields = '__all__'

class LegalRegisterCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalRegisterComment
        fields = '__all__'

class LegalRegisterDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalRegisterDocument
        fields = '__all__'

class LegislationTrackerSerializer(serializers.ModelSerializer):
    days_left = serializers.ReadOnlyField()
    evidence_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LegislationTracker
        fields = '__all__'
    
    def get_evidence_url(self, obj):
        if obj.evidence:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.evidence.url)
            return obj.evidence.url
        return None 