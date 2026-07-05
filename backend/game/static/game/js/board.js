(function () {
    const configEl = document.getElementById("board-config");
    if (!configEl) return;

    const config = JSON.parse(configEl.textContent);
    const wsUrl = `${config.wsScheme}://${window.location.host}/ws/${config.username}/${config.gameId}/`;
    const ws = new WebSocket(wsUrl);

    let isMyTurn = config.isMyTurn;
    const playerSymbol = config.playerSymbol;

    const turnText = document.getElementById("turn-text");
    const resultsOverlay = document.getElementById("results-overlay");
    const resultText = document.getElementById("result-text");
    const resultMessage = document.getElementById("result-message");

    function symbolIcon(symbol) {
        if (symbol === "X") {
            return '<span class="material-symbols-outlined text-[48px] text-primary neon-text-primary scale-110" style="font-variation-settings: \'FILL\' 0, \'wght\' 200;">close</span>';
        }
        return '<span class="material-symbols-outlined text-[48px] text-secondary neon-text-secondary scale-110" style="font-variation-settings: \'FILL\' 0, \'wght\' 200;">circle</span>';
    }

    function updateTurnIndicator(myTurn) {
        isMyTurn = myTurn;
        if (!turnText) return;
        turnText.textContent = myTurn ? "YOUR TURN" : "OPPONENT TURN";
    }

    function renderCell(position, symbol) {
        const cell = document.querySelector(`[data-position="${position}"]`);
        if (!cell) return;
        cell.innerHTML = symbolIcon(symbol);
        cell.disabled = true;
    }

    function showResults(message, winner) {
        if (!resultsOverlay || !resultText) return;

        const isDraw = winner === null || message.toLowerCase().includes("draw");
        const isVictory = !isDraw && winner === playerSymbol;

        if (isDraw) {
            resultText.textContent = "DRAW";
            resultText.classList.remove("text-primary-container", "text-secondary-container");
            resultText.classList.add("text-on-surface");
        } else if (isVictory) {
            resultText.textContent = "VICTORY";
            resultText.classList.remove("text-secondary-container");
            resultText.classList.add("text-primary-container");
        } else {
            resultText.textContent = "DEFEAT";
            resultText.classList.remove("text-primary-container");
            resultText.classList.add("text-secondary-container");
        }

        if (resultMessage) resultMessage.textContent = message;
        resultsOverlay.classList.add("is-visible");
    }

    function syncBoard(board) {
        if (!Array.isArray(board)) return;
        board.forEach((symbol, index) => {
            if (symbol) renderCell(index, symbol);
        });
    }

    function handleGameOver(data) {
        if (data.position != null && data.player) {
            renderCell(data.position, data.player);
        }
        syncBoard(data.board);
        updateTurnIndicator(false);
        document.querySelectorAll("[data-cell]").forEach((cell) => { cell.disabled = true; });
        setTimeout(() => {
            showResults(data.message, data.winner);
            setTimeout(() => {
                window.location.href = config.lobbyUrl || "/";
            }, 4000);
        }, 600);
    }

    document.querySelectorAll("[data-cell]").forEach((cell) => {
        cell.addEventListener("click", () => {
            if (!isMyTurn || cell.disabled) return;
            const position = parseInt(cell.dataset.position, 10);
            renderCell(position, playerSymbol);
            updateTurnIndicator(false);
            ws.send(JSON.stringify({
                type: "make_move",
                position,
                player: playerSymbol,
                game_id: config.gameId,
            }));
        });
    });

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "move") {
            renderCell(data.position, data.player);
            updateTurnIndicator(data.player !== playerSymbol);
        } else if (data.type === "game_over") {
            handleGameOver(data);
        } else if (data.type === "error") {
            console.error(data.message);
        }
    };
})();
