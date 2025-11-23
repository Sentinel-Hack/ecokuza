from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.contrib.auth import get_user_model
from datetime import timedelta
from .serializers import UserSignUpSerializer, UserSerializer

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
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
        }
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
        
        return Response({
            'message': 'Registration successful! Please check your email to verify your account.',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
            }
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
