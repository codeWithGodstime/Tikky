import json
from urllib.parse import parse_qs
from channels.generic.websocket import WebsocketConsumer
from django.core.cache import cache


class GameConsumer(WebsocketConsumer):
    def connect(self):
        # raw_query_string = self.scope['query_string']

        # query_params = parse_qs(raw_query_string.decode())
        # # Example: ?username=John
        # username = query_params.get('username', [None])[0]
        username = self.scope["url_route"]["kwargs"]["username"]
        if username:
            cache.set(f"channel_{username}", self.channel_name, 60*60*24)
        return super().connect()

    def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)  # make sure to parse JSON

        print(data)
        if data['type'] == 'start':
            self.channel_layer.group_send(
                f"game_{data['game_id']}",
                {
                    'type': 'game_start',
                    'message': 'Game has started!',
                    "game_id": data['game_id'],
                }
            )

        elif data['type'] == 'make_move':
            self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'game_move',
                    'message': f"{data['player']} made a move at {data['position']}"
                }
            )
    def game_start(self, event):
        self.send(text_data=json.dumps({
            'type': 'start',
            'message': event['message'],
            "game_id": event['game_id']
        }))
    
    def game_move(self, event):
        self.send(text_data=json.dumps({
            'type': 'move',
            'message': event['message']
        }))

    