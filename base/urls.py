from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('room/', views.room, name='room'),
    path('get_token/', views.geToken, name='get_token'),
]
