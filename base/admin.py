from django.contrib import admin
from .models import Room

# Register your models here.
from .models import RoomMember

admin.site.register(RoomMember)
admin.site.register(Room)