//@ts-nocheck
import { Router } from 'express';
import saleController from '../controllers/saleController';
import auth from '../../../shared-middleware/src/auth';

const router = Router();

router.post('/', auth.verifyToken, saleController.createSale);
router.get('/', auth.verifyToken, saleController.getSales);
router.get('/top-products/:company', saleController.getSalesByProduct);
router.post('/subscribe/:productId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), saleController.subscribeToProduct);
router.delete('/unsubscribe/:productId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), saleController.unsubscribeFromProduct);

export default router;