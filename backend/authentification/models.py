from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    is_email_verified = models.BooleanField(default=False)
    
    # Gamification: Points system
    points = models.IntegerField(default=0, help_text="Total points earned from verified tree records")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name']
    
    def __str__(self):
        return self.email


class PointsLog(models.Model):
    """Track points earned by users."""
    
    POINTS_TYPES = [
        ('tree_verified', 'Tree Record Verified'),
        ('bonus', 'Bonus Points'),
        ('achievement', 'Achievement Unlocked'),
        ('admin_adjustment', 'Admin Adjustment'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='points_logs')
    points = models.IntegerField(help_text="Points earned (can be negative for deductions)")
    points_type = models.CharField(max_length=50, choices=POINTS_TYPES)
    description = models.TextField(blank=True, help_text="Description of why points were awarded")
    tree_record = models.ForeignKey('trees.TreeRecord', on_delete=models.SET_NULL, null=True, blank=True, related_name='points_logs')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.points} pts ({self.get_points_type_display()})"
    
    def save(self, *args, **kwargs):
        """Auto-update user's total points."""
        super().save(*args, **kwargs)
        # Update user's total points
        user = self.user
        user.points = user.points_logs.aggregate(models.Sum('points'))['points__sum'] or 0
        user.save(update_fields=['points'])


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
    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    
    # Sender (the student whose record was verified)
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications_sent', null=True, blank=True)
    
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
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

