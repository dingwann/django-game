from django.http import JsonResponse
from game.models.player.player import Player


def getinfo_otherapp(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        'result': 'Success', 
        'username': player.user.username,
        'photo': player.photo,
        }
    )
    

def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': '未登录', 
            'message': 'User not authenticated'
            })
    else:
        player = Player.objects.get(user=user)
        return JsonResponse({
            'result': 'Success', 
            'username': player.user.username,
            'photo': player.photo,
            })


def getinfo(request):
    platform = request.GET.get('platform')
    if platform == 'Web':
        return getinfo_web(request)
    else:
        return getinfo_otherapp(request)