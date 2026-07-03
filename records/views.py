from django.db import transaction, models
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import ExtractHour
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import timedelta
import csv
import shutil
import os

from .models import WaterIntakeEntry, UserProfile, Achievement, Notification, SystemSetting, ActivityLog
from .serializers import (
    WaterIntakeEntrySerializer, 
    UserSerializer, 
    UserProfileSerializer,
    AchievementSerializer,
    AdminWaterIntakeEntrySerializer,
    NotificationSerializer,
    SystemSettingSerializer,
    ActivityLogSerializer,
    AdminUserSerializer
)

# Helper function for audit logging
def log_activity(user, action, ip_address=None, details=""):
    ActivityLog.objects.create(
        user=user,
        action=action,
        ip_address=ip_address,
        details=details
    )

# JWT Authentication Custom Serializers and Views
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user info"""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view using JWT"""
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint"""
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            log_activity(user, "USER_REGISTER", request.META.get('REMOTE_ADDR'), "User registered successfully.")
            return Response({
                'user': serializer.data,
                'message': 'User created successfully. Please login.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout endpoint"""
    log_activity(request.user, "USER_LOGOUT", request.META.get('REMOTE_ADDR'), "User logged out.")
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user's profile"""
    profile = request.user.profile
    serializer = UserProfileSerializer(profile)
    return Response(serializer.data)

