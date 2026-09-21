import mqtt from 'mqtt';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { EventEmitter } from 'events';

export const telemetryEmitter = new EventEmitter();

// Map untuk menyimpan state banyak drone
const activeDronesState = new Map<string, any>();

export function initMqtt() {
    const client = mqtt.connect('mqtt://mqtt.dreampalm.id:1883', {
        username: process.env.MQTT_USERNAME || 'mqtt-dreampalm',
        password: process.env.MQTT_PASSWORD || 'dreampalm'
    });

    client.on('connect', () => {
        console.log('[MQTT] Backend terkoneksi ke broker.');
        // Subscribe dengan wildcard (+) pada parameter UID Drone
        client.subscribe('dreampalm/drone/uid/+/telemetryState');
        client.subscribe('dreampalm/drone/uid/+/status');
    });

    client.on('message', async (topic, message) => {
        try {
            const parts = topic.split('/');
            if (parts.length < 5) return;
            
            const droneId = parts[3]; 
            const topicType = parts[4]; 

            if (!message || message.length === 0) {
                console.warn(`[MQTT] Payload kosong dari drone ${droneId} (${topicType}), diabaikan.`);
                return;
            }

            let payload: any = {};
            try {
                payload = JSON.parse(message.toString());
            } catch (err) {
                console.error(`[MQTT] Format JSON tidak valid untuk drone ${droneId}:`, err);
                return;
            }

            // Topic_Status
            if (topicType === 'status') {
                const statusStr = payload.status; 
                
                try {
                    await prisma.drone.upsert({
                        where: { id: droneId },
                        update: { status: statusStr },
                        create: { id: droneId as string, status: statusStr }
                    });
                } catch (dbError) {
                    console.error(`[MQTT] Gagal mengupsert status drone ${droneId}:`, dbError);
                }

                // Emit SSE terlepas dari hasil operasi DB di atas
                telemetryEmitter.emit(`status_update_${droneId}`, { status: statusStr });
                telemetryEmitter.emit('status_update_all', { droneId, status: statusStr });
                console.log(`[Status] Drone ${droneId} terpantau: ${statusStr}`);

            } else if (topicType === 'telemetryState') {
                // [FIX 4] Menggunakan else if — memastikan hanya satu blok yang dieksekusi
                // per pesan, mencegah pemrosesan ganda jika topicType berubah di masa depan.
                const currentState = activeDronesState.get(droneId) || {};
                const updatedState = { ...currentState, ...payload, timestamp: new Date() };

                // Simpan cache terbaru ke Memory (RAM)
                activeDronesState.set(droneId, updatedState);

                // Emit ke SSE lebih dulu (prioritas real-time), lalu simpan ke DB
                telemetryEmitter.emit(`telemetry_update_${droneId}`, updatedState);

                try {
                    await prisma.telemetryLog.create({
                        data: {
                            droneId,
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
            // Menangkap error level teratas agar server tidak crash atau masuk loop-restart
            console.error('[MQTT] Unhandled fatal error saat memproses pesan:', fatalError);
        }
    });

    client.on('error', (err) => {
        console.error('[MQTT] Galat koneksi Broker:', err);
    });

    return client;
}

// Mengekspor fungsi untuk membaca state terbaru di RAM
export const getTelemetryLogStateByDrone = (droneId: string) => {
    return activeDronesState.get(droneId) || null;
};