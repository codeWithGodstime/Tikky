from uuid import uuid4
from asgiref.sync import async_to_sync
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from channels.layers import get_channel_layer

from .serializer import CreateGameSerializer, JoinGameSerializer


channel_layer = get_channel_layer()


class CreateGame(APIView):

    def post(self, request, *args, **kwargs):
        serialized_game = CreateGameSerializer(data = request.data)
        serialized_game.is_valid(raise_exception=True)

        # create uuid for the game and save in cache
        board = ["" for _ in range(9)]
        game = {
            "board": board,
            "uuid": str(uuid4()),
            "player_turn": "X",
            "game_over": False,
            "x_player_name": serialized_game.data['username'],
            "o_player_name": "",
        }

        username = serialized_game.data['username']

        game_id = str(uuid4())
        cache.set(game_id, game, 60*60*24) 

        channel_name = cache.get(f"channel_{username}") # the channel name is store when the user connect to the websocket

        if channel_layer and channel_name:
            async_to_sync(channel_layer.group_add)(f"game_{game_id}", channel_name)

        return Response({"game_id": game_id}, status=status.HTTP_201_CREATED)


class JoinGame(APIView):
    def post(self, request, *args, **kwargs):
        serialized_data = JoinGameSerializer(data=request.data)
        serialized_data.is_valid(raise_exception=True)
        game_id = serialized_data.data['game_id']
        game = cache.get(game_id)
        if game is None:
            return Response({"error": "Game not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if game['game_over']:
            return Response({"error": "Game is over"}, status=status.HTTP_400_BAD_REQUEST)
        
        # set the o_player_name
        game['o_player_name'] = serialized_data.data['username']
        cache.set(game_id, game, 60*60*24)
        username = serialized_data.data['username']

        channel_name = cache.get(f"channel_{username}") # the channel name is store when the user connect to the websocket

        if channel_layer and channel_name:
            async_to_sync(channel_layer.group_add)(f"game_{game_id}", channel_name)
            async_to_sync(channel_layer.group_send)(f"game_{game_id}", {"type": "join_game", "message": f"{username} joined"})

        return Response({"game_id": game_id}, status=status.HTTP_200_OK)
        
