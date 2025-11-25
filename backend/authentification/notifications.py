"""
Notifications app for tracking point updates and tree verification events.
"""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    """Track notifications for tutors/mentors about student progress."""
    
    NOTIFICATION_TYPES = [
        ('tree_verified', 'Tree Record Verified'),
        ('points_awarded', 'Points Awarded'),
        ('new_record', 'New Tree Record Created'),
        ('milestone', 'Milestone Reached'),
        ('leaderboard_update', 'Leaderboard Update'),
    ]
    
    # Recipient (the tutor/mentor)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    # Sender (the student whose record was verified)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications_sent', null=True, blank=True)
    
    # Notification details
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Related objects
    tree_record = models.ForeignKey('trees.TreeRecord', on_delete=models.SET_NULL, null=True, blank=True)
    points_awarded = models.IntegerField(null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['is_read', '-created_at']),
        ]
    
    def __str__(self):
        return f"Notification for {self.recipient.email}: {self.title}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
