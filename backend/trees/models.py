from django.db import models
from django.contrib.auth import get_user_model
from PIL import Image
from PIL.ExifTags import TAGS
from datetime import datetime
import io

User = get_user_model()


class TreeRecord(models.Model):
    """Model to store tree planting and update records."""
    
    TREE_TYPES = [
        ('fruit', 'Fruit Tree'),
        ('timber', 'Timber Tree'),
        ('medicinal', 'Medicinal Tree'),
        ('ornamental', 'Ornamental Tree'),
        ('windbreak', 'Windbreak'),
        ('shade', 'Shade Tree'),
        ('nitrogen_fixer', 'Nitrogen Fixer'),
        ('other', 'Other'),
    ]
    
    RECORD_TYPES = [
        ('plant', 'Plant New Tree'),
        ('update', 'Update Tree Progress'),
    ]
    
    # Basic info
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tree_records')
    record_type = models.CharField(max_length=10, choices=RECORD_TYPES, default='plant')
    
    # Tree details
    species = models.CharField(max_length=255)
    tree_type = models.CharField(max_length=50, choices=TREE_TYPES)
    location_description = models.TextField()
    
    # GPS coordinates (captured from phone)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Photo and metadata
    photo = models.ImageField(upload_to='trees/%Y/%m/%d/')
    
    # EXIF metadata from phone camera
    photo_datetime_original = models.DateTimeField(null=True, blank=True, help_text="DateTimeOriginal from EXIF")
    photo_datetime_digitized = models.DateTimeField(null=True, blank=True, help_text="DateTimeDigitized from EXIF")
    photo_datetime = models.DateTimeField(null=True, blank=True, help_text="DateTime from EXIF")
    
    # Additional info
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_record_type_display()} - {self.species} by {self.user.email}"
    
    def extract_exif_data(self):
        """Extract EXIF metadata from the photo."""
        try:
            if not self.photo:
                return
            
            # Read image file
            image_data = self.photo.read()
            image = Image.open(io.BytesIO(image_data))
            
            # Extract EXIF data
            exif_data = image._getexif()
            if exif_data:
                for tag_id, value in exif_data.items():
                    tag_name = TAGS.get(tag_id, tag_id)
                    
                    # DateTimeOriginal (tag 36867)
                    if tag_name == 'DateTimeOriginal' and isinstance(value, str):
                        try:
                            self.photo_datetime_original = datetime.strptime(value, '%Y:%m:%d %H:%M:%S')
                        except ValueError:
                            pass
                    
                    # DateTimeDigitized (tag 36868)
                    elif tag_name == 'DateTimeDigitized' and isinstance(value, str):
                        try:
                            self.photo_datetime_digitized = datetime.strptime(value, '%Y:%m:%d %H:%M:%S')
                        except ValueError:
                            pass
                    
                    # DateTime (tag 306)
                    elif tag_name == 'DateTime' and isinstance(value, str):
                        try:
                            self.photo_datetime = datetime.strptime(value, '%Y:%m:%d %H:%M:%S')
                        except ValueError:
                            pass
        except Exception as e:
            print(f"Error extracting EXIF data: {e}")
    
    def save(self, *args, **kwargs):
        """Override save to extract EXIF data before saving."""
        if self.photo and not self.photo_datetime:
            # Only extract if EXIF data hasn't been extracted yet
            self.extract_exif_data()
        super().save(*args, **kwargs)
