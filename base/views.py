from django.shortcuts import render
import time
from django.http import JsonResponse
from django.conf import settings
from agora_token_builder import RtcTokenBuilder

def lobby(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')

def get_token(request):
    channel_name = request.GET.get("channel")
    uid = int(request.GET.get("uid", 0))

    expiration_time = 3600 
    current_time = int(time.time())
    privilege_expired_ts = current_time + expiration_time

    token = RtcTokenBuilder.buildTokenWithUid(
        settings.AGORA_APP_ID,
        settings.AGORA_APP_CERTIFICATE,
        channel_name,
        uid,
        1, 
        privilege_expired_ts
    )

    return JsonResponse({
        "token": token,
        "appId" settings.AGORA_APP_ID
    })