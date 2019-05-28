from rest_framework import serializers

from drf_gallery.serializers import DynamicFieldsModelSerializer

from app_profile.serializers import UserSerializer

from .models import Album, Photo


class AlbumSerializer(DynamicFieldsModelSerializer):

    owner = UserSerializer(fields=['id'], read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'owner', 'title', 'description']


class PhotoSerializer(serializers.ModelSerializer):

    album = AlbumSerializer(fields=['id'], read_only=True)

    class Meta:
        model = Photo
        fields = ['original', 'upload_date', 'album']
