import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import JoinGame from './components/joinGame.jsx';
import App from './App.jsx'
import TicTacToeBoard from './components/board.jsx';
import { WebSocketProvider } from './context/socket.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <WebSocketProvider>
        <Routes>
          {/* Specific route for the board, which expects a username */}
          <Route path="/board/:username" element={<TicTacToeBoard />} />

          {/* General route for joining a game, which expects a gameId */}
          <Route path="/:gameId" element={<JoinGame />} />

          {/* Catch-all or root route for home or app component */}
          <Route path="/" element={<App />} />
        </Routes>

      </WebSocketProvider>
    </BrowserRouter>
  </StrictMode>,
)
