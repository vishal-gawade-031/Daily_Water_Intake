from rest_framework import serializers
from django.contrib.auth.models import User
from .models import WaterIntakeEntry, UserProfile, Achievement


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
    
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'daily_goal_ml', 'preferred_unit', 'created_at']
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
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True, max_length=255)
    
    class Meta:
        model = WaterIntakeEntry
        fields = ['id', 'date', 'amount_ml', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'date', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Handle None notes
        if 'notes' not in validated_data or validated_data['notes'] is None:
            validated_data['notes'] = ''
        return super().create(validated_data)
