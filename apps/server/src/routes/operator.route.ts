import { Router } from 'express';
import { requireSession } from '../middleware/auth.middleware';
import { 
  getMyProfile, 
  getMyDrone, 
  savePredictionSnapshot, 
  saveSprayLog 
} from '../controllers/operator.controller';
import { sendDroneCommand } from '../controllers/monitoringOperator.controller';
import { saveAnalyzeSnapshot } from '../controllers/analyze.controller';

const router = Router();

// Semua rute di bawah wajib melewati pengecekan sesi (Auth)
router.use(requireSession);

router.get('/me', getMyProfile);
router.get('/my-drone', getMyDrone);
router.post('/command', sendDroneCommand);

router.post('/analyze', saveAnalyzeSnapshot);
router.post('/prediction', savePredictionSnapshot);

router.post('/spray', saveSprayLog);

export default router;