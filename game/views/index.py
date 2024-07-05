from django.shortcuts import render


# Create your views here.
# render默认从templates文件夹下寻找html文件
def index(request):
    return render(request, 'multiends/web.html')