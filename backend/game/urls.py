from django.urls import path
from .views import JoinGame, CreateGame

urlpatterns = [
    path("create/", CreateGame.as_view()),
    path("join/<str:game_id>/", JoinGame.as_view())
]
