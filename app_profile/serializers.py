from django.contrib.auth.models import User

from rest_framework.validators import UniqueValidator
from rest_framework import serializers

from drf_gallery.serializers import OptionalValidationSerializer

from .models import EyeColor, BirthCountry, Profile


class EyeColorSerializer(OptionalValidationSerializer):

    class Meta:
        model = EyeColor
        fields = ['title', 'description']
        extra_kwargs = {
            'title': {
                'validators': [UniqueValidator(queryset=EyeColor.objects.all())],
            }
        }


class BirthCountrySerializer(OptionalValidationSerializer):

    class Meta:
        model = BirthCountry
        fields = ['title', 'description']
        extra_kwargs = {
            'title': {
                'validators': [UniqueValidator(queryset=BirthCountry.objects.all())],
            }
        }


class ProfileSerializer(serializers.ModelSerializer):
    eye_color = EyeColorSerializer(required=True, skip_validation=['title'])
    birth_country = BirthCountrySerializer(required=True, skip_validation=['title'])

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
