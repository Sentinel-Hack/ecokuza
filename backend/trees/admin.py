from django.contrib import admin
from .models import TreeRecord


@admin.register(TreeRecord)
class TreeRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'species', 'tree_type', 'record_type', 'created_at']
    list_filter = ['record_type', 'tree_type', 'created_at']
    search_fields = ['species', 'location_description', 'user__email']
    readonly_fields = ['photo_datetime_original', 'photo_datetime_digitized', 'photo_datetime', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User Info', {
            'fields': ('user',)
        }),
        ('Record Details', {
            'fields': ('record_type', 'species', 'tree_type', 'location_description')
        }),
        ('GPS Data', {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Photo & Metadata', {
            'fields': ('photo', 'photo_datetime_original', 'photo_datetime_digitized', 'photo_datetime')
        }),
        ('Additional Info', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
