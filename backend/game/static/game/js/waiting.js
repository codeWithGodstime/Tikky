(function () {
    const configEl = document.getElementById("waiting-config");
    if (!configEl) return;

    const config = JSON.parse(configEl.textContent);
    const wsUrl = `${config.wsScheme}://${window.location.host}/ws/${config.username}/${config.gameId}/`;
    const ws = new WebSocket(wsUrl);

    const p2Slot = document.getElementById("p2-slot");
    const p2Name = document.getElementById("p2-name");
    const p2Status = document.getElementById("p2-status");
    const p2Icon = document.getElementById("p2-icon");
    const startBtn = document.getElementById("start-btn");
    const copyBtn = document.getElementById("copy-link-btn");
    const roomCode = document.getElementById("room-code");

    function activateP2(name) {
        if (!p2Slot) return;
        p2Slot.classList.remove("border-outline-variant");
        p2Slot.classList.add("border-secondary");
        if (p2Name) {
            p2Name.textContent = name;
            p2Name.classList.remove("text-on-surface-variant");
            p2Name.classList.add("text-secondary");
        }
        if (p2Status) p2Status.textContent = "STATUS: READY";
        if (p2Icon) {
            p2Icon.classList.remove("border-dashed", "border-outline-variant", "animate-pulse");
            p2Icon.classList.add("border-secondary");
            p2Icon.innerHTML = '<span class="material-symbols-outlined text-secondary text-4xl" style="font-variation-settings: \'wght\' 200;">circle</span>';
        }
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.classList.remove("opacity-50", "cursor-not-allowed");
            startBtn.classList.add("hover:bg-primary", "hover:text-background");
        }
    }

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "join") {
            const name = data.message.replace(" joined", "");
            activateP2(name);
        } else if (data.type === "start") {
            window.location.href = config.playUrl;
        }
    };

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            ws.send(JSON.stringify({ type: "start", game_id: config.gameId }));
        });
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise((resolve, reject) => {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy");
                resolve();
            } catch (error) {
                reject(error);
            } finally {
                document.body.removeChild(textarea);
            }
        });
    }

    function showCopiedFeedback() {
        if (!copyBtn) return;
        const original = copyBtn.textContent;
        copyBtn.textContent = "COPIED!";
        setTimeout(() => {
            copyBtn.textContent = original;
        }, 1500);
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const joinUrl = copyBtn.dataset.joinUrl || config.joinUrl;
            copyToClipboard(joinUrl)
                .then(showCopiedFeedback)
                .catch(() => {
                    const joinUrlEl = document.getElementById("join-url");
                    if (joinUrlEl) {
                        const range = document.createRange();
                        range.selectNodeContents(joinUrlEl);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                });
        });
    }

    if (roomCode) {
        roomCode.addEventListener("click", () => {
            roomCode.style.color = "#00ff41";
            setTimeout(() => { roomCode.style.color = ""; }, 500);
        });
    }
})();
