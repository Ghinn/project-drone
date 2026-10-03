import subprocess
# import os
import time
import json
import threading
import uuid
import cv2
import requests
import math
import paho.mqtt.client as mqtt
from pymavlink import mavutil
from gpiozero import PWMOutputDevice

# Konfigurasi MQTT Broker via WireGuard
MQTT_BROKER = "10.0.0.1"
MQTT_PORT = 1883
MQTT_USER = "mqtt-dreampalm"
MQTT_PASS = "dreampalm"

# BACKEND API URL
BACKEND_API_BASE_URL = "http://192.168.100.124:4000/api/data/snapshot/upload"
# BACKEND_API_BASE_URL = "http://api.dreampalm.id:4000/api/data/snapshot/upload"

# Identifier Drone
DRONE_ID = "v1-001"

# Konfigurasi MQTT Topics
MQTT_TOPIC_TELEMETRY = f"dreampalm/drone/uid/{DRONE_ID}/telemetryState"
MQTT_TOPIC_STATUS = f"dreampalm/drone/uid/{DRONE_ID}/command/status"
MQTT_TOPIC_SYSTEM = f"dreampalm/drone/uid/{DRONE_ID}/command/system"
MQTT_TOPIC_ACTION = f"dreampalm/drone/uid/{DRONE_ID}/command/action"

try:
    # Pin 18, frekuensi 50Hz (standar RC)
    camera_trigger = PWMOutputDevice(18, frequency=50)
    # Set ke posisi idle / 1000µs (5% duty cycle dari 20ms)
    camera_trigger.value = 0.05
    print("[Camera] GPIO 18 berhasil diinisialisasi.")
except Exception as e:
    print(f"[Camera] Gagal menginisialisasi GPIO 18: {e}")
    camera_trigger = None

def trigger_camera_task():
    if camera_trigger:
        print("[ACTION] Mengirim PWM Trigger 2000us ke Mapir Survey3...")
        camera_trigger.value = 0.10  # 10% duty cycle = 2000µs (Trigger)
        time.sleep(0.5)         # Tahan 0.5 detik
        camera_trigger.value = 0.05  # Kembalikan ke idle (1000µs)
        print("[ACTION] Trigger camera selesai.")
    else:
        print("[ACTION] Gagal trigger: camera_trigger tidak terinisialisasi.")

def capture_and_upload_task():
    print("[ACTION] Mengambil snapshot OpenCV dari /dev/video6...")
    # Buka kamera virtual 2
    # cap = cv2.VideoCapture('/dev/video6', cv2.CAP_V4L2)
    # cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    # cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap = cv2.VideoCapture('/dev/video6')

    time.sleep(0.5)
    
    # Baca 1 frame
    ret, frame = cap.read()
    cap.release()
    
    if ret:
        print("[ACTION] Snapshot berhasil diambil. Memproses unggahan ke server...")
        # Konversi array piksel ke format file .jpg
        success, buffer = cv2.imencode('.jpg', frame)
        if success:
            try:
                # Siapkan payload multipart/form-data
                files = {
                    'image': ('snapshot.jpg', buffer.tobytes(), 'image/jpeg')
                }
                data = {
                    'droneId': DRONE_ID
                }
                # Tembak ke endpoint backend
                response = requests.post(BACKEND_API_BASE_URL, files=files, data=data, timeout=10)
                print(f"[ACTION] Upload selesai. Server merespons dengan kode: {response.status_code}")
            except Exception as e:
                print(f"[ACTION] Gagal mengunggah snapshot ke server: {e}")
    else:
        print("[ACTION] Gagal membaca frame dari /dev/video6.")

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # Radius bumi dalam meter
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

# Event Callback Connection
def on_connect(client, userdata, flags, reason_code, properties):
    print(f"[MQTT] Terhubung ke broker (Kode: {reason_code})")

    client.subscribe(MQTT_TOPIC_SYSTEM)
    client.subscribe(MQTT_TOPIC_ACTION)

    # Memublikasikan status "online" dengan flag retain=True
    client.publish(MQTT_TOPIC_STATUS, json.dumps({"status": "online"}), qos=1, retain=True)

