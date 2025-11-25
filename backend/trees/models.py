from django.db import models
from django.contrib.auth import get_user_model
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
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
    gps_altitude = models.FloatField(null=True, blank=True)
    gps_speed = models.FloatField(null=True, blank=True)
    gps_img_direction = models.FloatField(null=True, blank=True)
    
    # Photo and metadata
    photo = models.ImageField(upload_to='trees/%Y/%m/%d/')
    
    # EXIF metadata from phone camera
    photo_datetime_original = models.DateTimeField(null=True, blank=True, help_text="DateTimeOriginal from EXIF")
    photo_datetime_digitized = models.DateTimeField(null=True, blank=True, help_text="DateTimeDigitized from EXIF")
    photo_datetime = models.DateTimeField(null=True, blank=True, help_text="DateTime from EXIF")
    
    # Additional info
    notes = models.TextField(blank=True)
    
    # AI Authenticity & Verification (Groq AI)
    authenticity_score = models.IntegerField(default=0, help_text="0-100: Authenticity score from AI analysis")
    is_authentic_image = models.BooleanField(default=True, help_text="Is the image authentic (not AI-generated/edited)?")
    ai_tree_type = models.CharField(max_length=255, blank=True, null=True, help_text="Tree type identified by AI")
    health_assessment = models.CharField(max_length=50, blank=True, null=True, help_text="Health assessment: Healthy/Good/Fair/Poor")
    image_quality = models.CharField(max_length=50, blank=True, null=True, help_text="Image quality: High/Medium/Low")
    gps_validation = models.BooleanField(default=True, help_text="GPS location matches tree type region")
    ai_analysis = models.TextField(blank=True, help_text="Detailed AI analysis from Groq")
    ai_confidence = models.CharField(max_length=50, blank=True, null=True, help_text="AI analysis confidence: high/medium/low")
    verified = models.BooleanField(default=False, help_text="Record verified by admin")
    
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

                # Extract GPS info if present
                gps_info = exif_data.get(34853) or exif_data.get('GPSInfo')
                if gps_info:
                    gps_parsed = {}
                    # gps_info may be in numeric tag form or already decoded
                    if isinstance(gps_info, dict):
                        raw_gps = gps_info
                    else:
                        raw_gps = {}
                        for key, val in gps_info.items():
                            decoded = GPSTAGS.get(key, key)
                            raw_gps[decoded] = val

                    def _to_deg(value):
                        # value is tuple of rationals ((num,den),(num,den),(num,den))
                        try:
                            d = value[0][0] / value[0][1]
                            m = value[1][0] / value[1][1]
                            s = value[2][0] / value[2][1]
                            return d + (m / 60.0) + (s / 3600.0)
                        except Exception:
                            return None

                    lat = None
                    lon = None
                    if 'GPSLatitude' in raw_gps and 'GPSLatitudeRef' in raw_gps:
                        lat = _to_deg(raw_gps.get('GPSLatitude'))
                        if raw_gps.get('GPSLatitudeRef') in ['S', 'south', 'SOUTH']:
                            lat = -lat if lat is not None else None
                    if 'GPSLongitude' in raw_gps and 'GPSLongitudeRef' in raw_gps:
                        lon = _to_deg(raw_gps.get('GPSLongitude'))
                        if raw_gps.get('GPSLongitudeRef') in ['W', 'west', 'WEST']:
                            lon = -lon if lon is not None else None

                    if lat is not None:
                        try:
                            self.latitude = float(lat)
                        except Exception:
                            pass
                    if lon is not None:
                        try:
                            self.longitude = float(lon)
                        except Exception:
                            pass

                    # Altitude
                    if 'GPSAltitude' in raw_gps:
                        try:
                            alt = raw_gps.get('GPSAltitude')
                            if isinstance(alt, tuple):
                                self.gps_altitude = float(alt[0]) / float(alt[1])
                            else:
                                self.gps_altitude = float(alt)
                        except Exception:
                            pass

                    # Speed (may be GPSSpeed or GPSSpeedRef)
                    if 'GPSSpeed' in raw_gps:
                        try:
                            sp = raw_gps.get('GPSSpeed')
                            if isinstance(sp, tuple):
                                self.gps_speed = float(sp[0]) / float(sp[1])
                            else:
                                self.gps_speed = float(sp)
                        except Exception:
                            pass

                    # Direction
                    if 'GPSImgDirection' in raw_gps:
                        try:
                            dirv = raw_gps.get('GPSImgDirection')
                            if isinstance(dirv, tuple):
                                self.gps_img_direction = float(dirv[0]) / float(dirv[1])
                            else:
                                self.gps_img_direction = float(dirv)
                        except Exception:
                            pass
        except Exception as e:
            print(f"Error extracting EXIF data: {e}")
    
    def save(self, *args, **kwargs):
        """Override save to extract EXIF data and analyze authenticity before saving."""
        if self.photo and not self.photo_datetime:
            # Only extract if EXIF data hasn't been extracted yet
            self.extract_exif_data()
        
        # Analyze image authenticity with Groq AI on creation or if photo changed
        if self.photo and not self.authenticity_score:
            self.analyze_authenticity()
        
        super().save(*args, **kwargs)
    
    def analyze_authenticity(self):
        """Analyze image authenticity using Groq AI."""
        try:
            from .groq_service import analyze_tree_image
            
            # Prepare GPS data for analysis
            gps_data = {}
            if self.latitude:
                gps_data['latitude'] = self.latitude
            if self.longitude:
                gps_data['longitude'] = self.longitude
            if self.gps_altitude:
                gps_data['altitude'] = self.gps_altitude
            
            # Call Groq AI for analysis
            analysis_result = analyze_tree_image(
                image_file=self.photo,
                gps_data=gps_data if gps_data else None
            )
            
            # Store results
            self.authenticity_score = analysis_result.get('authenticity_score', 0)
            self.is_authentic_image = analysis_result.get('is_tree', True)
            self.ai_tree_type = analysis_result.get('tree_type', '')
            self.health_assessment = analysis_result.get('health_assessment', '')
            self.image_quality = analysis_result.get('image_quality', '')
            self.gps_validation = analysis_result.get('gps_validation', True)
            self.ai_analysis = analysis_result.get('analysis', '')
            self.ai_confidence = analysis_result.get('confidence', 'low')
            
            print(f"✓ Groq AI Analysis Complete - Score: {self.authenticity_score}, Authentic: {self.is_authentic_image}")
            
        except Exception as e:
            print(f"Error during AI analysis: {e}")
            self.ai_analysis = f"Error: {str(e)}"
