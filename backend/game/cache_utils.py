from django.core.cache import cache


def clear_game_from_cache(game_id, game):
    cache.delete(game_id)
    for username in (game.get("x_player_name"), game.get("o_player_name")):
        if username:
            cache.delete(f"{username}-{game_id[:5]}")
