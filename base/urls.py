from django.urls import path
from . import views

urlpatterns = {
    path('', views.lobby),
    path('room/', views.room),
    path('get-token/', views.get_token),
}