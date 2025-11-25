from django.contrib.auth.models import AbstractUser
from django.db import models

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
