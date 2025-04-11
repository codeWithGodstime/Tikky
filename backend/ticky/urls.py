from django.contrib import admin
from django.urls import path, include, re_path
from game import consumer


urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include("game.urls")),
]

websocket_urlpatterns = [
    re_path(r"ws/(?P<username>\w+)/$", consumer.GameConsumer.as_asgi()),
]