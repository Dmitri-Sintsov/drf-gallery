import os

from django.db import models


class Album(models.Model):
    title = models.CharField(max_length=30, unique=True, blank=False, verbose_name='Название альбома')
    description = models.TextField(max_length=255, blank=True, verbose_name='Описание альбома')

    class Meta:
        ordering = ['title']
        verbose_name = 'Фотоальбом'
        verbose_name_plural = 'Фотоальбомы'

    def __str__(self):
        return self.title


class Photo(models.Model):
    original = models.ImageField(upload_to='photos/%Y/%m/%d')
    upload_date = models.DateTimeField(db_index=True, verbose_name='Дата создания')
    # One Album to many Photo
    album = models.ForeignKey(Album, on_delete=models.CASCADE, verbose_name='Фотоальбом')

    class Meta:
        ordering = ['upload_date']
        verbose_name = 'Фотография'
        verbose_name_plural = 'Фотографии'

    @property
    def basename(self):
        return os.path.basename(self.original.name)

    def get_absolute_url(self):
        return self.original.url

    def __str__(self):
        return ' › '.join([self.album, self.basename])
