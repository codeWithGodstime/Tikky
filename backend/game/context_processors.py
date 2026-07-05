from django.core.cache import cache
from django.urls import reverse


def active_game(request):
    game_id = request.session.get("game_id")
    if not game_id:
        return {"active_game_url": None}

    game = cache.get(game_id)
    if game is None:
        return {"active_game_url": None}

    if any(game["board"]) or game.get("game_over"):
        url_name = "play"
    else:
        url_name = "waiting"

    return {"active_game_url": reverse(url_name, args=[game_id])}
