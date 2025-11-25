from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import TreeRecord
from .serializers import TreeRecordSerializer


class TreeRecordViewSet(viewsets.ModelViewSet):
    """ViewSet for Tree Records with create, list, retrieve, update, delete."""
    
    serializer_class = TreeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        """Return only the current user's tree records."""
        return TreeRecord.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Override to set the current user when creating a record."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_records(self, request):
        """Get all tree records for the current user."""
        records = self.get_queryset()
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def exif_metadata(self, request, pk=None):
        """Get detailed EXIF metadata for a specific tree record."""
        tree_record = self.get_object()
        return Response({
            'id': tree_record.id,
            'photo': str(tree_record.photo),
            'exif_data': {
                'DateTimeOriginal': tree_record.photo_datetime_original,
                'DateTimeDigitized': tree_record.photo_datetime_digitized,
                'DateTime': tree_record.photo_datetime,
            },
            'record_created_at': tree_record.created_at,
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get statistics about user's tree records."""
        user_records = self.get_queryset()
        
        stats = {
            'total_records': user_records.count(),
            'plant_records': user_records.filter(record_type='plant').count(),
            'update_records': user_records.filter(record_type='update').count(),
            'species_count': user_records.values('species').distinct().count(),
            'tree_types': dict(user_records.values_list('tree_type').distinct()),
        }
        return Response(stats)
