//@ts-nocheck
import { Router } from 'express';
import providerController from '../controllers/providerController';
import auth from '../../../shared-middleware/src/auth';

const router = Router();

router.post('/add', auth.verifyToken, auth.authRolePermissions(['ADMIN']), providerController.addProvider);
router.put('/:providerId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), providerController.updateProvider);
router.delete('/:providerId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), providerController.deleteProvider);
router.get('/id/:providerId', providerController.findProviderById);
router.get('/', auth.verifyToken, providerController.getProviders);
router.get('/:providerId/products', auth.verifyToken, providerController.getProductsByProvider);
export default router;
