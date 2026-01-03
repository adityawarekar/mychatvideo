from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.conf import settings
from agora_token_builder import RtcTokenBuilder
from accounts.models import Profile
from .models import Room
import time, random


@login_required(login_url='login')
def index(request):
    profiles = Profile.objects.exclude(user=request.user)
    return render(request, 'base/lobby.html', {
        'profiles': profiles
    })


@login_required(login_url='login')
def create_or_join_room(request):
    room_name = request.GET.get('channel')
    password = request.GET.get('password', '')
    is_private = request.GET.get('private') == 'true'

    room, created = Room.objects.get_or_create(
        room_name=room_name,
        defaults={
            'host': request.user,
            'is_private': is_private,
            'password': password if is_private else ''
        }
    )

    if room.is_private and not created:
        if room.password != password:
            return JsonResponse({'error': 'Invalid room password'}, status=403)

    return JsonResponse({'room': room.room_name})


@login_required(login_url='login')
def room(request):
    room_name = request.GET.get('room')
    if not room_name:
        return JsonResponse({'error': 'Room not provided'}, status=400)

    room = Room.objects.get(room_name=room_name)

    profile = Profile.objects.get(user=request.user)
    profile.status = 'in_call'
    profile.save()

    return render(request, 'base/room.html', {
        'room': room,
        'is_host': room.host == request.user
    })


@login_required(login_url='login')
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
