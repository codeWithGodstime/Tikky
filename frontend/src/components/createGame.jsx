// import React, { useState, useEffect } from 'react';
// import { useWebSocketConnection } from '../context/socket';
// import { useNavigate } from "react-router"

// const API_URL = import.meta.env.VITE_API_URL;
// const HOST = import.meta.env.VITE_HOST;

// const CreateGame = () => {
//   const navigate = useNavigate();
//   const [isGameCreated, setIsGameCreated] = useState(false);
//   const [message, setMessage] = useState("");
//   const [gameUrl, setGameUrl] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const { sendMessage, lastMessage, readyState, setUsername, setGameId, username, gameId, setShouldConnect, setBoard, setCurrentPlayer } = useWebSocketConnection();

//   useEffect(() => {
//     console.log("Checking if useEfeect is been called for sender")
//     if (!lastMessage) return;

//     try {
//       const data = JSON.parse(lastMessage.data);

//       switch (data.type) {
//         case 'join':
//           setMessage(data); 
//           break;
//         case 'start':
//           console.log("SHould call this")
//           const serverBoard = JSON.parse(data.game_data);
//           setBoard(serverBoard.board);
//           setCurrentPlayer(data.player_symbol);
//           navigate(`/board/${username}`);
//           break;
//         case 'error':
//           console.error("WebSocket error:", data.message);
//           break;
//         default:
//           console.log("Other WS message:", data);
//       }
//     } catch (err) {
//       console.error("Invalid WS message", err);
//     }
//   }, [lastMessage]);

//   const handleCreateGame = async () => {
//     if (username.trim() === '') return;
//     setIsLoading(true); 

//     try {
//       const response = await fetch(`${API_URL}/create/`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to create game");
//       }

//       const data = await response.json();
//       const url = `${HOST}/${data['game_id']}`;
//       setGameUrl(url);
//       setGameId(data['game_id']);
//       setIsGameCreated(true);

//       setIsConnecting(true);
//       setShouldConnect(true);
//     } catch (error) {
//       console.error('Error creating game:', error);
//       setIsLoading(false);
//       alert('Something went wrong while creating the game. Please try again.');
//     }
//   };

//   const handleCopyToClipboard = () => {
//     navigator.clipboard.writeText(gameUrl).then(() => {
//     }).catch((error) => {
//       console.error('Failed to copy URL:', error);
//       alert('Failed to copy URL. Please try again.');
//     });
//   };

//   const startGame = () => {
//     console.log("starting game")
//     sendMessage(JSON.stringify({ type: 'start', game_id: gameId }))
//     navigate(`/board/${username}`);
//   }

//   return (
//     <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-r from-blue-500 to-teal-500">
//       <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
//         <h2 className="text-3xl font-semibold mb-6 text-center text-gray-700">Create Game</h2>

//         {!isGameCreated ? (
//           <div>
//             <div className="mb-4">
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username:</label>
//               <input
//                 type="text"
//                 id="username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder="Enter your username"
//                 className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <button
//               onClick={handleCreateGame}
//               disabled={isLoading || isConnecting}  // Disable button during loading or connecting
//               className={`w-full p-3 rounded-md text-white focus:outline-none transition-all 
//                 ${isLoading || isConnecting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
//             >
//               {isLoading ? (
//                 <div className="flex justify-center items-center space-x-2">
//                   <div className="w-5 h-5 border-4 border-t-4 border-white rounded-full animate-spin"></div>
//                   <span>Creating Game...</span>
//                 </div>
//               ) : isConnecting ? (
//                 <div className="flex justify-center items-center space-x-2">
//                   <div className="w-5 h-5 border-4 border-t-4 border-white rounded-full animate-spin"></div>
//                   <span>Connecting...</span>
//                 </div>
//               ) : (
//                 "Create Game"
//               )}
//             </button>
//           </div>
//         ) : (
//           <div>
//             <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Game Created! <span className='underline text-blue-400 text-xs block pt-2'>{gameUrl}</span></h3>

//             <div className='flex gap-3'>
//             <button 
//               onClick={handleCopyToClipboard}
//               className="mx-auto px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 w-full"
//             >
//               Copy Game URL
//             </button>
//             {
//               isGameCreated && <button onClick={()=> startGame()} className="mx-auto px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 w-full" disabled={!isGameCreated}>
//               Start Game
//             </button> 
//             }
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateGame;


import React, { useState, useEffect } from 'react';
import { useWebSocketConnection } from '../context/socket';
import { useNavigate } from "react-router"

const API_URL = import.meta.env.VITE_API_URL;
const HOST = import.meta.env.VITE_HOST;

const CreateGame = () => {

  const navigate = useNavigate()

  const [isGameCreated, setIsGameCreated] = useState(false);
  const [isLoading, setIsLoading] = useState("")
  const [isConnecting, setIsConnecting] = useState("")
  const [message, setMessage] = useState("")
  const [gameUrl, setGameUrl] = useState("")
  const { lastMessage, readyState, setUsername, setGameId, username, setShouldConnect, setBoard, setCurrentPlayer, sendMessage, gameId } = useWebSocketConnection();

  const handleStartEvent = () => {
    
    sendMessage(JSON.stringify({ type: 'start', game_id: gameId }));
  }

  useEffect(() => {
    if (!lastMessage) return;
    console.log("jjj")

    try {
      const data = JSON.parse(lastMessage.data);

      switch (data.type) {
        case 'join':
          setMessage(data);
          break;
        case 'start':
          console.log("called")
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

    const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(gameUrl).then(() => {
    }).catch((error) => {
      console.error('Failed to copy URL:', error);
      alert('Failed to copy URL. Please try again.');
    });
  };

  const handleCreateGame = async () => {
    if (username.trim() === '') {
      return;
    }
    setIsLoading(true)

    // Check if WebSocket is open before proceeding
    // if (readyState === 1) { 
    //   console.log("Reached here")
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

        setShouldConnect(true)

      } else {
        console.log('Failed to create game via API');
      }
    } catch (error) {
      console.error('Error connecting to API:', error);
    }
    // } else {
    //   console.log('WebSocket not connected yet. Please try again.');
    // }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-r from-blue-500 to-teal-500">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
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

            {/* <button
              onClick={handleCreateGame}
              className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Game
            </button> */}

            <button
              onClick={handleCreateGame}
              disabled={isLoading || isConnecting}
              className={`w-full p-3 rounded-md text-white focus:outline-none transition-all 
                ${isLoading || isConnecting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isLoading ? (
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-5 h-5 border-4 border-t-4 border-white rounded-full animate-spin"></div>
                  <span>Creating Game...</span>
                </div>
              ) : isConnecting ? (
                <div className="flex justify-center items-center space-x-2">
                  <div className="w-5 h-5 border-4 border-t-4 border-white rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                "Create Game"
              )}
            </button>
          </div>
        ) : (
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Game Created! <span className='underline text-blue-400 text-xs block pt-2'>{gameUrl}</span></h3>
              <div className='flex gap-3'>
                <button
                  onClick={handleCopyToClipboard}
                  className="mx-auto px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 w-full"
                >
                  Copy Game URL
                </button>
                {
                  isGameCreated && <button onClick={handleStartEvent} className="mx-auto px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 w-full" disabled={!isGameCreated}>
                    Start Game
                  </button>
                }
              </div>
            </div>

        )}
      </div>
    </div>
  );
};

export default CreateGame;
