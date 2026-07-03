from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .models import WaterIntakeEntry, UserProfile

def recalculate_user_stats(user):
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=user)
        
    entries = WaterIntakeEntry.objects.filter(user=user).order_by('-date')
    
    # 1. Total Water Consumed
    total_water = entries.aggregate(models.Sum('amount_ml'))['amount_ml__sum'] or 0
    profile.total_water_consumed = total_water
    
    # 2. Streaks Calculation
    # Get sorted list of unique dates
    unique_dates = sorted(list(set(entries.values_list('date', flat=True))), reverse=True)
    
    if not unique_dates:
        profile.current_streak = 0
        profile.longest_streak = 0
        profile.save()
        return
        
    today = timezone.now().date()
    yesterday = today - timedelta(days=1)
    
    # Check if current streak is broken
    # If the most recent entry date is not today and not yesterday, current streak is 0
    if unique_dates[0] != today and unique_dates[0] != yesterday:
        current_streak = 0
    else:
        # Walk back starting from the most recent date to see how many consecutive days there are
        current_streak = 1
        expected_date = unique_dates[0] - timedelta(days=1)
        for d in unique_dates[1:]:
            if d == expected_date:
                current_streak += 1
                expected_date = expected_date - timedelta(days=1)
            elif d > expected_date:
                # Same day or newer (should not happen due to set/sort, but safety first)
                continue
            else:
                # Gap found
                break
                
    # Longest Streak Calculation (Global across all entries)
    longest_streak = 0
    temp_streak = 0
    if unique_dates:
        temp_streak = 1
        longest_streak = 1
        for i in range(1, len(unique_dates)):
            if unique_dates[i-1] - unique_dates[i] == timedelta(days=1):
                temp_streak += 1
            else:
                longest_streak = max(longest_streak, temp_streak)
                temp_streak = 1
        longest_streak = max(longest_streak, temp_streak)
        
    profile.current_streak = current_streak
    profile.longest_streak = longest_streak
    profile.save()

@receiver(post_save, sender=WaterIntakeEntry)
def update_stats_on_save(sender, instance, **kwargs):
    """Recalculate stats when water entry is added or updated"""
    recalculate_user_stats(instance.user)

@receiver(post_delete, sender=WaterIntakeEntry)
def update_stats_on_delete(sender, instance, **kwargs):
    """Recalculate stats when water entry is deleted"""
    recalculate_user_stats(instance.user)
