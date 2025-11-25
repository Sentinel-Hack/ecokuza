from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

# simple root view to avoid 404
def home(request):
    return HttpResponse("Welcome to Ecokuza!")

urlpatterns = [
    path('', home),  # root URL
    path('admin/', admin.site.urls),
    path('authentification/', include('authentification.urls')),
    path('trees/', include('trees.urls')),  # tree records routes
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
