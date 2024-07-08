from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.contrib.auth.models import User
from game.models.player.player import Player


def register(request):
    data = request.GET
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    password2 = data.get('password2', '').strip()
    if not username or not password or not password2:
        return JsonResponse({
            'result': '用户名和密码不能为空',
            })
    if password != password2:
        return JsonResponse({
            'result': '两次输入的密码不一致',
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': '用户名已存在',
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo='https://c-ssl.duitang.com/uploads/blog/202205/17/20220517103057_453af.jpeg')
    login(request, user)
    return JsonResponse({
        'result': 'Success',
    })