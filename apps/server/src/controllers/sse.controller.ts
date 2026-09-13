import { Request, Response } from 'express';
import { addClient, removeClient } from '../services/sse.service';

export const streamTelemetrySSE = (req: Request, res: Response) => {
    addClient(res);

    req.on('close', () => {
        removeClient(res);
        res.end();
    });
};