def on_message(client, userdata, msg):
    topic = msg.topic
    
    try:
        payload = json.loads(msg.payload.decode('utf-8'))
        command = payload.get("command")
        
        # Logika Command SYSTEM (Restart WiFi)
        if topic == MQTT_TOPIC_SYSTEM:
            if command == "reboot_os":
                # print("[SYSTEM] Restart WiFi...")
                print("[SYSTEM] Reboot OS...")
                # os.system("sudo reboot")
                subprocess.run(["sudo", "reboot"], check=False)
                # os.system("sudo ip link set wlan0 down && sudo ip link set wlan0 up")
        
        # Logika Command ACTION (Camera)
        elif topic == MQTT_TOPIC_ACTION:
            if command == "take_picture":
                print("[ACTION] Trigger kamera diaktifkan...")
                # Trigger fisik MAPIR via PWM (simpan ke SD Card)
                threading.Thread(target=trigger_camera_task, daemon=True).start()
                # Trigger virtual OpenCV (upload ke backend AI)
                threading.Thread(target=capture_and_upload_task, daemon=True).start()

            elif command == "spray_on":
                print("[ACTION] Trigger penyemprotan diaktifkan...")
                master.mav.command_long_send(
                    master.target_system, master.target_component,
                    mavutil.mavlink.MAV_CMD_DO_SET_SERVO, 0,
                    9, 2000, 0, 0, 0, 0, 0
                )

            elif command == "spray_off":
                print("[ACTION] Trigger penyemprotan dinonaktifkan...")
                master.mav.command_long_send(
                    master.target_system, master.target_component,
                    mavutil.mavlink.MAV_CMD_DO_SET_SERVO, 0,
                    9, 1000, 0, 0, 0, 0, 0
                )
                
    except Exception as e:
        print(f"[MQTT] Error memproses payload: {e}")

def monitor_mavlink_ack(master):
    while True:
        msg = master.recv_match(type=['COMMAND_ACK', 'SERVOUT'], blocking=False)
        if msg:
            if msg.get_type() == 'COMMAND_ACK':
                print(f"[MAVLink ACK] Command {msg.command} hasil: {msg.result} (0=Success)")
            elif msg.get_type() == 'SERVOUT':
                # Memantau perubahan PWM pada channel 9 secara real-time
                print(f"[PWM Output] Channel 9: {msg.servo9_raw}")
        time.sleep(0.1)

client_id_uniq = f"Phase_Production_{DRONE_ID}_{uuid.uuid4().hex[:6]}"
client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id_uniq)
client.username_pw_set(MQTT_USER, MQTT_PASS)

# IMPLEMENTASI LAST WILL AND TESTAMENT (LWT)
client.will_set(MQTT_TOPIC_STATUS, payload=json.dumps({"status": "offline"}), qos=1, retain=True)

client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT, keepalive=15)
client.loop_start()

drone_is_armed = False
drone_is_flying = False

home_lat = None
home_lon = None

# Struktur TelemetryState (GCS)
telemetry_data = {
    # Navigasi dan Posisi
    "roll": 0.0, "pitch": 0.0, "yaw": 0.0,
    "altitude": 0.0, "latitude": 0.0, "longitude": 0.0,
    "groundSpeed": 0.0, "climbRate": 0.0, "distanceToHome": 0.0, "mode": "STABILIZE",
    "flightMode": "standby",
    
    # Kelistrikan
    "battery": 100.0, "voltage": 0.0, "current": 0.0,
    
    # Pre-flight System Check (Boolean)
    "sys_check": {
        "gyro": False, "accelerometer": False, "magnetometer": False,
        "absolute_pressure": False, "gps": False,
        "ahrs": False, "terrain": False, "battery_monitor": False,
        "angular_rate_control": False, "attitude_stabilization": False,
        "yaw_position": False, "motor_outputs": False,
        "rc_receiver": False, 
        "gyro_cal": False, "accel_cal": False, "mag_cal": False 
    },
    
    # RC Switch Status
    "rc": {
        "ch6": "OFF", "ch7": "OFF", "ch8": "OFF", "ch9": "OFF"
    },

    # Kualitas Sinyal
    "radio": {
        "rssi": 0, 
        "remrssi": 0, 
        "noise": 0, 
        "txbuf": 0
    }
}

