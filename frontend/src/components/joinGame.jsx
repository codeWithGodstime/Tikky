import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router';
import { useWebSocketConnection } from '../context/socket';


const JoinGame = () => {
    const navigate = useNavigate()
    const { gameId } = useParams();
    const [isGameJoined, setIsGameJoined] = useState(false);
    const { sendMessage, lastMessage, readyState, setUsername, setGameId, username, setShouldConnect, setBoard, setCurrentPlayer } = useWebSocketConnection();

    useEffect(() => {
        if (!lastMessage) return;

        try {
            const data = JSON.parse(lastMessage.data);

            switch (data.type) {
                case 'join':
                    console.log("Player joined:", data);
                    break;
                case 'start':
                    console.log("Game started:", data.message, data);
                    const serverBoard = JSON.parse(data.game_data)
                    setCurrentPlayer(data.player_symbol)
                    setBoard(serverBoard.board)

                    navigate(`/board/${username}`)
                    break;
                default:
                    console.log("Other WS message:", data);
            }
        } catch (err) {
            console.error("Invalid WS message", err);
        }
    }, [lastMessage])

    const handleJoinGame = async () => {
        if (username.trim() === '') {
            console.log('Please fill in both fields!');
            return;
        }
        setShouldConnect(true)

        // Check if WebSocket is open before proceeding
        if (readyState === 1) { // 1 means OPEN
            try {
                // Now send the join request to your API endpoint
                const response = await fetch(`http://localhost:8000/join/${gameId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, "game_id": gameId }),
                });

                const data = await response.json()

                if (response.ok) {
                    console.log('Join game API call successful');
                    setIsGameJoined(true);
                    setGameId(data['game_id'])

                } else {
                    console.log('Failed to join the game via API');
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
                <h2 className="text-2xl font-semibold mb-6 text-center">Join Game</h2>

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
                            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Join Game
                        </button>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-center">Game Joined!</h3>
                        <p className="text-center text-gray-700">You have successfully joined the game with ID "{gameId}" and username "{username}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinGame;
