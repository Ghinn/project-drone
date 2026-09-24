import time
import json
import paho.mqtt.client as mqtt
from pymavlink import mavutil

# Konfigurasi MQTT Broker
MQTT_BROKER = "127.0.0.1" 
MQTT_PORT = 1883
MQTT_USER = "mqtt-dreampalm"
MQTT_PASS = "dreampalm"     

# Identifier Drone
DRONE_ID = "v1-001"         

# Konfigurasi MQTT Topics
MQTT_TOPIC_TELEMETRY = f"dreampalm/drone/uid/{DRONE_ID}/telemetryState"
MQTT_TOPIC_STATUS = f"dreampalm/drone/uid/{DRONE_ID}/status"         
# MQTT_TOPIC_ACTION = f"dreampalm/drone/uid/{DRONE_ID}/action"  

# Event Callback Connection
def on_connect(client, userdata, flags, reason_code, properties):
    print(f"[MQTT] Terhubung ke broker (Kode: {reason_code})")
    # Memublikasikan status "online" dengan flag retain=True
    client.publish(MQTT_TOPIC_STATUS, json.dumps({"status": "online"}), qos=1, retain=True)

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, f"VPS_Bridge_{DRONE_ID}")
client.username_pw_set(MQTT_USER, MQTT_PASS)

# IMPLEMENTASI LAST WILL AND TESTAMENT (LWT)
client.will_set(MQTT_TOPIC_STATUS, payload=json.dumps({"status": "offline"}), qos=1, retain=True)

client.on_connect = on_connect
client.connect(MQTT_BROKER, MQTT_PORT, keepalive=120)
client.loop_start()

# Struktur TelemetryState (GCS)
telemetry_data = {
    "roll": 0.0, "pitch": 0.0, "yaw": 0.0,
    "altitude": 0.0, "latitude": 0.0, "longitude": 0.0,
    "groundSpeed": 0.0, "mode": "STABILIZE",
    "battery": 100.0, "voltage": 0.0, "current": 0.0,
    "sys_check": {
        "gyro": False, "accelerometer": False, "magnetometer": False,
        "absolute_pressure": False, "differential_pressure": False,
        "gps": False, "optical_flow": False, "vision_position": False,
        "laser_position": False, "external_ground_truth": False,
        "angular_rate_control": False, "attitude_stabilization": False,
        "yaw_position": False, "z_position_control": False,
        "xy_position_control": False, "motor_outputs": False,
        "rc_receiver": False, 
        "gyro_cal": False, "accel_cal": False, "mag_cal": False 
    },
    "rc": {
        "ch6": "OFF", "ch7": "OFF", "ch8": "OFF", "ch9": "OFF"
    }
}

# Peta Bitmask MAV_SYS_STATUS_SENSOR
SENSOR_BITS = {
    "gyro": 1, "accelerometer": 2, "magnetometer": 4,
    "absolute_pressure": 8, "differential_pressure": 16,
    "gps": 32, "optical_flow": 64, "vision_position": 128,
    "laser_position": 256, "external_ground_truth": 512,
    "angular_rate_control": 1024, "attitude_stabilization": 2048,
    "yaw_position": 4096, "z_position_control": 8192,
    "xy_position_control": 16384, "motor_outputs": 32768,
    "rc_receiver": 65536
}

def parse_rc_switch(pwm_value):
    if pwm_value < 500: return "DISCONNECTED"
    elif pwm_value < 1300: return "OFF"
    elif 1300 <= pwm_value <= 1700: return "MODE_MID"
    else: return "MODE_HIGH"

print("Menunggu koneksi SITL Ardupilot dari luar (Port UDP 14550)...")

# MODIFIKASI: Menggunakan 'udpin:0.0.0.0' agar VPS mendengarkan dari semua antarmuka jaringan
master = mavutil.mavlink_connection('udpin:0.0.0.0:14550')

master.wait_heartbeat()
print("SITL Terhubung! Memulai streaming ke MQTT...") #[cite: 3]

# Data MAVLink dengan frekuensi 5 Hz
master.mav.request_data_stream_send(
    master.target_system,
    master.target_component,
    mavutil.mavlink.MAV_DATA_STREAM_ALL,
    5, 
    1  
)

last_pub_time = time.time()

while True:
    try:
        msg = master.recv_match(blocking=False)
        if not msg:
            continue

        msg_type = msg.get_type()

        if msg_type == 'ATTITUDE':
            telemetry_data['roll'] = msg.roll
            telemetry_data['pitch'] = msg.pitch
            telemetry_data['yaw'] = msg.yaw
    
        elif msg_type == 'GLOBAL_POSITION_INT':
            telemetry_data['latitude'] = msg.lat / 1e7
            telemetry_data['longitude'] = msg.lon / 1e7
            telemetry_data['altitude'] = msg.relative_alt / 1000.0
    
        elif msg_type == 'VFR_HUD':
            telemetry_data['groundSpeed'] = msg.groundspeed
    
        elif msg_type == 'HEARTBEAT':
            telemetry_data['mode'] = mavutil.mode_string_v10(msg)
    
        elif msg_type == 'SYS_STATUS':
            if msg.battery_remaining != -1:
                telemetry_data['battery'] = float(msg.battery_remaining)
            telemetry_data['voltage'] = msg.voltage_battery / 1000.0  
            telemetry_data['current'] = msg.current_battery / 100.0   

            health_mask = msg.onboard_control_sensors_health
            for sensor, bit in SENSOR_BITS.items():
                telemetry_data['sys_check'][sensor] = bool(health_mask & bit)
            
            telemetry_data['sys_check']['gyro_cal'] = telemetry_data['sys_check']['gyro']
            telemetry_data['sys_check']['accel_cal'] = telemetry_data['sys_check']['accelerometer']
            telemetry_data['sys_check']['mag_cal'] = telemetry_data['sys_check']['magnetometer']

        elif msg_type == 'RADIO_STATUS':
            telemetry_data['radio'] = {
                'rssi': msg.rssi,          # Sinyal lokal (0-254)
                'remrssi': msg.remrssi,    # Sinyal remote
                'noise': msg.noise,
                'txbuf': msg.txbuf         # Buffer transmisi (%)
            }
               
        elif msg_type == 'RC_CHANNELS':
            telemetry_data['rc']['ch6'] = parse_rc_switch(msg.chan6_raw)
            telemetry_data['rc']['ch7'] = parse_rc_switch(msg.chan7_raw)
            telemetry_data['rc']['ch8'] = parse_rc_switch(msg.chan8_raw)
            telemetry_data['rc']['ch9'] = parse_rc_switch(msg.chan9_raw) 

        current_time = time.time()
        if current_time - last_pub_time >= 1.0:
            payload = json.dumps(telemetry_data)
            client.publish(MQTT_TOPIC_TELEMETRY, payload)
            
            print(f"[VPS Bridge] Volt: {telemetry_data['voltage']}V | "
                  f"Cur: {telemetry_data['current']}A | "
                  f"Mode: {telemetry_data['mode']} | "
                  f"CH6: {telemetry_data['rc']['ch6']}")
            
            last_pub_time = current_time

    except Exception as e:
        print(f"Error pada parsing MAVLink: {e}")
        time.sleep(1)