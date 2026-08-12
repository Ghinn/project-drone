import { Router } from 'express';

// Import Controllers Operator
import { 
    getDashboardData, 
    getHistoriData, 
    getAnalisisData,
    getLiveCameraData,
    getSettingsData
} from '../controllers/monitoringOperator.controller';

import { requireSession, requireOperator } from '../middleware/auth.middleware';

const router = Router();

// Route Role Operator (Protected)
router.use(requireSession, requireOperator);

// Data Fetching Endpoint untuk Halaman Operator
router.get('/dashboard', getDashboardData);
router.get('/live-camera', getLiveCameraData);
router.get('/ai-prediction-log', getAnalisisData);
router.get('/history', getHistoriData);
router.get('/settings', getSettingsData);

export default router;