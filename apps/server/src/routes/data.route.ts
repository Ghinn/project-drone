import { Router } from 'express';
import { 
    getDashboardData, 
    getDataLogs, 
    getDataStats,
    streamTelemetrySSE
} from '../controllers/data.controller';
import { requireSession } from '../middleware/auth.middleware';

const router = Router();

router.use(requireSession);

// Mendefinisikan endpoint untuk masing-masing halaman frontend
router.get('/dashboard', getDashboardData);
router.get('/histori', getDataLogs);
router.get('/analisis', getDataStats);

// Endpoint baru untuk dikonsumsi Next.js EventSource
router.get('/stream', requireSession, streamTelemetrySSE);

export default router;