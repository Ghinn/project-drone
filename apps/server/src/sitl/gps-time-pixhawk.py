import time
import os
import sys
from pymavlink import mavutil

# Koneksi Flight Controller (Mission Planner)
print("[NTP-GPS] Menunggu koneksi ke Flight Controller via TELEM 2 (UART)...")

SERIAL_PORT = '/dev/ttyAMA0'
BAUD_RATE = 115200

master = mavutil.mavlink_connection(SERIAL_PORT, baud=BAUD_RATE)

print("Mencari sinyal Heartbeat dari Pixhawk...")
start_hb = time.time()
while True:
    if time.time() - start_hb > 30:
        print("[NTP-GPS] Gagal mendapat Heartbeat (Timeout 30s). Bypass ke MQTT.")
        sys.exit(0)

    msg = master.recv_match(type='HEARTBEAT', blocking=True, timeout=2.0)
    if msg:
        print(f"Flight Controller terhubung! System ID: {master.target_system}")
        break
    else:
        print("Menunggu heartbeat Pixhawk... (Periksa kabel TX/RX atau baudrate)")

# Meminta aliran data waktu dengan frekuensi 2 Hz
master.mav.request_data_stream_send(
    master.target_system,
    master.target_component,
    mavutil.mavlink.MAV_DATA_STREAM_EXTRA3,
    2,
    1
)

start_time = time.time()
print("[NTP-GPS] Menunggu GPS Location...")

while time.time() - start_time < 60:
    msg = master.recv_match(type='SYSTEM_TIME', blocking=True, timeout=1.0)

    # time_unix_usec bernilai 0 jika GPS belum sinkron
    if msg and msg.time_unix_usec > 0:
        unix_sec = msg.time_unix_usec / 1000000.0
        os.system(f"sudo date -s '@{unix_sec}'")
        print(f"[NTP-GPS] Sukses! Waktu disinkronkan via satelit.")
        sys.exit(0)

print("[NTP-GPS] Timeout. Melanjutkan proses...")
sys.exit(0)