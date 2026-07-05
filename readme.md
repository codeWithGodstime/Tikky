## Tikky

A realtime two-player tic-tac-toe game built with Django, Channels, and Redis. The UI uses the [Stitch v2 cyberpunk design](https://stitch.withgoogle.com/projects/8603209256313888037).

[Demo Link on youtube](https://www.youtube.com/watch?v=JVntKZrLDa0)

## Stack

- Django 5.2 + Daphne (HTTP + WebSockets)
- Django Channels + Redis (game state and realtime)
- Server-rendered templates with Tailwind CDN and vanilla JS WebSocket clients

## Local development

1. Start Redis:

```bash
docker compose up redis -d
```

2. Copy the env template and adjust if needed:

```bash
cp .env.example .env
```

Required variables:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
REDIS_URL=redis://127.0.0.1:6379/0
```

When running the backend via Docker Compose, `REDIS_URL` is overridden to `redis://redis:6379/0` automatically.

3. Install dependencies and run Daphne:

```bash
cd backend
pip install -r requirements.txt
daphne -b 0.0.0.0 -p 8000 ticky.asgi:application
```

4. Open `http://localhost:8000/`

## Game flow

1. **Lobby** — enter a callsign and create a room, or join with a room code (full game UUID).
2. **Waiting Room** — host copies the join link; guest joins via `/join/<game_id>/`.
3. **Start** — host starts the match when both players are ready.
4. **Active Match** — realtime 3×3 board over WebSockets.
5. **Results** — win/draw/defeat overlay when the game ends.

## Docker

Run Redis and the backend together:

```bash
docker compose up --build
```

The app is served at `http://localhost:8000/`.

## TODO

- Display player turn more prominently during gameplay
- Restrict more than two players from joining a game (partially handled)
- Restrict player from making moves consecutively (server-side check exists)
