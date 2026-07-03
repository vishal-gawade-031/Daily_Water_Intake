from rest_framework import serializers
from django.contrib.auth.models import User
from .models import WaterIntakeEntry, UserProfile, Achievement, Notification, SystemSetting, ActivityLog


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User registration and profile"""
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with goals and preferences"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    is_staff = serializers.BooleanField(source='user.is_staff', read_only=True)
    is_superuser = serializers.BooleanField(source='user.is_superuser', read_only=True)
    current_streak = serializers.IntegerField(read_only=True)
    longest_streak = serializers.IntegerField(read_only=True)
    total_water_consumed = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'is_staff', 'is_superuser', 'daily_goal_ml', 'preferred_unit', 'current_streak', 'longest_streak', 'total_water_consumed', 'created_at']
        read_only_fields = ['created_at']


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for user achievements and badges"""
    achievement_name = serializers.CharField(source='get_achievement_type_display', read_only=True)
    
    class Meta:
        model = Achievement
        fields = ['id', 'achievement_type', 'achievement_name', 'achieved_at']
        read_only_fields = ['id', 'achieved_at']


class WaterIntakeEntrySerializer(serializers.ModelSerializer):
    """Serializer for water intake entries"""
    amount_ml = serializers.IntegerField(min_value=1, max_value=5000)
    date = serializers.DateField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=255)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    daily_goal = serializers.IntegerField(source='user.profile.daily_goal_ml', read_only=True)
    
    class Meta:
        model = WaterIntakeEntry
        fields = ['id', 'username', 'email', 'date', 'amount_ml', 'notes', 'daily_goal', 'created_at', 'updated_at']
        read_only_fields = ['id', 'username', 'email', 'daily_goal', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Handle None notes
        if 'notes' not in validated_data or validated_data['notes'] is None:
            validated_data['notes'] = ''
        return super().create(validated_data)


class AdminWaterIntakeEntrySerializer(WaterIntakeEntrySerializer):
    """Admin serializer supporting record creation for any user."""
    user_id = serializers.IntegerField(write_only=True, required=False)

    class Meta(WaterIntakeEntrySerializer.Meta):
        fields = WaterIntakeEntrySerializer.Meta.fields + ['user_id']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id', None)
        if user_id is None:
            raise serializers.ValidationError({'user_id': 'This field is required.'})
        user = User.objects.get(pk=user_id)
        validated_data['user'] = user
        if 'notes' not in validated_data or validated_data['notes'] is None:
            validated_data['notes'] = ''
        if 'date' not in validated_data:
            from django.utils import timezone
            validated_data['date'] = timezone.now().date()
        return super(WaterIntakeEntrySerializer, self).create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notifications"""
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'sender', 'sender_username', 'is_global', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']


class SystemSettingSerializer(serializers.ModelSerializer):
    """Serializer for System Settings"""
    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value']
        read_only_fields = ['id']


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for Activity Log (Audit Trail)"""
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'action', 'user', 'username', 'ip_address', 'details', 'created_at']
        read_only_fields = ['id', 'created_at']


class AdminUserSerializer(serializers.ModelSerializer):
    """Detailed User Serializer for Admin User Management"""
    daily_goal_ml = serializers.IntegerField(source='profile.daily_goal_ml')
    preferred_unit = serializers.CharField(source='profile.preferred_unit')
    current_streak = serializers.IntegerField(source='profile.current_streak', read_only=True)
    longest_streak = serializers.IntegerField(source='profile.longest_streak', read_only=True)
    total_water_consumed = serializers.IntegerField(source='profile.total_water_consumed', read_only=True)
    created_at = serializers.DateTimeField(source='profile.created_at', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser', 'daily_goal_ml', 'preferred_unit', 'current_streak', 'longest_streak', 'total_water_consumed', 'created_at', 'last_login']
        read_only_fields = ['id', 'current_streak', 'longest_streak', 'total_water_consumed', 'created_at', 'last_login']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        daily_goal_ml = profile_data.get('daily_goal_ml', None)
        preferred_unit = profile_data.get('preferred_unit', None)
        
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.is_superuser = validated_data.get('is_superuser', instance.is_superuser)
        instance.save()

        # Update associated profile
        profile = instance.profile
        if daily_goal_ml is not None:
            profile.daily_goal_ml = daily_goal_ml
        if preferred_unit is not None:
            profile.preferred_unit = preferred_unit
        profile.save()
        
        return instance