# Peta Bitmask MAV_SYS_STATUS_SENSOR
SENSOR_BITS = {
    "gyro": 1, "accelerometer": 2, "magnetometer": 4,
    "absolute_pressure": 8, "gps": 32,
    "angular_rate_control": 1024, "attitude_stabilization": 2048,
    "yaw_position": 4096, "motor_outputs": 32768,
    "rc_receiver": 65536,
    "ahrs": 2097152,
    "terrain": 4194304,
    "battery_monitor": 33554432
}

def parse_rc_switch(pwm_value):
    if pwm_value < 500: return "DISCONNECTED"
    elif pwm_value < 1300: return "OFF"
    elif 1300 <= pwm_value <= 1700: return "MODE_MID"
    else: return "MODE_HIGH"

# Koneksi Flight Controller (Mission Planner)
print("Menunggu koneksi ke Flight Controller via TELEM 2 (UART)...")

# Sesuaikan dengan port fisik yang Anda gunakan di Raspberry Pi:
# - Jika menggunakan kabel USB: '/dev/ttyACM0' atau '/dev/ttyUSB0'
# - Jika menggunakan pin GPIO/UART (TELEM1/TELEM2): '/dev/serial0' atau '/dev/ttyAMA0'
SERIAL_PORT = '/dev/ttyAMA0' 
BAUD_RATE = 115200  # Sesuaikan baudrate port FC Anda (umumnya 57600, 115200, atau 921600)

master = mavutil.mavlink_connection(SERIAL_PORT, baud=BAUD_RATE)
# master.wait_heartbeat()
# print(f"Flight Controller terhubung di {SERIAL_PORT} (Baud: {BAUD_RATE})! Memulai streaming ke MQTT via WireGuard...")

print("Mencari sinyal Heartbeat dari Pixhawk...")
while True:
    msg = master.recv_match(type='HEARTBEAT', blocking=True, timeout=2.0)
    if msg:
        print(f"Flight Controller terhubung! System ID: {master.target_system}")
        break
    else:
        print("Menunggu heartbeat Pixhawk... (Periksa kabel TX/RX atau baudrate)")

# Meminta data stream MAVLink dengan frekuensi 5 Hz
master.mav.request_data_stream_send(
    master.target_system,
    master.target_component,
    mavutil.mavlink.MAV_DATA_STREAM_ALL,
    5, 
    1  
)

# Loop Pembacaan MAVLink dan Publish MQTT
last_pub_time = time.time()

