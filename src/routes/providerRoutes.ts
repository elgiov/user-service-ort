//@ts-nocheck
import { Router } from 'express';
import providerController from '../controllers/providerController';
import auth from '../shared/authorization_middleware/auth';

const router = Router();


router.post('/add', auth.verifyToken, auth.authRolePermissions(['ADMIN']), providerController.addProvider);
router.put('/:providerId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), providerController.updateProvider);
router.delete('/:providerId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), providerController.deleteProvider);
router.get('/', providerController.getProviders);
router.get('/:providerId/products', providerController.getProductsByProvider);
export default router;
