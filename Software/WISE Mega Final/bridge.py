import serial
import time
import threading
import asyncio
import websockets
import json
from datetime import datetime

# ==========================================
# CONNECT SERIAL DENGAN RETRY
# ==========================================

def connect_serial(url, label, retries=10, delay=2):
    for i in range(retries):
        try:
            s = serial.serial_for_url(url, baudrate=9600, timeout=1)
            print(f"[OK] {label} terhubung ke {url}")
            return s
        except Exception as e:
            print(f"[RETRY {i+1}/{retries}] {label} gagal: {e}")
            time.sleep(delay)
    raise Exception(f"[GAGAL] {label} tidak bisa konek ke {url}")

# ==========================================
# SHARED STATE
# ==========================================

latest_status = {
    "status": "LOCKED",
    "timestamp": ""
}

connected_clients = set()
loop = asyncio.new_event_loop()

# ==========================================
# WEBSOCKET
# ==========================================

async def ws_handler(websocket):
    connected_clients.add(websocket)
    print(f"[WS] Client terhubung, total: {len(connected_clients)}")
    await websocket.send(json.dumps(latest_status))
    try:
        async for message in websocket:
            print(f"[WEB -> PYTHON]: {message.strip()}")
            web_cmd = message.strip() + "\n"
            mega.write(web_cmd.encode())
            mega.flush()
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.discard(websocket)

async def broadcast(data: dict):
    if connected_clients:
        msg = json.dumps(data)
        await asyncio.gather(
            *[client.send(msg) for client in connected_clients],
            return_exceptions=True
        )

# ==========================================
# SERIAL BRIDGE
# ==========================================

def serial_bridge():
    nano_buf = b""
    mega_buf = b""

    while True:
        try:
            # NANO -> MEGA
            if nano.in_waiting:
                nano_buf += nano.read(nano.in_waiting)
                while b"\n" in nano_buf:
                    line, nano_buf = nano_buf.split(b"\n", 1)
                    line = line.strip() + b"\n"
                    decoded = line.decode('utf-8', errors='ignore').strip()
                    print(f"[NANO -> MEGA]: {decoded}")
                    mega.write(line)
                    mega.flush()

            # MEGA -> NANO + WEB
            if mega.in_waiting:
                mega_buf += mega.read(mega.in_waiting)
                while b"\n" in mega_buf:
                    line, mega_buf = mega_buf.split(b"\n", 1)
                    line = line.strip() + b"\n"
                    decoded = line.decode('utf-8', errors='ignore').strip()
                    print(f"[MEGA -> NANO]: {decoded}")

                    nano.write(line)
                    nano.flush()

                    if decoded in ("LOCKED", "UNLOCKED", "AUTHORIZED", "DENIED"):
                        latest_status["status"] = decoded
                        latest_status["timestamp"] = datetime.now().strftime("%H:%M:%S")
                        asyncio.run_coroutine_threadsafe(
                            broadcast(latest_status), loop
                        )

            time.sleep(0.005)

        except Exception as e:
            print(f"[SERIAL ERROR]: {e}")
            time.sleep(1)

# ==========================================
# MAIN
# ==========================================

# Konek serial setelah Wokwi siap
nano = connect_serial("rfc2217://localhost:4001", "NANO")
mega = connect_serial("rfc2217://localhost:4002", "MEGA")

print("WES MLAKU 2 ARAH + WEB")

t = threading.Thread(target=serial_bridge, daemon=True)
t.start()

async def main():
    async with websockets.serve(ws_handler, "localhost", 8765):
        print("[WS] Server jalan di ws://localhost:8765")
        await asyncio.Future()

asyncio.set_event_loop(loop)
loop.run_until_complete(main())