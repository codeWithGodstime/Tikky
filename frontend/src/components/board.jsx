import { useState, useEffect } from "react";
import { useWebSocketConnection } from "../context/socket";

const Board = () => {
  const [turn, setTurn] = useState('');
  const { sendMessage, lastMessage, gameId, board, setBoard, currentPlayer, username } = useWebSocketConnection();

  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      switch (data.type) {
        case 'move':
          const newBoard = [...data.board];
          newBoard[data.position] = data.player;
          setTurn(data.player);
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
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-80 h-80 flex flex-col justify-between">
        {/* Player Name */}
        <div className="fixed top-4 right-4 text-lg font-semibold text-gray-800 rounded-md p-4 shadow">{username}</div>

        {/* Game Board */}
        <div className="board grid grid-cols-3 gap-2 w-full h-full">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className={`cell w-full h-full min-w-20 min-h-20 text-4xl font-bold text-center bg-gray-100 rounded-md 
                transition-all duration-300 
                ${cell === "X" ? "bg-blue-300 hover:bg-blue-400 text-blue-800" : ""}
                ${cell === "O" ? "bg-yellow-300 hover:bg-yellow-400 text-yellow-800" : ""}
                ${cell === "" ? "bg-gray-200 hover:bg-gray-300" : ""}
                focus:outline-none disabled:opacity-50`}
              disabled={cell !== "" && turn === currentPlayer}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board