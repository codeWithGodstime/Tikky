import React, { useState, useEffect } from 'react';
import { useWebSocketConnection } from '../context/socket';
import { useNavigate } from "react-router"

const API_URL = import.meta.env.VITE_API_URL;
const HOST = import.meta.env.VITE_HOST;

const CreateGame = () => {

  const navigate = useNavigate()

  const [isGameCreated, setIsGameCreated] = useState(false);
  const [message, setMessage] = useState("")
  const [gameUrl, setGameUrl] = useState("")
  const { sendMessage, lastMessage, readyState, setUsername, setGameId, username, gameId, setShouldConnect, setBoard, setCurrentPlayer } = useWebSocketConnection();

  const handleStartEvent = () => {
    sendMessage(JSON.stringify({ type: 'start', game_id: gameId }));
  }

  useEffect(() => {
    if (!lastMessage) return;

    try {
      const data = JSON.parse(lastMessage.data);

      switch (data.type) {
        case 'join':
          setMessage(data); 
          break;
        case 'start':
          const serverBoard = JSON.parse(data.game_data)
          setBoard(serverBoard.board)
          setCurrentPlayer(data.player_symbol)
          navigate(`/board/${username}`)
          break;
        case 'error':
          console.error("WebSocket error:", data.message);
          break;
        default:
          console.log("Other WS message:", data);
      }
    } catch (err) {
      console.error("Invalid WS message", err);
    }
  }, [lastMessage]);

  const handleCreateGame = async () => {
    if (username.trim() === '') {
      return;
    }
    setShouldConnect(true)

    // Check if WebSocket is open before proceeding
    if (readyState === 1) { 
      try {
        const response = await fetch(`${API_URL}/create/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });
        const data = await response.json()

        if (response.ok) {
          const url = `${HOST}/${data['game_id']}`
          setGameUrl(url)
          setGameId(data['game_id'])
          setIsGameCreated(true);
        } else {
          console.log('Failed to create game via API');
        }
      } catch (error) {
        console.error('Error connecting to API:', error);
      }
    } else {
      console.log('WebSocket not connected yet. Please try again.');
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Game</h2>

        {!isGameCreated ? (
          <div>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleCreateGame}
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Game
            </button>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-center">Game Created! {gameUrl}</h3>

            <button onClick={handleStartEvent} className={`mx-auto py-3 px-3 rounded-sm bg-green-400 disabled:opacity-50`} disabled={!(message && message.type === 'join')} >Start Game</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateGame;
