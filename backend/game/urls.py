from django.urls import path, re_path
from .views import JoinGame, CreateGame
from . import consumer

urlpatterns = [
    path("create/", CreateGame.as_view()),
    path("join/<str:game_id>/", JoinGame.as_view())
]

websocket_urlpatterns = [
    re_path(r"ws/(?P<username>\w+)/(?P<game_id>[0-9a-fA-F\-]{36})/$", consumer.GameConsumer.as_asgi()),
]