from rest_framework import serializers


class CreateGameSerializer(serializers.Serializer):
    username = serializers.CharField()


class JoinGameSerializer(serializers.Serializer):
    game_id = serializers.UUIDField()
    username = serializers.CharField()