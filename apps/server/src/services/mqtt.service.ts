import mqtt, { MqttClient } from 'mqtt';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { EventEmitter } from 'events';

export const telemetryEmitter = new EventEmitter();

const activeDronesState = new Map<string, any>();
let mqttClientInstance: MqttClient | null = null;

export function initMqtt() {
    const client = mqtt.connect('mqtt://mqtt.dreampalm.id:1883', {
        username: process.env.MQTT_USERNAME || 'mqtt-dreampalm',
        password: process.env.MQTT_PASSWORD || 'dreampalm'
    });

    mqttClientInstance = client;

    client.on('connect', () => {
        console.log('[MQTT] Backend terkoneksi ke broker.');
        // Subscribe dengan wildcard (+) pada parameter UID Drone
        client.subscribe('dreampalm/drone/uid/+/telemetryState');
        client.subscribe('dreampalm/drone/uid/+/command/status');
        // client.subscribe('dreampalm/drone/uid/+/command/system');
        // client.subscribe('dreampalm/drone/uid/+/command/action');
    });

    client.on('message', async (topic, message) => {
        try {
            const parts = topic.split('/');
            if (parts.length < 5) return;
            
            const droneId = parts[3]; 
            const category = parts[4]; 
            const subCategory = parts[5];

            let payload: any = {};

            try {
                payload = JSON.parse(message.toString());
            } catch (err) {
                console.error(`[MQTT] Format JSON tidak valid untuk drone ${droneId}:`, err);
                return;
            }

            if (category === 'command' && subCategory === 'status') {
                const statusStr = payload.status; 
                try {
                    await prisma.drone.upsert({
                        where: { id: droneId },
                        update: { status: statusStr },
                        create: { id: droneId as string, status: statusStr }
                    });

                    try {
                        telemetryEmitter.emit(`status_update_${droneId}`, { status: statusStr });
                        // telemetryEmitter.emit('status_update_all', { droneId: droneId, status: statusStr });
                    } catch (emitError) {
                        console.error(`[MQTT] Emitter Error pada Status ${droneId}:`, emitError);
                    }

                    console.log(`[Status] Drone ${droneId} terpantau: ${statusStr}`);
                } catch (dbError) {
                    console.error(`[MQTT] Gagal mengupsert status drone ${droneId}:`, dbError);
                }
            }

            if (category === 'telemetryState') {
                const currentState = activeDronesState.get(droneId) || {};
                const updatedState = { ...currentState, ...payload, timestamp: new Date() };
                
                activeDronesState.set(droneId, updatedState);
                
                try {
                    telemetryEmitter.emit(`telemetry_update_${droneId}`, updatedState);
                } catch (emitError) {
                    console.error(`[MQTT] Emitter Error pada Telemetri ${droneId}:`, emitError);
                }

                try {
                    await prisma.telemetryLog.create({
                        data: {
                            droneId: droneId,
                            roll: updatedState.roll ?? 0,
                            pitch: updatedState.pitch ?? 0,
                            yaw: updatedState.yaw ?? 0,
                            altitude: updatedState.altitude ?? 0,
                            latitude: updatedState.latitude ?? 0,
                            longitude: updatedState.longitude ?? 0,
                            groundSpeed: updatedState.groundSpeed ?? 0,
                            mode: updatedState.mode ?? "STABILIZE",
                            battery: updatedState.battery ?? 100,
                            voltage: updatedState.voltage ?? 0,
                            current: updatedState.current ?? 0,
                            sys_check: updatedState.sys_check ?? {},
                            rc: updatedState.rc ?? {},
                        }
                    });
                } catch (dbError) {
                    console.error(`[MQTT] Gagal menyimpan log telemetri DB ${droneId}:`, dbError);
                }
            }
        } catch (fatalError) {
            console.error('[MQTT] Unhandled fatal error saat memproses pesan:', fatalError);
        }
    });

    client.on('error', (err) => {
        console.error('[MQTT] Galat koneksi Broker:', err);
    });

    return client;
}

export const publishDroneCommand = (droneId: string, targetTopic: 'system' | 'action', command: string) => {
    if (!mqttClientInstance || !mqttClientInstance.connected) {
        throw new Error("MQTT Client belum terhubung ke broker.");
    }
    
    const topic = `dreampalm/drone/uid/${droneId}/command/${targetTopic}`;
    const payload = JSON.stringify({ command, timestamp: new Date() });
    
    mqttClientInstance.publish(topic, payload);
    console.log(`[MQTT] command '${command}' dikirim ke topic: ${topic}`);
};

export const getTelemetryLogStateByDrone = (droneId: string) => {
    return activeDronesState.get(droneId) || null;
};