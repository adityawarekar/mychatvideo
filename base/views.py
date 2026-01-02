from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
from django.conf import settings
import time, random
from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required(login_url='login')
def index(request):
    return render(request, 'base/lobby.html')


@login_required(login_url='login')
def room(request):
    return render(request, 'base/room.html')


@login_required(login_url='login')
def geToken(request):
    # your existing token logic here
    pass


def index(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')

def geToken(request):
    channel = request.GET.get('channel')
    uid = random.randint(1, 999)
    expire = int(time.time()) + 3600

    token = RtcTokenBuilder.buildTokenWithUid(
        settings.AGORA_APP_ID,
        settings.AGORA_APP_CERTIFICATE,
        channel,
        uid,
        1,
        expire
    )

    return JsonResponse({'token': token, 'uid': uid})
