import serial
import time

# =========================
# NANO
# =========================

nano = serial.serial_for_url(
    "rfc2217://localhost:4000",
    baudrate=9600,
    timeout=0.1
)

# =========================
# MEGA
# =========================

mega = serial.serial_for_url(
    "rfc2217://localhost:5000",
    baudrate=9600,
    timeout=0.1
)

print("======================")
print(" WISE BRIDGE RUNNING ")
print("======================")

while True:

    # =====================
    # NANO -> MEGA
    # =====================

    if nano.in_waiting:

        data = nano.readline()

        try:
            text = data.decode().strip()

            print(
                "[NANO -> MEGA]",
                text
            )

            mega.write(data)

        except:
            pass

    # =====================
    # MEGA -> NANO
    # =====================

    if mega.in_waiting:

        data = mega.readline()

        try:
            text = data.decode().strip()

            print(
                "[MEGA -> NANO]",
                text
            )

            nano.write(data)

        except:
            pass

    time.sleep(0.01)