while True:
    try:
        msg = master.recv_match(blocking=False)
        if not msg:
            continue

        msg_type = msg.get_type()

        # Ekstraksi Navigasi dan Posisi
        if msg_type == 'ATTITUDE':
            telemetry_data['roll'] = msg.roll
            telemetry_data['pitch'] = msg.pitch
            telemetry_data['yaw'] = msg.yaw

        # Ekstraksi Home Position
        elif msg_type == 'HOME_POSITION':
            home_lat = msg.latitude / 1e7
            home_lon = msg.longitude / 1e7

        # Ekstraksi Current Position
        elif msg_type == 'GLOBAL_POSITION_INT':
            current_lat = msg.lat / 1e7
            current_lon = msg.lon / 1e7
            
            telemetry_data['latitude'] = current_lat
            telemetry_data['longitude'] = current_lon
            telemetry_data['altitude'] = msg.relative_alt / 1000.0
            
            # Fallback: Jika HOME_POSITION belum didapat, jadikan koordinat valid pertama sebagai Home
            if home_lat is None and current_lat != 0.0:
                home_lat = current_lat
                home_lon = current_lon
                print(f"[GPS] Home Point di-set ke: {home_lat}, {home_lon}")

            # Hitung distanceToHome
            if home_lat is not None and home_lon is not None:
                dist = calculate_distance(home_lat, home_lon, current_lat, current_lon)
                telemetry_data['distanceToHome'] = round(dist, 2)

        elif msg_type == 'VFR_HUD':
            telemetry_data['groundSpeed'] = round(msg.groundspeed, 2)
            telemetry_data['climbRate'] = round(msg.climb, 2)

        elif msg_type == 'HEARTBEAT':
            telemetry_data['mode'] = mavutil.mode_string_v10(msg)
            drone_is_armed = bool(msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED)

        # Indikator Penerbangan dan Pre-Flight System Check
        elif msg_type == 'SYS_STATUS':
            if msg.battery_remaining != -1:
                telemetry_data['battery'] = float(msg.battery_remaining)
            telemetry_data['voltage'] = msg.voltage_battery / 1000.0  
            telemetry_data['current'] = msg.current_battery / 100.0   

            health_mask = msg.onboard_control_sensors_health
            enabled_mask = msg.onboard_control_sensors_enabled

            for sensor, bit in SENSOR_BITS.items():
                is_enabled = bool(enabled_mask & bit)
                is_healthy = bool(health_mask & bit)

                if is_enabled:
                    telemetry_data['sys_check'][sensor] = is_healthy
                else:
                    telemetry_data['sys_check'][sensor] = None
            
            telemetry_data['sys_check']['gyro_cal'] = telemetry_data['sys_check']['gyro']
            telemetry_data['sys_check']['accel_cal'] = telemetry_data['sys_check']['accelerometer']
            telemetry_data['sys_check']['mag_cal'] = telemetry_data['sys_check']['magnetometer']

        # CEK IN-FLIGHT STATE DARI EXTENDED_SYS_STATE
        elif msg_type == 'EXTENDED_SYS_STATE':
            # 1 = MAV_LANDED_STATE_ON_GROUND, 2 = MAV_LANDED_STATE_IN_AIR
            if msg.landed_state == 2:
                drone_is_flying = True
            elif msg.landed_state == 1:
                drone_is_flying = False

        # Ekstraksi Kualitas Sinyal Radio
        elif msg_type == 'RADIO_STATUS':
            telemetry_data['radio'] = {
                'rssi': msg.rssi,          # Sinyal lokal (0-254)
                'remrssi': msg.remrssi,    # Sinyal remote
                'noise': msg.noise,
                'txbuf': msg.txbuf         # Buffer transmisi (%)
            }
            
        # Ekstraksi RC Switch
        elif msg_type == 'RC_CHANNELS':
            telemetry_data['rc']['ch6'] = parse_rc_switch(msg.chan6_raw)
            telemetry_data['rc']['ch7'] = parse_rc_switch(msg.chan7_raw)
            telemetry_data['rc']['ch8'] = parse_rc_switch(msg.chan8_raw)
            telemetry_data['rc']['ch9'] = parse_rc_switch(msg.chan9_raw)

        # Publish ke MQTT Broker setiap 1 detik
        current_time = time.time()
        if current_time - last_pub_time >= 1.0:
            if not drone_is_armed:
                telemetry_data['flightMode'] = "standby"
            else:
                if drone_is_flying or telemetry_data['altitude'] > 0.5:
                    telemetry_data['flightMode'] = "in-flight"
                else:
                    telemetry_data['flightMode'] = "armed"

            # simulated_rssi = int((math.sin(time.time() / 2) + 1) * 127) 
            # telemetry_data['radio']['rssi'] = simulated_rssi

            payload = json.dumps(telemetry_data)
            client.publish(MQTT_TOPIC_TELEMETRY, payload)
            
            print(f"[Production Log] Volt: {telemetry_data['voltage']}V | "
                  f"Mode: {telemetry_data['mode']} | "
                  f"State: {telemetry_data['flightMode'].upper()} | "
                  f"CH6: {telemetry_data['rc']['ch6']}")
            
            last_pub_time = current_time

    except Exception as e:
        print(f"Error pada parsing MAVLink: {e}")
        time.sleep(1)