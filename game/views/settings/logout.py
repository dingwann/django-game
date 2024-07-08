from django.contrib.auth import authenticate, logout
from django.http import JsonResponse

def signout(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': 'Success',
            }, status=401)
    
    logout(request)
    return JsonResponse({
        'result': 'Success',
    })