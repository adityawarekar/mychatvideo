from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
import time

from agora_token_builder import RtcTokenBuilder

def index(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')


