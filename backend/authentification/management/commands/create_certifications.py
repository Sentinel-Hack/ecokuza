from django.core.management.base import BaseCommand
from authentification.models import Certification


class Command(BaseCommand):
    help = 'Create default certifications for the system'

    def handle(self, *args, **options):
        certifications = [
            {
                'name': 'Seedling',
                'description': 'Plant your first tree record',
                'icon': 'sprout',
                'level': 'bronze',
                'required_points': 0,
                'required_trees': 1,
                'required_verification_rate': 0,
            },
            {
                'name': 'Tree Planter',
                'description': 'Submit 5 verified tree records',
                'icon': 'tree',
                'level': 'bronze',
                'required_points': 0,
                'required_trees': 5,
                'required_verification_rate': 0,
            },
            {
                'name': 'Eco Enthusiast',
                'description': 'Earn 500 points from tree verification',
                'icon': 'leaf',
                'level': 'silver',
                'required_points': 500,
                'required_trees': 0,
                'required_verification_rate': 0,
            },
            {
                'name': 'Master Planter',
                'description': 'Submit 20 verified tree records',
                'icon': 'trees',
                'level': 'silver',
                'required_points': 0,
                'required_trees': 20,
                'required_verification_rate': 0,
            },
            {
                'name': 'Environmental Champion',
                'description': 'Earn 1500 points and achieve 80% verification rate',
                'icon': 'shield-alert',
                'level': 'gold',
                'required_points': 1500,
                'required_trees': 10,
                'required_verification_rate': 80,
            },
            {
                'name': 'Forest Guardian',
                'description': 'Plant 50 verified trees and earn 3000 points',
                'icon': 'shield-check',
                'level': 'gold',
                'required_points': 3000,
                'required_trees': 50,
                'required_verification_rate': 70,
            },
            {
                'name': 'Tree Legend',
                'description': 'Achieve the ultimate: 100 verified trees and 5000 points',
                'icon': 'crown',
                'level': 'platinum',
                'required_points': 5000,
                'required_trees': 100,
                'required_verification_rate': 75,
            },
        ]

        created_count = 0
        for cert_data in certifications:
            cert, created = Certification.objects.get_or_create(
                name=cert_data['name'],
                defaults={
                    'description': cert_data['description'],
                    'icon': cert_data['icon'],
                    'level': cert_data['level'],
                    'required_points': cert_data['required_points'],
                    'required_trees': cert_data['required_trees'],
                    'required_verification_rate': cert_data['required_verification_rate'],
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created certification: {cert.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Certification already exists: {cert.name}'))

        self.stdout.write(self.style.SUCCESS(f'\nTotal created: {created_count}'))
