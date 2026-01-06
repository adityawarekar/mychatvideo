from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='landing'),
    path('lobby/', views.index, name='home'),
    path('room/', views.room, name='room'),
    path('get_token/', views.geToken, name='get_token'),
    path('create_room/', views.create_or_join_room, name='create_room'),
]
