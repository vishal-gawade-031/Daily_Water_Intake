from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    WaterIntakeEntryViewSet, 
    register, 
    logout,
    user_profile,
    daily_summary,
    seven_day_analytics,
    user_achievements,
    coaching_message,
    CustomTokenObtainPairView,
    
    # Admin Views
    admin_dashboard_stats,
    admin_dashboard_charts,
    admin_global_search,
    AdminUserViewSet,
    AdminWaterRecordViewSet,
    AdminNotificationViewSet,
    system_settings,
    AdminActivityLogViewSet,
    leaderboard,
    ai_hydration_insights,
    backup_restore_db,
    generate_report
)

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin_users')
router.register(r'admin/water-records', AdminWaterRecordViewSet, basename='admin_water_records')
router.register(r'admin/notifications', AdminNotificationViewSet, basename='admin_notifications')
router.register(r'admin/activity-logs', AdminActivityLogViewSet, basename='admin_activity_logs')

urlpatterns = [
    # Router endpoints
    path('', include(router.urls)),
    
    # Authentication
    path('auth/register/', register, name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', logout, name='logout'),
    path('auth/profile/', user_profile, name='user_profile'),
    
    # User Water Intake Entries
    path('entries/', WaterIntakeEntryViewSet.as_view({'get': 'list', 'post': 'create'}), name='entries_list_create'),
    path('entries/<int:pk>/', WaterIntakeEntryViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='entries_detail'),
    
    # User Dashboard & Analytics
    path('daily-summary/', daily_summary, name='daily_summary'),
    path('analytics/seven-days/', seven_day_analytics, name='seven_day_analytics'),
    path('achievements/', user_achievements, name='user_achievements'),
    path('coaching/', coaching_message, name='coaching_message'),
    
    # Leaderboard & AI
    path('leaderboard/', leaderboard, name='leaderboard'),
    path('ai-insights/', ai_hydration_insights, name='ai_hydration_insights'),
    
    # Admin Stats, Settings, Reports, Backups
    path('admin/dashboard/stats/', admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/dashboard/charts/', admin_dashboard_charts, name='admin_dashboard_charts'),
    path('admin/search/', admin_global_search, name='admin_global_search'),
    path('admin/settings/', system_settings, name='system_settings'),
    path('admin/backup/', backup_restore_db, name='backup_restore_db'),
    path('admin/reports/', generate_report, name='generate_report'),
]
