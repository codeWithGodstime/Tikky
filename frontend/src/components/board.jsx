import React, { useState, useEffect } from 'react';
import { useWebSocketConnection } from '../context/socket';

const Board = () => {
  const [turn, setTurn] = useState('')
  const { sendMessage, lastMessage, gameId, board, setBoard, currentPlayer } = useWebSocketConnection();


  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      switch (data.type) {
        case 'move':
          const newBoard = [...data.board];
          newBoard[data.position] = data.player;
          setTurn(data.player)
          setBoard(newBoard);
          break;
        case 'game_over':
          alert(data.message);
          break;
        case 'error':
            console.error("WebSocket error:", data.message);
            break;
        default:
          break;
      }
    }
  }, [lastMessage]);

  const handleCellClick = (position) => {
    if (board[position] === '') {
      sendMessage(JSON.stringify({ type: 'make_move', position, player: currentPlayer, game_id: gameId }));
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
  <div className="board grid grid-cols-3 gap-2 w-64 h-64">
    {board.map((cell, index) => (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        className={`cell w-full h-full text-4xl font-bold text-center bg-gray-100 rounded-md 
          transition-colors duration-300 
          ${cell === "X" ? "bg-blue-300 hover:bg-blue-400" : ""}
          ${cell === "O" ? "bg-yellow-300 hover:bg-yellow-400" : ""}
          ${cell === "" ? "bg-gray-200 hover:bg-gray-300" : ""}
          focus:outline-none disabled:opacity-50`}
        disabled={(cell !== "") && (turn === currentPlayer) }
      >
        {cell}
      </button>
    ))}
  </div>
</div>

  );
};

export default Board;
