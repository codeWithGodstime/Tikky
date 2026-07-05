from uuid import uuid4

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib import messages
from django.core.cache import cache
from django.http import Http404
from django.shortcuts import redirect, render
from django.urls import reverse

from .forms import JoinLobbyForm, UsernameForm


GAME_TTL = 60 * 60 * 24


def _short_code(game_id):
    return game_id[:4].upper()


def _get_session_game(request, game_id):
    session_game_id = request.session.get("game_id")
    session_username = request.session.get("username")
    if not session_game_id or session_game_id != game_id or not session_username:
        return None, None
    return session_username, cache.get(game_id)


def _player_symbol(game, username):
    if game["x_player_name"] == username:
        return "X"
    if game["o_player_name"] == username:
        return "O"
    return None


def lobby(request):
    return render(request, "game/lobby.html", {
        "create_form": UsernameForm(),
        "join_form": JoinLobbyForm(),
    })


def create_game(request):
    if request.method != "POST":
        return redirect("lobby")

    form = UsernameForm(request.POST)
    if not form.is_valid():
        return render(request, "game/lobby.html", {
            "create_form": form,
            "join_form": JoinLobbyForm(),
        })

    username = form.cleaned_data["username"]
    game_id = str(uuid4())
    game = {
        "board": ["" for _ in range(9)],
        "uuid": game_id,
        "player_turn": "X",
        "game_over": False,
        "x_player_name": username,
        "o_player_name": "",
        "previous_player": None,
    }

    cache.set(game_id, game, GAME_TTL)
    cache.set(f"{username}-{game_id[:5]}", f"channel_{username}-{game_id[:5]}")

    request.session["username"] = username
    request.session["game_id"] = game_id

    return redirect("waiting", game_id=game_id)


def _process_join(request, game_id, username, *, error_template, error_context):
    game = cache.get(game_id)
    if game is None:
        raise Http404("Game not found")

    if game["game_over"]:
        messages.error(request, "This game is already over.")
        return redirect("lobby")

    if game["x_player_name"] == username:
        request.session["username"] = username
        request.session["game_id"] = game_id
        return redirect("waiting", game_id=game_id)

    if game["o_player_name"] and game["o_player_name"] != username:
        messages.error(request, "This room is full.")
        return render(request, error_template, error_context)

    game["o_player_name"] = username
    cache.set(game_id, game, GAME_TTL)
    cache.set(f"{username}-{game_id[:5]}", f"channel_join_{username}-{game_id[:5]}")

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"game_{game_id}",
        {"type": "join_game", "message": f"{username} joined"},
    )

    request.session["username"] = username
    request.session["game_id"] = game_id
    return redirect("waiting", game_id=game_id)


def join_page(request, game_id):
    game = cache.get(game_id)
    if game is None:
        raise Http404("Game not found")

    if request.method == "POST":
        form = UsernameForm(request.POST)
        if not form.is_valid():
            return render(request, "game/join.html", {
                "form": form,
                "game_id": game_id,
                "short_code": _short_code(game_id),
            })

        return _process_join(
            request,
            game_id,
            form.cleaned_data["username"],
            error_template="game/join.html",
            error_context={
                "form": form,
                "game_id": game_id,
                "short_code": _short_code(game_id),
            },
        )

    return render(request, "game/join.html", {
        "form": UsernameForm(),
        "game_id": game_id,
        "short_code": _short_code(game_id),
    })


def join_from_lobby(request):
    if request.method != "POST":
        return redirect("lobby")

    form = JoinLobbyForm(request.POST)
    if not form.is_valid():
        return render(request, "game/lobby.html", {
            "create_form": UsernameForm(),
            "join_form": form,
        })

    game_id = form.cleaned_data["game_id"]
    if cache.get(game_id) is None:
        form.add_error("game_id", "Game not found.")
        return render(request, "game/lobby.html", {
            "create_form": UsernameForm(),
            "join_form": form,
        })

    return _process_join(
        request,
        game_id,
        form.cleaned_data["username"],
        error_template="game/lobby.html",
        error_context={
            "create_form": UsernameForm(),
            "join_form": form,
        },
    )


def waiting_room(request, game_id):
    username, game = _get_session_game(request, game_id)
    if not username or game is None:
        raise Http404("Game not found or session expired")

    is_host = game["x_player_name"] == username
    opponent_joined = bool(game["o_player_name"])

    return render(request, "game/waiting.html", {
        "game_id": game_id,
        "username": username,
        "is_host": is_host,
        "x_player": game["x_player_name"],
        "o_player": game["o_player_name"],
        "opponent_joined": opponent_joined,
        "short_code": _short_code(game_id),
        "join_url": request.build_absolute_uri(reverse("join", args=[game_id])),
        "ws_scheme": "wss" if request.is_secure() else "ws",
    })


def play(request, game_id):
    username, game = _get_session_game(request, game_id)
    if not username or game is None:
        raise Http404("Game not found or session expired")

    player_symbol = _player_symbol(game, username)
    if player_symbol is None:
        raise Http404("You are not a player in this game")

    opponent = game["o_player_name"] if player_symbol == "X" else game["x_player_name"]
    is_my_turn = game["player_turn"] == player_symbol and not game["game_over"]

    cell_borders = [
        "border-r border-b",
        "border-r border-b",
        "border-b",
        "border-r border-b",
        "border-r border-b",
        "border-b",
        "border-r",
        "border-r",
        "",
    ]
    board_cells = [
        {"value": game["board"][i], "border": cell_borders[i]}
        for i in range(9)
    ]

    return render(request, "game/board.html", {
        "game_id": game_id,
        "username": username,
        "player_symbol": player_symbol,
        "opponent": opponent,
        "board_cells": board_cells,
        "is_my_turn": is_my_turn,
        "short_code": _short_code(game_id),
        "ws_scheme": "wss" if request.is_secure() else "ws",
    })
