from django.urls import path
from .views import (
    WaterIntakeEntryViewSet, 
    register, 
    logout,
    user_profile,
    daily_summary,
    seven_day_analytics,
    user_achievements,
    coaching_message,
    CustomTokenObtainPairView
)
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Authentication
    path('auth/register/', register, name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', logout, name='logout'),
    path('auth/profile/', user_profile, name='user_profile'),
    
    # Water Intake Entries
    path('entries/', WaterIntakeEntryViewSet.as_view({'get': 'list', 'post': 'create'}), name='entries_list_create'),
    path('entries/<int:pk>/', WaterIntakeEntryViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='entries_detail'),
    
    # Dashboard & Analytics
    path('daily-summary/', daily_summary, name='daily_summary'),
    path('analytics/seven-days/', seven_day_analytics, name='seven_day_analytics'),
    
    # Achievements
    path('achievements/', user_achievements, name='user_achievements'),
    
    # Coaching
    path('coaching/', coaching_message, name='coaching_message'),
]
