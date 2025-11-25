from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count, F, Window, Q, Sum
from django.db.models.functions import DenseRank
from datetime import timedelta, datetime, timezone
from .serializers import UserSignUpSerializer, UserSerializer, NotificationSerializer, LeaderboardSerializer
from .models import Notification, PointsLog

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in(request):
    """
    Sign in endpoint
    Expected payload: { "email": "...", "password": "...", "remember_me": true/false }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    remember_me = request.data.get('remember_me', False)
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=email, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return Response(
            {'error': 'Account is disabled'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    # Adjust token lifetime based on remember_me
    if not remember_me:
        refresh.set_exp(lifetime=timedelta(days=1))
    
    user_serializer = UserSerializer(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': user_serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
    """
    Sign up endpoint
    Expected payload: { "email": "...", "first_name": "...", "password": "..." }
    """
    serializer = UserSignUpSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Send verification email (optional)
        try:
            send_verification_email(user, request)
        except Exception as e:
            print(f"Failed to send verification email: {e}")
        
        user_serializer = UserSerializer(user)
        
        return Response({
            'message': 'Registration successful! Please check your email to verify your account.',
            'user': user_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Forgot password endpoint
    Expected payload: { "email": "..." }
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        
        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # Send email
        subject = 'Password Reset Request'
        message = f"""
        Hello {user.first_name},
        
        You requested to reset your password. Click the link below to reset it:
        
        {reset_link}
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        AuthLog Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'Password reset link has been sent to your email'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # For security, return success even if user doesn't exist
        return Response({
            'message': 'If an account exists with this email, a password reset link has been sent'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': 'Failed to send reset email. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request, uidb64, token):
    """
    Reset password endpoint
    Expected payload: { "new_password": "..." }
    """
    new_password = request.data.get('new_password')
    
    if not new_password:
        return Response(
            {'error': 'New password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            
            return Response({
                'message': 'Password has been reset successfully'
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid or expired reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'error': 'Invalid reset link'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sign_out(request):
    """
    Sign out endpoint - blacklist the refresh token
    Expected payload: { "refresh": "..." }
    """
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({
            'message': 'Successfully signed out'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': 'Failed to sign out'},
            status=status.HTTP_400_BAD_REQUEST
        )


def send_verification_email(user, request):
    """Helper function to send email verification"""
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
    
    subject = 'Verify Your Email'
    message = f"""
    Hello {user.first_name},
    
    Thank you for registering! Please verify your email by clicking the link below:
    
    {verification_link}
    
    Best regards,
    AuthLog Team
    """
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    """
    List notifications for authenticated user (unread first)
    Query params: ?unread_only=true (optional)
    """
    user = request.user
    unread_only = request.query_params.get('unread_only', 'false').lower() == 'true'
    
    notifications = Notification.objects.filter(recipient=user).order_by('-created_at')
    
    if unread_only:
        notifications = notifications.filter(is_read=False)
    
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notification_count(request):
    """Get count of unread notifications for authenticated user"""
    user = request.user
    count = Notification.objects.filter(recipient=user, is_read=False).count()
    return Response({'unread_count': count}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, notification_id):
    """Mark a specific notification as read"""
    user = request.user
    
    try:
        notification = Notification.objects.get(id=notification_id, recipient=user)
        notification.is_read = True
        notification.read_at = datetime.now(timezone.utc)
        notification.save()
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_as_read(request):
    """Mark all unread notifications as read for authenticated user"""
    user = request.user
    now = datetime.now(timezone.utc)
    
    count = Notification.objects.filter(recipient=user, is_read=False).update(
        is_read=True,
        read_at=now
    )
    
    return Response({
        'message': f'{count} notifications marked as read'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard(request):
    """
    Get global leaderboard - top users by total points
    Query params: ?limit=10 (default 10, max 100)
    """
    limit = min(int(request.query_params.get('limit', 10)), 100)
    
    # Get top users ordered by points
    users = User.objects.annotate(
        rank=Window(
            expression=DenseRank(),
            order_by=F('points').desc()
        ),
        tree_count=Count('tree_records', filter=Q(tree_records__verified=True))
    ).order_by('-points')[:limit]
    
    serializer = LeaderboardSerializer(users, many=True)
    return Response({
        'leaderboard': serializer.data,
        'total_users': User.objects.filter(points__gt=0).count()
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def leaderboard_weekly(request):
    """
    Get weekly leaderboard - top users by points earned this week
    Query params: ?limit=10
    """
    limit = min(int(request.query_params.get('limit', 10)), 100)
    
    # Calculate start of current week (Monday)
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())
    
    # Aggregate points earned this week
    weekly_points = PointsLog.objects.filter(
        created_at__date__gte=week_start
    ).values('user').annotate(
        weekly_total=Sum('points')
    ).order_by('-weekly_total')
    
    # Get user objects with rank
    user_ids = [item['user'] for item in weekly_points[:limit]]
    users = User.objects.filter(id__in=user_ids)
    
    # Add rank and weekly points as attributes
    leaderboard = []
    for idx, item in enumerate(weekly_points[:limit], 1):
        user = User.objects.get(id=item['user'])
        user.rank = idx
        user.weekly_points = item['weekly_total']
        leaderboard.append(user)
    
    serializer = LeaderboardSerializer(leaderboard, many=True)
    return Response({
        'leaderboard': serializer.data,
        'period': f'Week of {week_start}',
        'total_users': len(weekly_points)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_leaderboard_rank(request):
    """
    Get authenticated user's rank and stats on global leaderboard
    """
    user = request.user
    if not user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Get rank
    rank = User.objects.filter(points__gt=user.points).count() + 1
    
    # Get stats
    verified_count = user.tree_records.filter(verified=True).count()
    total_count = user.tree_records.count()
    
    return Response({
        'rank': rank,
        'points': user.points,
        'total_users': User.objects.filter(points__gt=0).count(),
        'tree_records_verified': verified_count,
        'tree_records_total': total_count,
        'percentage_verified': (verified_count / total_count * 100) if total_count > 0 else 0
    }, status=status.HTTP_200_OK)
