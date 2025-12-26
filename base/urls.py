from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('room/', views.room),
    path('get_token/', views.geToken)
]
