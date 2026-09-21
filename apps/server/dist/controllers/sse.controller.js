"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamTelemetrySSE = void 0;
const sse_service_1 = require("../services/sse.service");
const streamTelemetrySSE = (req, res) => {
    (0, sse_service_1.addClient)(req, res);
    req.on('close', () => {
        res.end();
    });
};
exports.streamTelemetrySSE = streamTelemetrySSE;
