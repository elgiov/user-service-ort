import { Router } from 'express';
import purchaseController from '../controllers/purchaseController';
import auth from '../shared/authorization_middleware/auth';

const router = Router();

router.post('', purchaseController.createPurchase);
//@ts-ignore
router.get('/:providerId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), purchaseController.getPurchasesForProvider);

export default router;
