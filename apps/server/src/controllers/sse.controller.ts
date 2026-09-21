import { Request, Response } from 'express';
import { addClient } from '../services/sse.service';

export const streamTelemetrySSE = (req: Request, res: Response) => {
    addClient(req, res);
};