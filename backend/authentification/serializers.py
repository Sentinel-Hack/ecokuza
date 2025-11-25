from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import PointsLog, Notification, Certification, UserCertification

User = get_user_model()

class UserSignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'password')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'is_email_verified', 'points')


class NotificationSerializer(serializers.ModelSerializer):
    sender_email = serializers.CharField(source='sender.email', read_only=True, allow_null=True)
    tree_species = serializers.CharField(source='tree_record.species', read_only=True, allow_null=True)
    
    class Meta:
        model = Notification
        fields = ('id', 'notification_type', 'title', 'message', 'sender', 'sender_email', 'tree_record', 'tree_species', 'points_awarded', 'is_read', 'created_at', 'read_at')
        read_only_fields = ('id', 'sender_email', 'tree_species', 'created_at', 'read_at')


class PointsLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    points_type_display = serializers.CharField(source='get_points_type_display', read_only=True)
    tree_species = serializers.CharField(source='tree_record.species', read_only=True, allow_null=True)
    
    class Meta:
        model = PointsLog
        fields = ('id', 'user', 'user_email', 'points', 'points_type', 'points_type_display', 'description', 'tree_record', 'tree_species', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'user_email', 'created_at', 'updated_at')


class LeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for leaderboard entries (ranking users by points)."""
    rank = serializers.SerializerMethodField()
    tree_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'points', 'rank', 'tree_count')
    
    def get_rank(self, obj):
        """Get user's rank in leaderboard (computed at query time)."""
        return getattr(obj, 'rank', None)
    
    def get_tree_count(self, obj):
        """Count verified trees for this user."""
        return obj.tree_records.filter(verified=True).count()


class CertificationSerializer(serializers.ModelSerializer):
    """Serializer for available certifications."""
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = Certification
        fields = ('id', 'name', 'description', 'icon', 'level', 'level_display', 'required_points', 'required_trees', 'required_verification_rate')


class UserCertificationSerializer(serializers.ModelSerializer):
    """Serializer for earned certifications."""
    certification = CertificationSerializer(read_only=True)
    certification_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = UserCertification
        fields = ('id', 'certification', 'certification_id', 'earned_at', 'points_at_earning')
        read_only_fields = ('id', 'earned_at', 'points_at_earning')


