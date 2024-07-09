from django.urls import path
from game.views.settings.otherapp.web.apply_code import apply_code
from game.views.settings.otherapp.web.receive_code import receive_code


urlpatterns = [
    path('apply_code/', apply_code, name='apply_code'),
    path('receive_code/', receive_code, name='receive_code'),
]