from django.shortcuts import render
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token


from rest_framework.decorators import action
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework import status
from rest_framework import viewsets

from .models import EyeColor
from .serializers import UserSerializer, EyeColorSerializer


def main(request):
    if request.user.is_authenticated:
        user = UserSerializer(request.user).data
    else:
        user = {'id': 0}
    context = {
        'vue_store': {
            'user': user,
            'csrfToken': get_token(request),
        }
    }
    return render(request, 'main.html', context)


class UserPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method == 'POST':
            return view.action_map.get('post') in ['register', 'login', 'logout']
        else:
            return request.user.is_authenticated


class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserPermission]

    # See viewmodel-mixin.js
    def get_view_model(self, request, user_data):
        return {
            '_view': [
                {
                    'setState': {
                        'user': user_data,
                        'csrfToken': get_token(request),
                    }
                },
                {
                    'pushRoute': '/',
                }
            ],
        }

    @action(detail=False, methods=['post'])
    def register(self, request, *args, **kwargs):
        response = self.create(request, *args, **kwargs)
        auth_login(request, self.queryset.first())
        response.data = self.get_view_model(request, response.data)
        return response

    @action(detail=False, methods=['post'])
    def login(self, request):
        user = authenticate(username=request.data.get('email'), password=request.data.get('password'))
        if user is not None:
            if user.is_active:
                auth_login(request, user)
                serializer = self.get_serializer(user)
                result = Response(serializer.data)
                result.data = self.get_view_model(request, result.data)
                return result
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST, data={
                    'email': ['Пользователь не активен'],
                })
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST, data={
                'email': ['Неверный адрес почты или пароль'],
            })

    @action(detail=False, methods=['post'])
    def logout(self, request):
        if request.user.is_authenticated:
            auth_logout(request)
        return Response(self.get_view_model(request, user_data={'id': 0}))


class EyeColorViewSet(viewsets.ModelViewSet):

    queryset = EyeColor.objects.all()
    serializer_class = EyeColorSerializer
    permission_classes = [permissions.DjangoModelPermissionsOrAnonReadOnly]

    @action(detail=False, methods=['get', 'post'])
    def select_list(self, request, *args, **kwargs):
        response = self.list(request, *args, **kwargs)
        response.data = {
            '_view': [
                {
                    'setData': {
                        'select': {
                            'eye_color': response.data,
                        }
                    }
                }
            ]
        }
        return response
