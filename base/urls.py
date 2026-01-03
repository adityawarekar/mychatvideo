from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('room/', views.room, name='room'),
    path('create_room/', views.create_or_join_room, name='create_room'),
    path('get_token/', views.geToken, name='get_token'),
]
