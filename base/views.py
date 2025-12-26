from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
from django.conf import settings
import time
import random

def geToken(request):
    appId = '05895611c83b4515b2b8dc0dfe05f3b5'
    appCertificate = '1e7583e448484d40a66aa77541e8ddd1'
    channelName = request.GET.get('channel')
    uid = random.randint(1,230)
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token, 'uid':uid}, safe=False)
def index(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')


