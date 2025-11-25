from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
import os

User = get_user_model()


@receiver(post_migrate)
def create_test_users(sender, **kwargs):
    """Create test users after migrations are applied."""
    if sender.name != 'authentification':
        return
    
    test_users = [
        {'email': 'test@example.com', 'username': 'testuser', 'password': 'TestPassword123', 'first_name': 'Test'},
        {'email': 'demo@example.com', 'username': 'demouser', 'password': 'DemoPassword123', 'first_name': 'Demo'},
    ]
    
    for user_data in test_users:
        email = user_data['email']
        username = user_data['username']
        
        # Check if user exists by email or username
        if not User.objects.filter(email=email).exists() and not User.objects.filter(username=username).exists():
            try:
                User.objects.create_user(**user_data)
                print(f'✓ Created test user: {email}')
            except Exception as e:
                print(f'⚠ Failed to create user {email}: {e}')
        else:
            # User already exists, update if needed
            pass


@receiver(post_save, sender='authentification.UserCertification')
def notify_blockchain_on_certification(sender, instance, created, **kwargs):
    """
    Signal handler: When a user earns a certification, sync it to the blockchain.
    This allows certificate data to be stored on-chain with GPS and photo data.
    """
    if not created:
        return  # Only on creation
    
    try:
        from blockchain_service import get_blockchain_service
        
        blockchain_service = get_blockchain_service()
        user = instance.user
        certification = instance.certification
        
        # Get or create user's blockchain wallet (placeholder - in production, use actual wallet)
        user_wallet = os.getenv('USER_BLOCKCHAIN_WALLET', f"0x{user.id:040x}")  # Use user ID as wallet stub
        
        # Submit to blockchain
        result = blockchain_service.submit_certification(
            user_wallet=user_wallet,
            user_id=str(user.id),
            certification_name=certification.name,
            points_earned=instance.points_at_earning or user.points,
            tree_count=user.tree_records.filter(verified=True).count()
        )
        
        if result:
            print(f"✅ Certification synced to blockchain: {certification.name} for {user.email}")
        
    except Exception as e:
        print(f"⚠️  Error syncing certification to blockchain: {e}")
        # Don't raise - certification should be created even if blockchain sync fails


@receiver(post_save, sender='trees.TreeRecord')
def notify_blockchain_on_tree_verification(sender, instance, created, update_fields, **kwargs):
    """
    Signal handler: When a tree record is verified, sync it to the blockchain.
    Includes GPS data and uploads photo to IPFS.
    """
    if not update_fields:
        return
    
    # Only trigger if 'verified' field changed to True
    if 'verified' not in update_fields or not instance.verified:
        return
    
    try:
        from blockchain_service import get_blockchain_service
        
        blockchain_service = get_blockchain_service()
        user = instance.user
        
        # Get or create user's blockchain wallet
        user_wallet = os.getenv('USER_BLOCKCHAIN_WALLET', f"0x{user.id:040x}")
        
        # Prepare data
        latitude = instance.latitude or 0.0
        longitude = instance.longitude or 0.0
        altitude = instance.gps_altitude or 0.0
        
        # Submit to blockchain
        result = blockchain_service.submit_tree_update(
            user_wallet=user_wallet,
            tree_species=instance.species,
            latitude=latitude,
            longitude=longitude,
            altitude=altitude,
            photo_path=instance.photo.path if instance.photo else None,
            authenticity_score=instance.authenticity_score,
            health_assessment=instance.health_assessment or "Not assessed"
        )
        
        if result:
            print(f"✅ Tree record synced to blockchain: {instance.species} at ({latitude}, {longitude})")
        
    except Exception as e:
        print(f"⚠️  Error syncing tree record to blockchain: {e}")
        # Don't raise - tree record should exist even if blockchain sync fails

