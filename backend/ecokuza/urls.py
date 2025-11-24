from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# simple root view to avoid 404
def home(request):
    return HttpResponse("Welcome to Ecokuza!")

urlpatterns = [
    path('', home),  # root URL
    path('admin/', admin.site.urls),
    path('authentification/', include('authentification.urls')),  # your app routes
]
