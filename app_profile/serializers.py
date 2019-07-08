from collections import OrderedDict

from django.core.exceptions import ObjectDoesNotExist
from django.db.utils import OperationalError
from django.contrib.auth.models import User

from rest_framework.validators import UniqueValidator
from rest_framework import serializers

from drf_gallery.serializers import (
    DynamicChoiceField,
    OptionalValidationSerializer, DynamicFieldsModelSerializer, SerializerSerializer
)

from .models import EyeColor, Country, Profile


class EyeColorSerializer(OptionalValidationSerializer):

    title = DynamicChoiceField(
        get_choices=lambda: [(title, title) for title in EyeColor.objects.values_list('title', flat=True)],
        label=EyeColor._meta.get_field('title').verbose_name
    )

    class Meta:
        model = EyeColor
        fields = ['title', 'description']
        extra_kwargs = {
            'title': {
                'validators': [UniqueValidator(queryset=EyeColor.objects.all())],
            }
        }


class CountrySerializer(OptionalValidationSerializer):

    title = DynamicChoiceField(
        get_choices=lambda: [(title, title) for title in Country.objects.values_list('title', flat=True)],
        label=Country._meta.get_field('title').verbose_name
    )

    class Meta:
        model = Country
        fields = ['title', 'description']
        extra_kwargs = {
            'title': {
                'validators': [UniqueValidator(queryset=Country.objects.all())],
            }
        }


class ProfileSerializer(serializers.ModelSerializer):
    eye_color = EyeColorSerializer(required=True, skip_validation=['title'])
    birth_country = CountrySerializer(required=True, skip_validation=['title'])

    class Meta:
        model = Profile
        fields = ['patronymic', 'birth_date', 'eye_color', 'birth_country']


class UserSerializer(DynamicFieldsModelSerializer):
    username = serializers.CharField(required=False)
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
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password', 'profile']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        try:
            key = 'eye_color'
            eye_color = EyeColor.objects.get(**profile_data.pop('eye_color'))
            key = 'birth_country'
            birth_country = Country.objects.get(**profile_data.pop('birth_country'))
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
        return user


class UserSerializerSerializer(SerializerSerializer):

    labels = {
        'first_name': 'Имя',
        'last_name': 'Фамилия',
    }
    skip_field_path = [
        'username',
        'profile.eye_color.description',
        'profile.birth_country.description',
    ]
    serializer_serializer = UserSerializer
