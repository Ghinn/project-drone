import { Response, Request } from 'express';
import { telemetryEmitter, getTelemetryLogStateByDrone } from './mqtt.service';

interface SseClient {
    res: Response;
    droneId: string;
}

let clients: SseClient[] = [];

const ALLOWED_ORIGINS: string[] = [
    'https://app.dreampalm.id',
    'https://dreampalm.id',
    'http://localhost:3000',
];

// Helper SSE
const safeWrite = (res: Response, payload: object): void => {
    if (!res.writableEnded && !res.destroyed) {
        try {
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
        } catch (err) {
            console.warn('[SSE] Gagal mewrite ke stream (client sudah disconnect):', (err as Error).message);
        }
    }
};

// Helper CORS withCredentials
const setCorsHeaders = (req: Request, res: Response): void => {
    const requestOrigin = req.headers.origin ?? '';

    const corsOrigin = ALLOWED_ORIGINS.includes(requestOrigin)
        ? requestOrigin
        : ALLOWED_ORIGINS[0];

    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
};

// Fungsi untuk menerima request dan menyambungkan aliran data
export const addClient = (req: Request, res: Response) => {
    const userRole = req.currentUser?.role || req.firebaseToken?.role;
    const assignedDrone = req.currentUser?.assignedDroneId || (req.firebaseToken as any)?.assignedDrone;

    if (userRole !== 'ADMIN' && !assignedDrone) {
        res.status(403).json({ error: "Akun ini tidak memiliki akses ke perangkat keras mana pun." });
        return;
    }

    const targetDroneId = userRole === 'ADMIN' ? (req.query.droneId as string) : assignedDrone;

    if (!targetDroneId) {
        res.status(400).json({ error: "Drone ID diperlukan untuk pemantauan." });
        return;
    }
    
    // Setup Headers Khusus SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    setCorsHeaders(req, res);
    res.flushHeaders();

    if (userRole === 'ADMIN' && targetDroneId === 'ALL') {
        const statusAllHandler = (data: any) => {
            safeWrite(res, { type: 'status_all', data });
        };

        telemetryEmitter.on('status_update_all', statusAllHandler);

        req.on('close', () => {
            telemetryEmitter.off('status_update_all', statusAllHandler);
            if (!res.writableEnded) res.end();
        });

        return;
    }

    const initialState = getTelemetryLogStateByDrone(targetDroneId);
    if (initialState) {
        safeWrite(res, { type: 'telemetry', data: initialState });
    }

    const clientObj = { res, droneId: targetDroneId };
    clients.push(clientObj);
    console.log(`[SSE] Client terhubung pada drone: ${targetDroneId}. Total: ${clients.length}`);

    const telemetryHandler = (data: any) => {
        safeWrite(res, { type: 'telemetry', data });
    };

    const statusHandler = (data: any) => {
        safeWrite(res, { type: 'status', data });
    };

    telemetryEmitter.on(`telemetry_update_${targetDroneId}`, telemetryHandler);
    telemetryEmitter.on(`status_update_${targetDroneId}`, statusHandler);

    req.on('close', () => {
        console.log(`[SSE] Client terputus pada drone: ${targetDroneId}.`);
        clients = clients.filter(c => c !== clientObj);
        telemetryEmitter.off(`telemetry_update_${targetDroneId}`, telemetryHandler);
        telemetryEmitter.off(`status_update_${targetDroneId}`, statusHandler);
        if (!res.writableEnded) res.end();
    });
};