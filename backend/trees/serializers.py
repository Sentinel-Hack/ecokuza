from rest_framework import serializers
from .models import TreeRecord


class TreeRecordSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    record_type_display = serializers.CharField(source='get_record_type_display', read_only=True)
    tree_type_display = serializers.CharField(source='get_tree_type_display', read_only=True)
    tree_id = serializers.IntegerField(write_only=True, required=False, help_text='When creating an update record, set this to the original tree record id')
    # Aliases for frontend field names
    date = serializers.DateField(write_only=True, required=False, help_text='Alias for observation_date')
    height = serializers.FloatField(write_only=True, required=False, help_text='Alias for height_cm')
    
    class Meta:
        model = TreeRecord
        fields = [
            'id',
            'user',
            'user_email',
            'record_type',
            'record_type_display',
            'tree_id',
            'parent',
            'observation_date',
            'height_cm',
            'health_notes',
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
            'parent',
            'observation_date',
            'height_cm',
        ]

    def create(self, validated_data):
        # Accept tree_id as a write-only helper to attach parent
        tree_id = validated_data.pop('tree_id', None)
        # Support aliases from frontend
        date_val = validated_data.pop('date', None)
        height_val = validated_data.pop('height', None)
        parent = None
        if tree_id:
            from .models import TreeRecord
            try:
                parent = TreeRecord.objects.get(pk=tree_id)
            except TreeRecord.DoesNotExist:
                parent = None

        # The view will set the user via serializer.save(user=request.user)
        instance = super().create(validated_data)
        changed = False
        if parent:
            instance.parent = parent
            changed = True
        if date_val:
            instance.observation_date = date_val
            changed = True
        if height_val is not None:
            instance.height_cm = height_val
            changed = True
        if changed:
            instance.save()
        return instance
