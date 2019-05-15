from django.shortcuts import render
from django.contrib.auth.models import User

from rest_framework.permissions import BasePermission
from rest_framework import viewsets

from .serializers import UserSerializer


class UserViewSetPermission(BasePermission):

    def has_permission(self, request, view):
        return True


def main(request):
    return render(request, 'main.html')


class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserViewSetPermission]
