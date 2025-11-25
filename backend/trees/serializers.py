from rest_framework import serializers
from .models import TreeRecord


class TreeRecordSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    record_type_display = serializers.CharField(source='get_record_type_display', read_only=True)
    tree_type_display = serializers.CharField(source='get_tree_type_display', read_only=True)
    
    class Meta:
        model = TreeRecord
        fields = [
            'id',
            'user',
            'user_email',
            'record_type',
            'record_type_display',
            'species',
            'tree_type',
            'tree_type_display',
            'location_description',
            'latitude',
            'longitude',
            'gps_altitude',
            'gps_speed',
            'gps_img_direction',
            'photo',
            'photo_datetime_original',
            'photo_datetime_digitized',
            'photo_datetime',
            'notes',
            # Authenticity & Verification fields
            'authenticity_score',
            'is_authentic_image',
            'ai_tree_type',
            'health_assessment',
            'image_quality',
            'gps_validation',
            'ai_analysis',
            'ai_confidence',
            'verified',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'user_email',
            'created_at',
            'updated_at',
            'photo_datetime_original',
            'photo_datetime_digitized',
            'photo_datetime',
            # AI analysis fields are read-only (auto-generated)
            'authenticity_score',
            'is_authentic_image',
            'ai_tree_type',
            'health_assessment',
            'image_quality',
            'gps_validation',
            'ai_analysis',
            'ai_confidence',
        ]
