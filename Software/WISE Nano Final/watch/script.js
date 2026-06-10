let locked = true;

// ==========================================
// CLOCK & DATE
// ==========================================

function updateTime()
{
    const now = new Date();

    document.getElementById("clock").innerHTML =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        );

    document.getElementById("date").innerHTML =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday:"short",
                day:"2-digit",
                month:"short"
            }
        );
}

setInterval(updateTime, 1000);
updateTime();

// ==========================================
// LOCK / UNLOCK UI
// ==========================================

function setLocked()
{
    locked = true;

    const lockText = document.getElementById("lockText");
    const message  = document.getElementById("message");
    const car      = document.getElementById("carImage");

    lockText.innerHTML = "LOCKED";
    lockText.className = "locked";

    message.innerHTML  = "● Mobil Aman";
    message.style.color = "#00ff66";

    car.style.filter = "drop-shadow(0px 0px 20px #00aaff)";
}

function setUnlocked()
{
    locked = false;

    const lockText = document.getElementById("lockText");
    const message  = document.getElementById("message");
    const car      = document.getElementById("carImage");

    lockText.innerHTML = "UNLOCKED";
    lockText.className = "locked unlocked";

    message.innerHTML  = "○ Pintu Terbuka";
    message.style.color = "#ffaa00";

    car.style.filter = "drop-shadow(0px 0px 20px #ffaa00)";
}

function setDenied()
{
    const message = document.getElementById("message");

    message.innerHTML   = "✕ Akses Ditolak";
    message.style.color = "#ff3333";

    // Kembali ke pesan normal setelah 2 detik
    setTimeout(() => {
        if (locked) {
            message.innerHTML   = "● Mobil Aman";
            message.style.color = "#00ff66";
        } else {
            message.innerHTML   = "○ Pintu Terbuka";
            message.style.color = "#ffaa00";
        }
    }, 2000);
}

// ==========================================
// WEBSOCKET
// ==========================================

const ws = new WebSocket("ws://localhost:8765");

ws.onopen = () => {
    console.log("[WS] Terhubung ke Python bridge");

    const status = document.querySelector(".status");
    status.innerHTML   = "Connected";
    status.style.color = "#00ff66";
};

ws.onclose = () => {
    console.log("[WS] Koneksi terputus");

    const status = document.querySelector(".status");
    status.innerHTML   = "Disconnected";
    status.style.color = "#ff3333";
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("[WS] Data masuk:", data);

    if (data.status === "LOCKED")        setLocked();
    else if (data.status === "UNLOCKED") setUnlocked();
    else if (data.status === "AUTHORIZED") setUnlocked();
    else if (data.status === "DENIED")   setDenied();
};

// ==========================================
// KIRIM COMMAND KE MEGA LEWAT WS
// ==========================================

function sendCommand(cmd)
{
    if (ws.readyState === WebSocket.OPEN)
    {
        ws.send(cmd);
        console.log(`[WEB -> WS]: ${cmd}`);
    }
    else
    {
        console.warn("[WS] Belum terhubung");
    }
}

// ==========================================
// DEMO TOGGLE (tombol existing di HTML)
// ==========================================

function toggleLock()
{
    if (locked) sendCommand("CMD2"); // kirim unlock ke Mega
    else        sendCommand("CMD1"); // kirim lock ke Mega
}