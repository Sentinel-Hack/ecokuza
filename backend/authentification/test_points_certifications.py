from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch

from django.contrib.auth import get_user_model

from trees.models import TreeRecord
from authentification.models import Certification, UserCertification


class PointsAndCertificationsTest(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(email='tester@example.com', password='testpass', username='tester', first_name='Test')

        # Create a certification threshold that will be earned after two awards
        self.cert = Certification.objects.create(
            name='Test Cert',
            description='Test certification for points',
            required_points=200,
            required_trees=0,
            required_verification_rate=0.0,
        )

    def make_image_file(self):
        return SimpleUploadedFile('test.jpg', b'JPEGDATA'*100, content_type='image/jpeg')

    def test_plant_and_update_award_sum_to_cert(self):
        # Patch extract_exif_data to avoid PIL parsing in tests
        with patch.object(TreeRecord, 'extract_exif_data', lambda self: None):
            # Create plant record (not verified yet) with authenticity score preset
            plant = TreeRecord.objects.create(
                user=self.user,
                record_type='plant',
                species='Mango',
                tree_type='fruit',
                location_description='Test location',
                photo=self.make_image_file(),
                authenticity_score=50,
                verified=False
            )

            # Verify plant record -> should award 100 + 50 = 150 points
            plant.verified = True
            plant.save()

            self.user.refresh_from_db()
            self.assertEqual(self.user.points, 150)

            # Create an update record linked to plant, with smaller authenticity
            update = TreeRecord.objects.create(
                user=self.user,
                record_type='update',
                species=plant.species,
                tree_type=plant.tree_type,
                location_description=plant.location_description,
                parent=plant,
                photo=self.make_image_file(),
                authenticity_score=20,
                verified=False
            )

            # Verify update -> should award 100 + 20 = 120 points
            update.verified = True
            update.save()

            self.user.refresh_from_db()
            # Total should be 150 + 120 = 270
            self.assertEqual(self.user.points, 270)

            # Certification should be awarded (required_points=200)
            earned = UserCertification.objects.filter(user=self.user, certification=self.cert)
            self.assertTrue(earned.exists(), 'Certification should be awarded after cumulative points threshold')
