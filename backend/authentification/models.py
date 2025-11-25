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
        ('tree_update_verified', 'Tree Update Verified'),
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
        
        # Check if user qualifies for any new certifications
        from .models import Certification, UserCertification, Notification
        already_earned = UserCertification.objects.filter(user=user).values_list('certification_id', flat=True)
        
        for cert in Certification.objects.exclude(id__in=already_earned):
            if cert.user_qualifies(user):
                # Award the certification
                UserCertification.objects.create(
                    user=user,
                    certification=cert,
                    points_at_earning=user.points
                )
                
                # Create a notification
                Notification.objects.create(
                    recipient=user,
                    sender=None,
                    notification_type='milestone',
                    title=f'🎉 New Certification Earned!',
                    message=f'Congratulations! You earned the "{cert.name}" certification!',
                    points_awarded=0
                )


class Notification(models.Model):
    """Track notifications for tutors/mentors about student progress."""
    
    NOTIFICATION_TYPES = [
        ('tree_verified', 'Tree Record Verified'),
        ('tree_update_verified', 'Tree Update Verified'),
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


class Certification(models.Model):
    """Certification/Badge that can be earned by users based on milestones."""
    
    CERTIFICATION_LEVELS = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='award', help_text="Icon name for frontend (lucide-react)")
    level = models.CharField(max_length=20, choices=CERTIFICATION_LEVELS, default='bronze')
    
    # Requirements to earn this certification
    required_points = models.IntegerField(default=0, help_text="Minimum points needed")
    required_trees = models.IntegerField(default=0, help_text="Minimum verified trees needed")
    required_verification_rate = models.FloatField(default=0.0, help_text="Minimum verification rate (0-100%)")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['level', '-required_points']
    
    def __str__(self):
        return f"{self.name} ({self.get_level_display()})"
    
    def user_qualifies(self, user):
        """Check if user meets all requirements for this certification."""
        if user.points < self.required_points:
            return False
        
        verified_trees = user.tree_records.filter(verified=True).count()
        if verified_trees < self.required_trees:
            return False
        
        total_trees = user.tree_records.count()
        if total_trees > 0:
            verification_rate = (verified_trees / total_trees) * 100
            if verification_rate < self.required_verification_rate:
                return False
        elif self.required_verification_rate > 0:
            return False
        
        return True


class UserCertification(models.Model):
    """Track which certifications have been awarded to which users."""
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='certifications')
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, related_name='awarded_to')
    
    # When it was earned
    earned_at = models.DateTimeField(auto_now_add=True)
    
    # Optional: points at time of earning (for reference)
    points_at_earning = models.IntegerField(null=True, blank=True)
    
    class Meta:
        unique_together = ('user', 'certification')
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.email} earned {self.certification.name}"