class WaterIntakeEntryViewSet(viewsets.ViewSet):
    """CRUD operations for water intake entries"""
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """List water intake entries for the current user"""
        qs = WaterIntakeEntry.objects.filter(user=request.user)
        date = request.query_params.get('date')
        if date:
            qs = qs.filter(date=date)
        serializer = WaterIntakeEntrySerializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create or update a user's entry for the requested date."""
        serializer = WaterIntakeEntrySerializer(data=request.data)
        if serializer.is_valid():
            amount_ml = serializer.validated_data['amount_ml']
            notes = serializer.validated_data.get('notes')
            entry_date = serializer.validated_data.get('date', timezone.now().date())

            with transaction.atomic():
                entry = WaterIntakeEntry.objects.select_for_update().filter(
                    user=request.user,
                    date=entry_date,
                ).first()

                if entry:
                    entry.amount_ml += amount_ml
                    if notes:
                        entry.notes = notes
                    entry.save()
                    response_status = status.HTTP_200_OK
                else:
                    entry = WaterIntakeEntry.objects.create(
                        user=request.user,
                        date=entry_date,
                        amount_ml=amount_ml,
                        notes=notes or '',
                    )
                    response_status = status.HTTP_201_CREATED
            
            check_and_award_achievements(request.user)
            response_serializer = WaterIntakeEntrySerializer(entry)
            return Response(response_serializer.data, status=response_status)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        entry = get_object_or_404(WaterIntakeEntry, pk=pk, user=request.user)
        serializer = WaterIntakeEntrySerializer(entry)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        entry = get_object_or_404(WaterIntakeEntry, pk=pk, user=request.user)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_summary(request):
    """Get today's water intake summary"""
    today = timezone.now().date()
    entries = WaterIntakeEntry.objects.filter(user=request.user, date=today)
    total_ml = entries.aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
    daily_goal = request.user.profile.daily_goal_ml
    
    return Response({
        'date': today,
        'total_ml': total_ml,
        'daily_goal': daily_goal,
        'remaining_ml': max(0, daily_goal - total_ml),
        'percentage': min(100, int((total_ml / daily_goal) * 100)) if daily_goal > 0 else 0,
        'entry_count': entries.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seven_day_analytics(request):
    """Get last 7 days of water intake data"""
    today = timezone.now().date()
    start_date = today - timedelta(days=6)
    
    entries = WaterIntakeEntry.objects.filter(
        user=request.user,
        date__gte=start_date,
        date__lte=today
    ).values('date').annotate(total=Sum('amount_ml')).order_by('date')
    
    daily_goal = request.user.profile.daily_goal_ml
    data = []
    
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        entry = next((e for e in entries if e['date'] == current_date), None)
        total = entry['total'] if entry else 0
        
        data.append({
            'date': current_date,
            'total_ml': total,
            'goal_ml': daily_goal,
            'percentage': min(100, int((total / daily_goal) * 100)) if daily_goal > 0 else 0
        })
    return Response(data)

def check_and_award_achievements(user):
    today = timezone.now().date()
    if not Achievement.objects.filter(user=user, achievement_type='first_day').exists():
        if WaterIntakeEntry.objects.filter(user=user, date=today).exists():
            Achievement.objects.create(user=user, achievement_type='first_day')
    if not Achievement.objects.filter(user=user, achievement_type='streak_3').exists():
        if has_n_day_streak(user, 3):
            Achievement.objects.create(user=user, achievement_type='streak_3')
    if not Achievement.objects.filter(user=user, achievement_type='streak_7').exists():
        if has_n_day_streak(user, 7):
            Achievement.objects.create(user=user, achievement_type='streak_7')
    if not Achievement.objects.filter(user=user, achievement_type='goal_crusher').exists():
        if count_goal_days(user) >= 5:
            Achievement.objects.create(user=user, achievement_type='goal_crusher')
    if not Achievement.objects.filter(user=user, achievement_type='hydration_hero').exists():
        total = WaterIntakeEntry.objects.filter(user=user).aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
        if total >= 50000:
            Achievement.objects.create(user=user, achievement_type='hydration_hero')

def has_n_day_streak(user, n):
    today = timezone.now().date()
    for i in range(n):
        check_date = today - timedelta(days=i)
        if not WaterIntakeEntry.objects.filter(user=user, date=check_date).exists():
            return False
    return True

def count_goal_days(user):
    goal = user.profile.daily_goal_ml
    entries = WaterIntakeEntry.objects.filter(user=user).values('date').annotate(total=Sum('amount_ml'))
    goal_days = sum(1 for e in entries if e['total'] >= goal)
    return goal_days

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_achievements(request):
    achievements = Achievement.objects.filter(user=request.user)
    serializer = AchievementSerializer(achievements, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coaching_message(request):
    today = timezone.now().date()
    entries = WaterIntakeEntry.objects.filter(user=request.user, date=today)
    total_ml = entries.aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
    daily_goal = request.user.profile.daily_goal_ml
    percentage = min(100, int((total_ml / daily_goal) * 100)) if daily_goal > 0 else 0
    
    messages = {
        0: "💧 Let's start hydrating! Drink some water now to kickstart your day.",
        25: "🌊 Great start! You're making progress. Keep it up!",
        50: "💪 Halfway there! You're doing amazing. Keep drinking!",
        75: "🎯 Almost at your goal! Just a little bit more!",
        100: "🎉 Congratulations! You've reached your daily water goal! Stay hydrated!"
    }
    
    message = messages[0]
    for threshold in sorted(messages.keys(), reverse=True):
        if percentage >= threshold:
            message = messages[threshold]
            break
            
    return Response({
        'message': message,
        'percentage': percentage,
        'current_ml': total_ml,
        'goal_ml': daily_goal
    })

# ================= ADMIN VIEWS =================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"detail": "Permission denied"}, status=403)
        
    today = timezone.now().date()
    one_week_ago = today - timedelta(days=7)
    
    total_users = User.objects.count()
    active_users = WaterIntakeEntry.objects.filter(date__gte=one_week_ago).values('user').distinct().count()
    total_records = WaterIntakeEntry.objects.count()
    today_entries = WaterIntakeEntry.objects.filter(date=today).count()
    
    today_entries_qs = WaterIntakeEntry.objects.filter(date=today)
    completed_today = 0
    for entry in today_entries_qs:
        if entry.amount_ml >= entry.user.profile.daily_goal_ml:
            completed_today += 1
            
    avg_daily_intake = WaterIntakeEntry.objects.aggregate(Avg('amount_ml'))['amount_ml__avg'] or 0
    users_logged_today = WaterIntakeEntry.objects.filter(date=today).values('user').distinct().count()
    users_below_goal = max(0, users_logged_today - completed_today)
    
    total_percentage = 0
    total_profiles = UserProfile.objects.all()
    for p in total_profiles:
        today_water = WaterIntakeEntry.objects.filter(user=p.user, date=today).aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
        goal = p.daily_goal_ml
        if goal > 0:
            total_percentage += min(100, int((today_water / goal) * 100))
    avg_goal_completion_pct = int(total_percentage / total_users) if total_users > 0 else 0
    
    new_users_week = User.objects.filter(date_joined__gte=timezone.now() - timedelta(days=7)).count()
    
    recent_users = WaterIntakeEntry.objects.filter(date__gte=one_week_ago).values_list('user_id', flat=True).distinct()
    inactive_users_list = User.objects.exclude(id__in=recent_users).exclude(is_staff=True).values('id', 'username', 'email', 'last_login')[:10]
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'total_records': total_records,
        'today_entries': today_entries,
        'completed_today': completed_today,
        'avg_daily_intake': int(avg_daily_intake),
        'users_below_goal': users_below_goal,
        'avg_goal_completion_pct': avg_goal_completion_pct,
        'new_users_week': new_users_week,
        'inactive_users': list(inactive_users_list)
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_charts(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"detail": "Permission denied"}, status=403)
        
    today = timezone.now().date()
    
    water_7_days = []
    for i in range(7):
        d = today - timedelta(days=6-i)
        total = WaterIntakeEntry.objects.filter(date=d).aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
        water_7_days.append({'date': d.strftime('%Y-%m-%d'), 'amount': total})
        
    water_30_days = []
    for i in range(30):
        d = today - timedelta(days=29-i)
        total = WaterIntakeEntry.objects.filter(date=d).aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
        water_30_days.append({'date': d.strftime('%Y-%m-%d'), 'amount': total})
        
    goal_completion_rate = []
    total_users = User.objects.count()
    for i in range(7):
        d = today - timedelta(days=6-i)
        completed = 0
        entries_d = WaterIntakeEntry.objects.filter(date=d)
        for entry in entries_d:
            if entry.amount_ml >= entry.user.profile.daily_goal_ml:
                completed += 1
        rate = int((completed / total_users) * 100) if total_users > 0 else 0
        goal_completion_rate.append({'date': d.strftime('%Y-%m-%d'), 'rate': rate})
        
    dau = []
    for i in range(7):
        d = today - timedelta(days=6-i)
        count = WaterIntakeEntry.objects.filter(date=d).values('user').distinct().count()
        dau.append({'date': d.strftime('%Y-%m-%d'), 'count': count})
        
    user_growth = []
    for i in range(4):
        start = today - timedelta(days=(4-i)*7)
        end = today - timedelta(days=(3-i)*7)
        count = User.objects.filter(date_joined__gte=start, date_joined__lt=end).count()
        user_growth.append({'week': f"Week {i+1}", 'new_users': count})
        
    top_users = UserProfile.objects.select_related('user').order_by('-total_water_consumed')[:10]
    top_10 = [{
        'username': p.user.username,
        'total_water': p.total_water_consumed,
        'streak': p.current_streak
    } for p in top_users]
    
    active_hours = WaterIntakeEntry.objects.annotate(hour=ExtractHour('created_at')).values('hour').annotate(count=Count('id')).order_by('hour')
    active_hours_data = [{'hour': f"{h['hour']}:00", 'count': h['count']} for h in active_hours]
    
    intakes = WaterIntakeEntry.objects.all().values_list('amount_ml', flat=True)
    dist_0_1 = sum(1 for a in intakes if a <= 1000)
    dist_1_2 = sum(1 for a in intakes if 1000 < a <= 2000)
    dist_2_plus = sum(1 for a in intakes if a > 2000)
    distribution = [
        {'range': '0 - 1L', 'count': dist_0_1},
        {'range': '1L - 2L', 'count': dist_1_2},
        {'range': '2L+', 'count': dist_2_plus}
    ]
    
    total_water = UserProfile.objects.aggregate(Sum('total_water_consumed'))['total_water_consumed__sum'] or 0
    avg_water_per_user = int(total_water / total_users) if total_users > 0 else 0

    monthly_user_growth = []
    for i in range(6):
        month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        if i > 0:
            next_month = (month_start + timedelta(days=32)).replace(day=1)
        else:
            next_month = today + timedelta(days=1)
        count = User.objects.filter(date_joined__gte=month_start, date_joined__lt=next_month).count()
        monthly_user_growth.insert(0, {
            'month': month_start.strftime('%b %Y'),
            'new_users': count
        })

    weekday_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    heatmap = []
    start_heatmap = today - timedelta(days=27)
    entries_28d = WaterIntakeEntry.objects.filter(date__gte=start_heatmap)
    max_cell_total = 1
    for week in range(4):
        for day_idx in range(7):
            cell_date = start_heatmap + timedelta(days=week * 7 + day_idx)
            if cell_date > today:
                total_cell = 0
            else:
                total_cell = entries_28d.filter(date=cell_date).aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
            max_cell_total = max(max_cell_total, total_cell)
            heatmap.append({
                'day': weekday_labels[cell_date.weekday()],
                'week': week + 1,
                'date': cell_date.strftime('%Y-%m-%d'),
                'total': total_cell,
            })
    for cell in heatmap:
        cell['intensity'] = round(cell['total'] / max_cell_total, 2)
    
    return Response({
        'water_7_days': water_7_days,
        'water_30_days': water_30_days,
        'goal_completion_rate': goal_completion_rate,
        'dau': dau,
        'user_growth': user_growth,
        'monthly_user_growth': monthly_user_growth,
        'top_10': top_10,
        'active_hours': active_hours_data,
        'distribution': distribution,
        'avg_water_per_user': avg_water_per_user,
        'heatmap': heatmap,
    })

class AdminUserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            return User.objects.none()
            
        qs = User.objects.all().select_related('profile').order_by('id')
        
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                models.Q(username__icontains=search) | 
                models.Q(email__icontains=search) | 
                models.Q(first_name__icontains=search) | 
                models.Q(last_name__icontains=search)
            )
            
        status_filter = self.request.query_params.get('status')
        if status_filter == 'active':
            qs = qs.filter(is_active=True)
        elif status_filter == 'inactive':
            qs = qs.filter(is_active=False)
            
        role_filter = self.request.query_params.get('role')
        if role_filter == 'admin':
            qs = qs.filter(is_staff=True)
        elif role_filter == 'user':
            qs = qs.filter(is_staff=False)
            
        sort_by = self.request.query_params.get('sort_by')
        if sort_by:
            if sort_by == 'username':
                qs = qs.order_by('username')
            elif sort_by == 'email':
                qs = qs.order_by('email')
            elif sort_by == 'streak':
                qs = qs.order_by('-profile__current_streak')
            elif sort_by == 'longest_streak':
                qs = qs.order_by('-profile__longest_streak')
            elif sort_by == 'total_water':
                qs = qs.order_by('-profile__total_water_consumed')
            elif sort_by == 'date_joined':
                qs = qs.order_by('-date_joined')
        return qs

    def perform_update(self, serializer):
        user = serializer.save()
        log_activity(self.request.user, "USER_UPDATED", self.request.META.get('REMOTE_ADDR'), f"Updated user {user.username}.")

    def perform_destroy(self, instance):
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only super admins can delete users")
        log_activity(self.request.user, "USER_DELETED", self.request.META.get('REMOTE_ADDR'), f"Deleted user {instance.username}")
        instance.delete()

    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        log_activity(request.user, "USER_UPDATED", request.META.get('REMOTE_ADDR'), f"Toggled active status of user {user.username} to {user.is_active}")
        return Response({"status": "success", "is_active": user.is_active})

    @action(detail=True, methods=['post'], url_path='reset-goal')
    def reset_goal(self, request, pk=None):
        user = self.get_object()
        profile = user.profile
        profile.daily_goal_ml = int(request.data.get('daily_goal_ml', 2000))
        profile.save()
        log_activity(request.user, "USER_UPDATED", request.META.get('REMOTE_ADDR'), f"Reset daily goal of user {user.username} to {profile.daily_goal_ml}ml")
        return Response({"status": "success", "daily_goal_ml": profile.daily_goal_ml})

    @action(detail=True, methods=['get'], url_path='history')
    def user_history(self, request, pk=None):
        user = self.get_object()
        entries = WaterIntakeEntry.objects.filter(user=user).order_by('-date')
        serializer = WaterIntakeEntrySerializer(entries, many=True)
        return Response(serializer.data)

class AdminWaterRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AdminWaterIntakeEntrySerializer
    queryset = WaterIntakeEntry.objects.all()

    def get_queryset(self):
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            return WaterIntakeEntry.objects.none()
            
        qs = WaterIntakeEntry.objects.all().select_related('user', 'user__profile')
        
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                models.Q(user__username__icontains=search) | 
                models.Q(user__email__icontains=search) |
                models.Q(notes__icontains=search)
            )
            
        date = self.request.query_params.get('date')
        if date:
            qs = qs.filter(date=date)
            
        user_id = self.request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user_id=user_id)
            
        min_amount = self.request.query_params.get('min_amount')
        if min_amount:
            qs = qs.filter(amount_ml__gte=min_amount)
        max_amount = self.request.query_params.get('max_amount')
        if max_amount:
            qs = qs.filter(amount_ml__lte=max_amount)
            
        sort_by = self.request.query_params.get('sort_by')
        if sort_by == 'highest':
            qs = qs.order_by('-amount_ml')
        elif sort_by == 'lowest':
            qs = qs.order_by('amount_ml')
        else:
            qs = qs.order_by('-date', '-created_at')
            
        return qs

    def perform_create(self, serializer):
        entry = serializer.save()
        log_activity(self.request.user, "WATER_RECORD_CREATED", self.request.META.get('REMOTE_ADDR'), f"Created water record for {entry.user.username} on {entry.date} ({entry.amount_ml}ml)")

    def perform_update(self, serializer):
        entry = serializer.save()
        log_activity(self.request.user, "WATER_RECORD_UPDATED", self.request.META.get('REMOTE_ADDR'), f"Updated water record for {entry.user.username} on {entry.date} to {entry.amount_ml}ml")

    def perform_destroy(self, instance):
        log_activity(self.request.user, "WATER_RECORD_DELETED", self.request.META.get('REMOTE_ADDR'), f"Deleted water record for {instance.user.username} on {instance.date} ({instance.amount_ml}ml)")
        instance.delete()

class AdminNotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
    pagination_class = None

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Notification.objects.all().select_related('sender')
        return Notification.objects.filter(is_global=True)

    def perform_create(self, serializer):
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            raise PermissionError("Only admins can send notifications")
        notification = serializer.save(sender=self.request.user)
        log_activity(self.request.user, "NOTIFICATION_SENT", self.request.META.get('REMOTE_ADDR'), f"Sent notification: {notification.title}")

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def system_settings(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"detail": "Permission denied"}, status=403)
        
    if request.method == 'GET':
        settings_qs = SystemSetting.objects.all()
        data = {s.key: s.value for s in settings_qs}
        defaults = {
            'default_daily_goal_ml': '2000',
            'reminder_interval_mins': '60',
            'app_name': 'Water Intake Tracker',
            'app_logo': '',
            'theme': 'dark',
            'enable_notifications': 'true',
            'maintenance_mode': 'false',
            'privacy_policy': 'Privacy Policy content here...',
            'terms_of_service': 'Terms of Service content here...',
            'about_app': 'About this app...'
        }
        for k, v in defaults.items():
            if k not in data:
                SystemSetting.objects.create(key=k, value=v)
                data[k] = v
        return Response(data)
        
    elif request.method == 'POST':
        for k, v in request.data.items():
            setting, created = SystemSetting.objects.get_or_create(key=k)
            setting.value = str(v)
            setting.save()
        log_activity(request.user, "SETTINGS_CHANGED", request.META.get('REMOTE_ADDR'), "Updated system settings")
        return Response({"status": "success", "settings": request.data})

class AdminActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivityLogSerializer
    queryset = ActivityLog.objects.all()
    pagination_class = None

    def get_queryset(self):
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            return ActivityLog.objects.none()

        qs = ActivityLog.objects.all().select_related('user').order_by('-created_at')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                models.Q(action__icontains=search) |
                models.Q(details__icontains=search) |
                models.Q(user__username__icontains=search)
            )

        action_filter = self.request.query_params.get('action')
        if action_filter:
            qs = qs.filter(action__icontains=action_filter)

        return qs


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_global_search(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"detail": "Permission denied"}, status=403)

    query = request.query_params.get('q', '').strip()
    if not query:
        return Response({'users': [], 'records': [], 'notifications': []})

    users = User.objects.filter(
        models.Q(username__icontains=query) |
        models.Q(email__icontains=query) |
        models.Q(first_name__icontains=query) |
        models.Q(last_name__icontains=query)
    ).values('id', 'username', 'email')[:8]

    records = WaterIntakeEntry.objects.filter(
        models.Q(user__username__icontains=query) |
        models.Q(user__email__icontains=query) |
        models.Q(notes__icontains=query)
    ).select_related('user').order_by('-date')[:8]

    record_results = [{
        'id': r.id,
        'username': r.user.username,
        'date': r.date.strftime('%Y-%m-%d'),
        'amount_ml': r.amount_ml,
    } for r in records]

    notifications = Notification.objects.filter(
        models.Q(title__icontains=query) |
        models.Q(message__icontains=query)
    ).values('id', 'title', 'type', 'created_at')[:8]

    return Response({
        'users': list(users),
        'records': record_results,
        'notifications': list(notifications),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    profiles = UserProfile.objects.select_related('user').order_by('-total_water_consumed')
    data = []
    for rank, p in enumerate(profiles, 1):
        entries = WaterIntakeEntry.objects.filter(user=p.user)
        total_entries = entries.count()
        completed_entries = 0
        for e in entries:
            if e.amount_ml >= p.daily_goal_ml:
                completed_entries += 1
        completion_pct = int((completed_entries / total_entries) * 100) if total_entries > 0 else 0
        
        badge = 'Bronze'
        if rank == 1:
            badge = 'Gold'
        elif rank == 2:
            badge = 'Silver'
        elif rank == 3:
            badge = 'Bronze'
        elif rank <= 5:
            badge = 'Elite'
        else:
            badge = 'Hydrator'
            
        data.append({
            'rank': rank,
            'username': p.user.username,
            'email': p.user.email,
            'total_water': p.total_water_consumed,
            'current_streak': p.current_streak,
            'longest_streak': p.longest_streak,
            'goal_completion_pct': completion_pct,
            'badge': badge
        })
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_hydration_insights(request):
    user = request.user
    target_user_id = request.query_params.get('user_id')
    if target_user_id and (request.user.is_staff or request.user.is_superuser):
        user = get_object_or_404(User, id=target_user_id)
        
    profile = user.profile
    entries = WaterIntakeEntry.objects.filter(user=user).order_by('date')
    
    if not entries.exists():
        return Response({
            "insights": "We need at least a few days of logs to generate AI insights! Keep logging your daily water intake.",
            "recommendation": f"Start by drinking at least {profile.daily_goal_ml}ml today.",
            "forecast": []
        })
        
    amounts = list(entries.values_list('amount_ml', flat=True))
    avg_consumption = sum(amounts) / len(amounts)
    
    forecast = []
    last_amt = amounts[-1]
    for i in range(1, 4):
        forecast_val = int((avg_consumption + last_amt) / 2) + (i * 50)
        forecast.append({
            "day": f"Day {i}",
            "predicted_amount_ml": max(500, forecast_val)
        })
        
    if avg_consumption >= profile.daily_goal_ml:
        insights = f"Fantastic job, {user.username}! Your 30-day average water intake of {int(avg_consumption)}ml exceeds your daily goal of {profile.daily_goal_ml}ml. You have excellent hydration habits."
        recommendation = "Continue maintaining this streak. Try adding electrolytes if you engage in heavy exercise."
    else:
        insights = f"You are averaging {int(avg_consumption)}ml daily, which is below your daily goal of {profile.daily_goal_ml}ml. Increasing your intake can improve energy levels."
        recommendation = "Try to set hourly reminders and carry a larger water bottle to track consumption."
        
    return Response({
        "insights": insights,
        "recommendation": recommendation,
        "forecast": forecast
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def backup_restore_db(request):
    if not request.user.is_superuser:
        return Response({"detail": "Only Super Admins can manage backups"}, status=403)
        
    db_path = settings.DATABASES['default']['NAME']
    backup_dir = os.path.join(settings.BASE_DIR, 'backups')
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        
    backup_file = os.path.join(backup_dir, 'db_backup.sqlite3')
    
    if request.method == 'GET':
        try:
            shutil.copy2(db_path, backup_file)
            log_activity(request.user, "DATABASE_BACKUP", request.META.get('REMOTE_ADDR'), "Created SQLite database backup.")
            return Response({"status": "success", "message": "Database backup created successfully."})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)
            
    elif request.method == 'POST':
        try:
            if not os.path.exists(backup_file):
                return Response({"status": "error", "message": "No backup file found to restore."}, status=404)
            shutil.copy2(backup_file, db_path)
            log_activity(request.user, "DATABASE_RESTORE", request.META.get('REMOTE_ADDR'), "Restored SQLite database backup.")
            return Response({"status": "success", "message": "Database restored from backup successfully."})
        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_report(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"detail": "Permission denied"}, status=403)
        
    report_type = request.query_params.get('type', 'daily')
    export_format = request.query_params.get('format', 'json')
    
    today = timezone.now().date()
    if report_type == 'daily':
        start_date = today
    elif report_type == 'weekly':
        start_date = today - timedelta(days=7)
    elif report_type == 'monthly':
        start_date = today - timedelta(days=30)
    else:
        start_date = today - timedelta(days=365)
        
    entries = WaterIntakeEntry.objects.filter(date__gte=start_date).select_related('user', 'user__profile')
    
    total_water = entries.aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
    total_logs = entries.count()
    users_count = entries.values('user').distinct().count()
    avg_per_log = int(total_water / total_logs) if total_logs > 0 else 0
    
    table_data = []
    for e in entries:
        table_data.append({
            'username': e.user.username,
            'date': e.date.strftime('%Y-%m-%d'),
            'amount_ml': e.amount_ml,
            'notes': e.notes,
            'goal': e.user.profile.daily_goal_ml
        })
        
    summary = {
        'report_type': report_type,
        'start_date': start_date.strftime('%Y-%m-%d'),
        'end_date': today.strftime('%Y-%m-%d'),
        'total_water_ml': total_water,
        'total_logs': total_logs,
        'unique_users': users_count,
        'avg_per_log_ml': avg_per_log
    }
    
    if export_format == 'csv':
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="water_intake_report_{report_type}.csv"'
        writer = csv.writer(response)
        writer.writerow(['Username', 'Date', 'Amount (ml)', 'Goal (ml)', 'Notes'])
        for row in table_data:
            writer.writerow([row['username'], row['date'], row['amount_ml'], row['goal'], row['notes']])
        return response
        
    elif export_format == 'excel':
        response = HttpResponse(content_type='application/ms-excel')
        response['Content-Disposition'] = f'attachment; filename="water_intake_report_{report_type}.xls"'
        writer = csv.writer(response, delimiter='\t')
        writer.writerow(['Username', 'Date', 'Amount (ml)', 'Goal (ml)', 'Notes'])
        for row in table_data:
            writer.writerow([row['username'], row['date'], row['amount_ml'], row['goal'], row['notes']])
        return response
        
    return Response({
        'summary': summary,
        'table_data': table_data
    })
