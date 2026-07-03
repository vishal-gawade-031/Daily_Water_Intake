from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta


class UserProfile(models.Model):
    """Extended user profile with water intake goals and preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    daily_goal_ml = models.PositiveIntegerField(default=2000)
    preferred_unit = models.CharField(max_length=10, default='ml', choices=[('ml', 'Milliliters'), ('oz', 'Fluid Ounces')])
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    total_water_consumed = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create UserProfile when a new User is created"""
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save UserProfile when User is saved"""
    try:
        instance.profile.save()
    except UserProfile.DoesNotExist:
        UserProfile.objects.create(user=instance)


class WaterIntakeEntry(models.Model):
    """Track daily water intake entries"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='water_intakes')
    date = models.DateField(db_index=True)
    amount_ml = models.PositiveIntegerField()
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]
        unique_together = [['user', 'date']]  # One entry per day per user

    def __str__(self):
        return f"{self.user.username} - {self.date}: {self.amount_ml}ml"


class Achievement(models.Model):
    """Achievement badges for user motivation"""
    ACHIEVEMENT_TYPES = [
        ('first_day', 'First Day Champion'),
        ('streak_3', '3-Day Streak'),
        ('streak_7', 'Weekly Warrior'),
        ('goal_crusher', 'Goal Crusher'),
        ('hydration_hero', 'Hydration Hero'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    achieved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['user', 'achievement_type']]
        ordering = ['-achieved_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_achievement_type_display()}"


class Feedback(models.Model):
    """User submitted feedback"""
    STATUS_CHOICES = [
        ('unread', 'Unread'),
        ('pending', 'Pending'),
        ('resolved', 'Resolved'),
    ]
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='feedbacks')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    reply = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unread')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback from {self.user.username if self.user else 'Anonymous'} - {self.subject}"


class Notification(models.Model):
    """System and admin notifications sent to users"""
    TYPE_CHOICES = [
        ('reminder', 'Drink Water Reminder'),
        ('maintenance', 'Maintenance Notice'),
        ('health_tip', 'Health Tip'),
        ('congrats', 'Congratulations'),
        ('announcement', 'General Announcement'),
    ]
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    is_global = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()} - {self.title}"


class SystemSetting(models.Model):
    """Global system configuration settings"""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()

    def __str__(self):
        return f"{self.key}: {self.value}"


class ActivityLog(models.Model):
    """Audit logs tracking admin and key user activities"""
    action = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} by {self.user.username if self.user else 'System'} at {self.created_at}"

