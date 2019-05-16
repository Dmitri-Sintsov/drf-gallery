from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout

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
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    password = serializers.CharField(min_length=8)
    profile = ProfileSerializer(required=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'profile']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        try:
            key = 'eye_color'
            eye_color = EyeColor.objects.get(**profile_data.pop('eye_color'))
            key = 'birth_country'
            birth_country = BirthCountry.objects.get(**profile_data.pop('birth_country'))
        except ObjectDoesNotExist:
            raise serializers.ValidationError({
                'profile': {
                    key: {
                        'title': ['Неизвестное значение'],
                    }
                }
            })
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(
            user=user,
            eye_color=eye_color,
            birth_country=birth_country,
            **profile_data
        )
        request = self.context.get('request')
        if request:
            auth_login(request, user)
        return user
