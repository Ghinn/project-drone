import { Router } from 'express';
import { 
    getDashboardData, 
    getHistoriData, 
    getAnalisisData 
} from '../controllers/data.controller';

const router = Router();

// Mendefinisikan endpoint untuk masing-masing halaman frontend
router.get('/dashboard', getDashboardData);
router.get('/histori', getHistoriData);
router.get('/analisis', getAnalisisData);

export default router;