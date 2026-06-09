import serial
import time

# Inisialisasi koneksi serial menggunakan RFC2217
nano = serial.serial_for_url(
    "rfc2217://localhost:4000",
    baudrate=9600,
    timeout=1
)

mega = serial.serial_for_url(
    "rfc2217://localhost:5000",
    baudrate=9600,
    timeout=1
)

print("SIAP MLAKU 2 ARAH")

while True:
    try:
        # ==========================================
        # JALUR 1: NANO -> PYTHON -> MEGA
        # ==========================================
        if nano.in_waiting:
            # Membaca data perintah dari Nano (termasuk '\n')
            data_from_nano = nano.readline()
            
            # Menampilkan log di terminal Python
            print("[NANO -> MEGA]:", data_from_nano.decode('utf-8', errors='ignore').strip())
            
            # Meneruskan data mentah ke Mega
            mega.write(data_from_nano)
            mega.flush()

        # ==========================================
        # JALUR 2: MEGA -> PYTHON -> NANO
        # ==========================================
        if mega.in_waiting:
            # Membaca data status dari Mega (termasuk '\n')
            data_from_mega = mega.readline()
            
            # Menampilkan log di terminal Python
            print("[MEGA -> NANO]:", data_from_mega.decode('utf-8', errors='ignore').strip())
            
            # Meneruskan data mentah ke Nano agar bisa ditangkap oleh processIncomingStatus()
            nano.write(data_from_mega)
            nano.flush()

        # Delay kecil untuk meringankan kerja CPU laptop
        time.sleep(0.01)

    except KeyboardInterrupt:
        print("\nProgram dihentikan oleh pengguna.")
        break
    except Exception as e:
        print(f"Terjadi error: {e}")
        time.sleep(1)

# Menutup koneksi saat keluar dari loop
nano.close()
# mega.close() # Aktifkan jika diperlukan, sesuaikan dengan penanganan port mega