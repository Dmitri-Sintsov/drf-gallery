from django.db import models
from django.contrib.auth.models import User


class EyeColor(models.Model):
    title = models.CharField(max_length=30, unique=True, blank=False, verbose_name='Наименование цвета глаз')
    description = models.TextField(max_length=255, blank=True, verbose_name='Описание цвета глаз')

    class Meta:
        ordering = ['title']
        verbose_name = 'Цвет глаз'
        verbose_name_plural = 'Цвета глаз'

    def __str__(self):
        return self.title


class Country(models.Model):
    title = models.CharField(max_length=30, unique=True, blank=False, verbose_name='Название страны')
    description = models.TextField(max_length=255, blank=True, verbose_name='Описание страны')

    class Meta:
        ordering = ['title']
        verbose_name = 'Страна'
        verbose_name_plural = 'Страны'

    def __str__(self):
        return self.title


class Profile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, null=False, primary_key=True, verbose_name='Профиль пользователя'
    )
    patronymic = models.CharField(max_length=30, blank=True, verbose_name='Отчество')
    birth_date = models.DateField(null=True, blank=False, verbose_name='День рождения')
    # One EyeColor to many Profile
    eye_color = models.ForeignKey(EyeColor, on_delete=models.CASCADE, verbose_name='Цвет глаз пользователя')
    # One Country to many Profile
    birth_country = models.ForeignKey(
        Country, on_delete=models.CASCADE, verbose_name='Страна рождения пользователя'
    )
    # Many Country to many Profile
    # visited_countries = models.ManyToManyField(Country, verbose_name='Посещенные страны')

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'

    def __str__(self):
        return ' '.join([self.user.last_name, self.user.first_name, self.patronymic])
