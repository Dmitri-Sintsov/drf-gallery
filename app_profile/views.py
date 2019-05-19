from django.shortcuts import render
from django.contrib.auth.models import User
from django.forms.models import model_to_dict


from rest_framework.permissions import BasePermission
from rest_framework import viewsets

from .serializers import UserSerializer


class UserViewSetPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        else:
            return request.user.is_authenticated


def main(request):
    context = {}
    if request.user.is_authenticated:
        context['user_fields'] = model_to_dict(request.user, exclude=['password'])
    return render(request, 'main.html', context)


class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserViewSetPermission]

    def create(self, request, *args, **kwargs):
        result = super().create(request, *args, **kwargs)
        return result
