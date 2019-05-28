"""drf_gallery URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path

from rest_framework.routers import DefaultRouter

from app_profile.views import main, UserViewSet, EyeColorViewSet, BirthCountryViewSet
from app_gallery.views import AlbumViewSet, PhotoViewSet


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', main, name='main'),
]

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'eye-colors', EyeColorViewSet, basename='eye_color')
router.register(r'birth-countries', BirthCountryViewSet, basename='birth_country')
router.register(r'albums', AlbumViewSet, basename='album')
router.register(r'photos', PhotoViewSet, basename='photo')
urlpatterns += router.urls

if settings.DEBUG:
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns, static

    urlpatterns += staticfiles_urlpatterns()
    media_static = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += media_static
