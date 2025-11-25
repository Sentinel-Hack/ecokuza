from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TreeRecordViewSet

router = DefaultRouter()
router.register(r'records', TreeRecordViewSet, basename='tree-record')

urlpatterns = [
    path('', include(router.urls)),
]
