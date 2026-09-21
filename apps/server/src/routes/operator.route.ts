import { Router } from 'express';
import { requireSession } from '../middleware/auth.middleware';
import { getMyProfile, getMyDrone } from '../controllers/operator.controller';

const router = Router();

router.use(requireSession);

router.get('/me', getMyProfile);
router.get('/my-drone', getMyDrone);

export default router;