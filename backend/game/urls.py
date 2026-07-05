from django.urls import path, re_path

from . import consumer
from .views import (
    create_game,
    join_from_lobby,
    join_page,
    lobby,
    play,
    waiting_room,
)

urlpatterns = [
    path("", lobby, name="lobby"),
    path("create/", create_game, name="create"),
    path("join/lobby/", join_from_lobby, name="join_lobby"),
    path("join/<str:game_id>/", join_page, name="join"),
    path("game/<str:game_id>/waiting/", waiting_room, name="waiting"),
    path("game/<str:game_id>/play/", play, name="play"),
]

websocket_urlpatterns = [
    re_path(
        r"ws/(?P<username>\w+)/(?P<game_id>[0-9a-fA-F\-]{36})/$",
        consumer.GameConsumer.as_asgi(),
    ),
]
