"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addClient = void 0;
const mqtt_service_1 = require("./mqtt.service");
let clients = [];
// Fungsi untuk menerima request dan menyambungkan aliran data
const addClient = (req, res) => {
    const userRole = req.currentUser?.role || req.firebaseToken?.role;
    const assignedDrone = req.currentUser?.assignedDroneId || req.firebaseToken?.assignedDrone;
    if (userRole !== 'ADMIN' && !assignedDrone) {
        res.status(403).json({ error: "Akun ini tidak memiliki akses ke perangkat keras mana pun." });
        return;
    }
    const targetDroneId = userRole === 'ADMIN' ? req.query.droneId : assignedDrone;
    if (!targetDroneId) {
        res.status(400).json({ error: "Drone ID diperlukan untuk pemantauan." });
        return;
    }
    // Setup Headers Khusus SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const initialState = (0, mqtt_service_1.getTelemetryLogStateByDrone)(targetDroneId);
    if (initialState) {
        res.write(`data: ${JSON.stringify({ type: 'telemetry', data: initialState })}\n\n`);
    }
    const clientObj = { res, droneId: targetDroneId };
    clients.push(clientObj);
    console.log(`[SSE] Client terhubung pada drone: ${targetDroneId}`);
    // Dynamic listener khusus untuk target Drone
    const telemetryHandler = (data) => {
        res.write(`data: ${JSON.stringify({ type: 'telemetry', data })}\n\n`);
    };
    const statusHandler = (data) => {
        res.write(`data: ${JSON.stringify({ type: 'status', data })}\n\n`);
    };
    mqtt_service_1.telemetryEmitter.on(`telemetry_update_${targetDroneId}`, telemetryHandler);
    mqtt_service_1.telemetryEmitter.on(`status_update_${targetDroneId}`, statusHandler);
    req.on('close', () => {
        console.log(`[SSE] Client terputus pada drone: ${targetDroneId}`);
        clients = clients.filter(c => c !== clientObj);
        mqtt_service_1.telemetryEmitter.off(`telemetry_update_${targetDroneId}`, telemetryHandler);
        mqtt_service_1.telemetryEmitter.off(`status_update_${targetDroneId}`, statusHandler);
        res.end();
    });
};
exports.addClient = addClient;
