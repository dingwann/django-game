from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
    title = '<h1 style="text-align:center"> 哈哈哈 </h1>'
    img = '<img src="https://image.9game.cn/2019/9/2/94565968.jpg" alt="My Image" width="500" height="500" style="display:block;margin-left:auto;margin-right:auto;">'
    return HttpResponse(title + img)