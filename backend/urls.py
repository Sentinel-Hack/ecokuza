from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to Ecokuza!")

urlpatterns = [
    path('', home),  # root URL
    path('admin/', admin.site.urls),
    path('authentification/', include('authentification.urls')),
]
