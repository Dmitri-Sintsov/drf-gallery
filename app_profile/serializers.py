from django.contrib.auth.models import User

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import EyeColor, BirthCountry, Profile


class EyeColorSerializer(serializers.ModelSerializer):

    class Meta:
        model = EyeColor
        fields = ['title', 'description']


class BirthCountrySerializer(serializers.ModelSerializer):

    class Meta:
        model = BirthCountry
        fields = ['title', 'description']


class ProfileSerializer(serializers.ModelSerializer):
    eye_color = EyeColorSerializer(required=True)
    birth_country = BirthCountrySerializer(required=True)

    class Meta:
        model = Profile
        fields = ['patronymic', 'birth_date', 'eye_color', 'birth_country']


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(min_length=8)
    profile = ProfileSerializer(required=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'profile']

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['email'],
            validated_data['email'],
            validated_data['password']
        )
        return user
