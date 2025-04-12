import json
from urllib.parse import parse_qs
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.core.cache import cache


class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.username = self.scope["url_route"]["kwargs"]["username"]
        if self.username:
            cache.set(f"channel_{self.username}", self.channel_name, 60*60*24)
        return super().connect()

    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)  # make sure to parse JSON

        print(data)
        if data['type'] == 'start':
            print("REACHE HERE")
            async_to_sync(self.channel_layer.group_send)(
                f"game_{data['game_id']}",
                {
                    'type': 'game_start',
                    'message': 'Game has started!',
                    "game_id": data['game_id'],
                }
            )

        elif data['type'] == 'make_move':
            async_to_sync(self.channel_layer.group_send)(
                f"game_{data['game_id']}",
                {
                    'type': 'make_move',
                    'message': f"{data['player']} made a move at {data['position']}",
                    "player": data['player'],
                    "position": data['position'],
                    "game_id": data['game_id'],
                }
            )

    def game_start(self, event):
        game_data = cache.get(event['game_id']) #retrieven game data from 
        print("testing", "X" if self.username == game_data['x_player_name'] else "O")
        self.send(text_data=json.dumps({
            'type': 'start',
            'message': event['message'],
            "game_id": event['game_id'],
            "player_symbol": "X" if self.username == game_data['x_player_name'] else "O",
            "game_data": json.dumps(game_data),
            "player_turn": game_data['player_turn']
        }))
    
    def make_move(self, event):
        # get game board count empty places, if non-empty spaces greater than 4 check for wins
        game_id = event['game_id']
        position = event['position']  # Expected to be int from 0 to 8
        player = event['player']

        game = cache.get(game_id)
        board = game['board']
        
        if board[position] != "":
        # Invalid move, already taken
            
            self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid move. Cell already taken.'
            }))
            return

        if game['player_turn'] == player and all(board):
            self.send(text_data=json.dumps({
                'type': 'error',
                'message': "Invalid move. Can't play two consercative moves."
            }))
            return

        # Update board
        board[position] = player
        game['board'] = board
        game['player_turn'] = "X" if player == "O" else "O"

        # Check for win
        win_combinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # cols
            [0, 4, 8], [2, 4, 6]              # diagonals
        ]

        winner = None
        for combo in win_combinations:
            if board[combo[0]] == board[combo[1]] == board[combo[2]] != "":
                winner = board[combo[0]]
                break

        if winner:
            game['game_over'] = True
            game['winner'] = winner
            cache.set(game_id, game, 60 * 60 * 24)

            async_to_sync(self.channel_layer.group_send)(
                f"game_{game_id}",
                {
                    'type': 'broadcast_move',
                    "e": "end",
                    'message': f'{winner} wins!',
                    'board': board,
                    'winner': winner
                }
            )
            return
        
        # Check for draw
        if "" not in board:
            game['game_over'] = True
            cache.set(game_id, game, 60 * 60 * 24)
            async_to_sync(self.channel_layer.group_send)(
                f"game_{game_id}",
                {
                    'type': 'broadcast_move',
                    "e": "draw",
                    'message': 'It\'s a draw!',
                    'board': board,
                    'winner': None
                }
            )
            return
        # switch player turn 
        print(game, "KK")
        # Save the game and broadcast the move
        cache.set(game_id, game, 60 * 60 * 24)
        
        async_to_sync(self.channel_layer.group_send)(
                f"game_{game_id}",
                    {
                    'type': 'broadcast_move',
                    "e": "continue",
                    "message": f"{player}'s turn",
                    'board': board,
                    'player': player,
                    'position': position,
                    "winner": None
                }
            )

    
    def broadcast_move(self, event):
        data = {}
        if event['e'] == 'continue':
            data = json.dumps({
                'type': 'move',
                'board': event['board'],
                'player': event['player'],
                'position': event['position']
            })
        elif event['e'] == 'end':
            data = json.dumps({
                "type": "game_over",
                'message': event['message'],
                'board': event['board'],
                'winner': event['winner']
            })
        elif event['e'] == 'draw':
            data = json.dumps({
                "type": "game_over",
                'message': event['message'],
                'board': event['board'],
                'winner': event['winner']
            })
        
        self.send(text_data=data)
        

    def join_game(self, event):
        self.send(text_data=json.dumps({
            'type': 'join',
            'message': event['message']
        }))

    