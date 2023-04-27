import { Router } from 'express';
import providerController from '../controllers/providerController';

const router = Router();

router.post('/add', providerController.addProvider);
router.put('/:providerId', providerController.updateProvider);
router.delete('/:name', providerController.deleteProvider);

export default router;