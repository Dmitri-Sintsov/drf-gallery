#!/bin/sh
DJANGO_DEBUG='False' python3 $VIRTUAL_ENV/drf-gallery/manage.py collectrollup --noinput --clear
