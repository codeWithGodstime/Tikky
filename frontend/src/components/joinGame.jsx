import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import { useWebSocketConnection } from '../context/socket';

const API_URL = import.meta.env.VITE_API_URL;

const JoinGame = () => {
    const navigate = useNavigate();
    const { gameId } = useParams();
    const [isGameJoined, setIsGameJoined] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const { lastMessage, readyState, setUsername, setGameId, username, setShouldConnect, setBoard, setCurrentPlayer } = useWebSocketConnection();
  
    useEffect(() => {
    console.log("Checking if useEfeect is been called for receiver")

      if (!lastMessage) return;
  
      try {
        const data = JSON.parse(lastMessage.data);
  
        switch (data.type) {
          case 'join':
            setMessage(data); 
            break;
          case 'start':
            const serverBoard = JSON.parse(data.game_data);
            setCurrentPlayer(data.player_symbol);
            setBoard(serverBoard.board);
            navigate(`/board/${username}`);
            break;
          default:
            console.log("Other WS message:", data);
        }
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    }, [lastMessage]);
  
    const handleJoinGame = async () => {
      if (username.trim() === '') {
        console.log('Please fill in both fields!');
        return;
      }
      // setIsLoading(true)
  
      // if (readyState === 1) {
        try {
          const response = await fetch(`${API_URL}/join/${gameId}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, "game_id": gameId }),
          });
  
          const data = await response.json();

          setIsGameJoined(true);
          setGameId(data['game_id']);

          setIsConnecting(true);
          setShouldConnect(true);
          
        } catch (error) {
          console.error('Error connecting to API:', error);
          setIsLoading(false);
          alert('Something went wrong while joining the game. Please try again.');
        }
        finally{
          setIsLoading(false)
        }
      // }
    };
  
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-r from-teal-400 to-blue-500">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-700">Join Game</h2>
  
          {!isGameJoined ? (
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
              onClick={handleJoinGame}
              disabled={isLoading || isConnecting}  // Disable button during loading or connecting
              className={`w-full p-3 rounded-md text-white focus:outline-none transition-all 
                ${isLoading || isConnecting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-5 h-5 border-4 border-t-4 border-white rounded-full animate-spin"></div>
                  <span>Joining Game...</span>
                </div>
              ) : isConnecting ? (
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-5 h-5 border-4 border-t-4 border-white rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                "Join Game"
              )}
            </button>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Game Joined!</h3>
              <p className="text-center text-gray-700">You have successfully joined the game with ID "{gameId}" and username "{username}".</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  

export default JoinGame;
