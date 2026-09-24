import { Router } from 'express';
import { requireSession } from '../middleware/auth.middleware';
import { getMyProfile, getMyDrone, savePredictionSnapshot, saveSprayLog } from '../controllers/operator.controller';
import { sendDroneCommand } from '../controllers/monitoringOperator.controller';

const router = Router();

router.use(requireSession);

router.get('/me', getMyProfile);
router.get('/my-drone', getMyDrone);
router.post('/command', sendDroneCommand);
router.post('/prediction', savePredictionSnapshot);
router.post('/spray', saveSprayLog);

export default router;