from pymavlink import mavutil
import paho.mqtt.client as mqtt
import json
import time

# Koneksi ke SITL_ArduPilot
master = mavutil.mavlink_connection('tcp:127.0.0.1:5760')
master.wait_heartbeat()
print("SITL Terhubung.")

# Koneksi ke MQTT Broker
mqtt_client = mqtt.Client()
mqtt_client.username_pw_set("mqtt-dreampalm", "dreampalm")
mqtt_client.connect("10.0.0.1", 1883, 60)

drone_id = "v1-002"
topic = f"dreampalm/drone/uid/{drone_id}/telemetryState"

while True:
    # Meminta data RC Channels dari MAVLink
    msg = master.recv_match(type='RC_CHANNELS', blocking=True)
    if not msg:
        continue

    # Membuat payload JSON serupa dengan data production
    telemetry_payload = {
        "status": "online",
        "flightMode": "standby",
        "sys_check": {
            "rc_receiver": True
        },
        "rc": {
            "ch5": msg.chan5_raw,
            "ch6": msg.chan6_raw,
            "ch7": msg.chan7_raw,
            "ch8": msg.chan8_raw
        }
    }
    
    # Publish ke Web App Backend
    mqtt_client.publish(topic, json.dumps(telemetry_payload))
    print(f"Published Telemetry: CH5={msg.chan5_raw}, CH6={msg.chan6_raw}, CH7={msg.chan7_raw}")
    time.sleep(1)