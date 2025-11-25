from django.urls import path
from . import views

urlpatterns = [
    path('signin/', views.sign_in, name='signin'),
    path('signup/', views.sign_up, name='signup'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/<uidb64>/<token>/', views.reset_password, name='reset_password'),
    path('signout/', views.sign_out, name='signout'),
    
    # Notification endpoints
    path('notifications/', views.list_notifications, name='list_notifications'),
    path('notifications/unread-count/', views.unread_notification_count, name='unread_count'),
    path('notifications/<int:notification_id>/mark-as-read/', views.mark_notification_as_read, name='mark_as_read'),
    path('notifications/mark-all-as-read/', views.mark_all_notifications_as_read, name='mark_all_as_read'),
    
    # Leaderboard endpoints
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('leaderboard/weekly/', views.leaderboard_weekly, name='leaderboard_weekly'),
    path('leaderboard/me/', views.user_leaderboard_rank, name='user_rank'),
]