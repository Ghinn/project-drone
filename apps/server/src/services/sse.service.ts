// apps/server/src/services/sse.service.ts
import { Response, Request } from 'express';
import { telemetryEmitter, getTelemetryLogStateByDrone } from './mqtt.service';

interface SseClient {
    res: Response;
    droneId: string;
}

let clients: SseClient[] = [];

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

    res.flushHeaders(); 

    const initialState = getTelemetryLogStateByDrone(targetDroneId);
    if (initialState) {
        res.write(`data: ${JSON.stringify({ type: 'telemetry', data: initialState })}\n\n`);
    }

    const clientObj = { res, droneId: targetDroneId };
    clients.push(clientObj);

    console.log(`[SSE] Client terhubung pada drone: ${targetDroneId}`);

    // Dynamic listener khusus untuk target Drone
    const telemetryHandler = (data: any) => {
        res.write(`data: ${JSON.stringify({ type: 'telemetry', data })}\n\n`);
    };

    const statusHandler = (data: any) => {
        res.write(`data: ${JSON.stringify({ type: 'status', data })}\n\n`);
    };

    telemetryEmitter.on(`telemetry_update_${targetDroneId}`, telemetryHandler);
    telemetryEmitter.on(`status_update_${targetDroneId}`, statusHandler);

    req.on('close', () => {
        console.log(`[SSE] Client terputus pada drone: ${targetDroneId}`);
        clients = clients.filter(c => c !== clientObj);
        telemetryEmitter.off(`telemetry_update_${targetDroneId}`, telemetryHandler);
        telemetryEmitter.off(`status_update_${targetDroneId}`, statusHandler);
        res.end();
    });
};