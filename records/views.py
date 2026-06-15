from django.db import transaction
from django.db.models import Sum, Count
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import timedelta

from .models import WaterIntakeEntry, UserProfile, Achievement
from .serializers import (
    WaterIntakeEntrySerializer, 
    UserSerializer, 
    UserProfileSerializer,
    AchievementSerializer
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user info"""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
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
            return Response({
                'user': serializer.data,
                'message': 'User created successfully. Please login.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout endpoint - token blacklisting is handled by JWT"""
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
        
        # Optional filter by date: /api/entries/?date=YYYY-MM-DD
        date = request.query_params.get('date')
        if date:
            qs = qs.filter(date=date)
        
        serializer = WaterIntakeEntrySerializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create today's entry or add the amount to today's existing entry."""
        # Ensure user can only add entries for today
        today = timezone.now().date()

        serializer = WaterIntakeEntrySerializer(data=request.data)
        if serializer.is_valid():
            amount_ml = serializer.validated_data['amount_ml']
            notes = serializer.validated_data.get('notes')

            with transaction.atomic():
                entry = WaterIntakeEntry.objects.select_for_update().filter(
                    user=request.user,
                    date=today,
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
                        date=today,
                        amount_ml=amount_ml,
                        notes=notes or '',
                    )
                    response_status = status.HTTP_201_CREATED
            
            # Check and award achievements
            check_and_award_achievements(request.user)

            response_serializer = WaterIntakeEntrySerializer(entry)
            return Response(response_serializer.data, status=response_status)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        """Get a specific water intake entry"""
        entry = get_object_or_404(WaterIntakeEntry, pk=pk, user=request.user)
        serializer = WaterIntakeEntrySerializer(entry)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        """Delete a water intake entry"""
        entry = get_object_or_404(WaterIntakeEntry, pk=pk, user=request.user)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_summary(request):
    """Get today's water intake summary"""
    today = timezone.now().date()
    
    entries = WaterIntakeEntry.objects.filter(
        user=request.user,
        date=today
    )
    
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
    
    # Create a complete 7-day range
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
    """Check and award achievements based on user activity"""
    today = timezone.now().date()
    
    # First Day Badge - has at least one entry today
    if not Achievement.objects.filter(user=user, achievement_type='first_day').exists():
        if WaterIntakeEntry.objects.filter(user=user, date=today).exists():
            Achievement.objects.create(user=user, achievement_type='first_day')
    
    # 3-Day Streak
    if not Achievement.objects.filter(user=user, achievement_type='streak_3').exists():
        if has_n_day_streak(user, 3):
            Achievement.objects.create(user=user, achievement_type='streak_3')
    
    # 7-Day Streak (Weekly Warrior)
    if not Achievement.objects.filter(user=user, achievement_type='streak_7').exists():
        if has_n_day_streak(user, 7):
            Achievement.objects.create(user=user, achievement_type='streak_7')
    
    # Goal Crusher - met daily goal 5 times
    if not Achievement.objects.filter(user=user, achievement_type='goal_crusher').exists():
        if count_goal_days(user) >= 5:
            Achievement.objects.create(user=user, achievement_type='goal_crusher')
    
    # Hydration Hero - total 50,000ml
    if not Achievement.objects.filter(user=user, achievement_type='hydration_hero').exists():
        total = WaterIntakeEntry.objects.filter(user=user).aggregate(Sum('amount_ml'))['amount_ml__sum'] or 0
        if total >= 50000:
            Achievement.objects.create(user=user, achievement_type='hydration_hero')


def has_n_day_streak(user, n):
    """Check if user has n consecutive days of water intake"""
    today = timezone.now().date()
    
    for i in range(n):
        check_date = today - timedelta(days=i)
        if not WaterIntakeEntry.objects.filter(user=user, date=check_date).exists():
            return False
    
    return True


def count_goal_days(user):
    """Count how many days the user met their daily goal"""
    goal = user.profile.daily_goal_ml
    
    entries = WaterIntakeEntry.objects.filter(user=user).values('date').annotate(
        total=Sum('amount_ml')
    )
    
    goal_days = sum(1 for e in entries if e['total'] >= goal)
    return goal_days


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_achievements(request):
    """Get user's achievements"""
    achievements = Achievement.objects.filter(user=request.user)
    serializer = AchievementSerializer(achievements, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def coaching_message(request):
    """Get motivational coaching message based on progress"""
    # Get today's summary directly without calling the view
    today = timezone.now().date()
    
    entries = WaterIntakeEntry.objects.filter(
        user=request.user,
        date=today
    )
    
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
    
    # Find the appropriate message based on percentage
    message = messages[0]  # default
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
