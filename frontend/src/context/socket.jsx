// WebSocketContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';

const API_URL = import.meta.env.VITE_SOCKET_URL;

// Create a WebSocket context
const WebSocketContext = createContext();

// WebSocket provider to manage the connection
export const WebSocketProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const [shouldConnect, setShouldConnect] = useState(false)
  const [board, setBoard] = useState(Array(9).fill(''))
  const [currentPlayer, setCurrentPlayer] = useState('')
  const [gameStateData, setGameStateData] = useState("")
  
  const socketUrl = `${API_URL}/ws/${username}/${gameId}/`;

  // WebSocket hook with share: true
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    share: true,  // Ensures the connection is shared across components
    shouldConnect: username !== '',  // Only connect if username is provided
    onOpen: () => console.log('WebSocket Connected!'),
    onClose: () => console.log('WebSocket Disconnected'),
    shouldReconnect: (closeEvent) => true,  // Reconnect on disconnect
  }, shouldConnect);

  // We pass the WebSocket state (sendMessage, lastMessage, etc.) and game state (gameId, username)
  return (
    <WebSocketContext.Provider value={{
      sendMessage,
      lastMessage,
      readyState,
      setUsername,
      setGameId,
      setShouldConnect,
      setBoard,
      currentPlayer,
      setCurrentPlayer,
      board,
      username,
      gameId
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to access WebSocket context
export const useWebSocketConnection = () => {
  return useContext(WebSocketContext);
};
