import { Router } from 'express';

// Import Controllers Farmer
import { 
    getFarmerDashboard, 
    getFarmerFields,
    getFarmerReports,
    getFarmerSettings
} from '../controllers/monitoringFarmer.controller';

import { requireSession, requireFarmer } from '../middleware/auth.middleware';

const router = Router();

// Route Role Farmer (Protected)
router.use(requireSession, requireFarmer);

// Data Fetching Endpoint untuk Halaman Farmer
router.get('/dashboard', getFarmerDashboard);
router.get('/fields-map', getFarmerFields);
router.get('/reports', getFarmerReports);
router.get('/settings', getFarmerSettings);

export default router;