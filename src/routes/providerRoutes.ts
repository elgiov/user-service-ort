import { Router } from 'express';
import providerController from '../controllers/providerController';

const router = Router();

router.post('/add', providerController.addProvider);
router.put('/:providerId', providerController.updateProvider);
router.delete('/:name', providerController.deleteProvider);
router.get('/', providerController.getProviders);
router.get('/:providerId/products', providerController.getProductsByProvider);
export default router;
