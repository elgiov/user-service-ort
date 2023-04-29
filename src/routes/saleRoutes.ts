//@ts-nocheck
import { Router } from 'express';
import saleController from '../controllers/saleController';
import auth from '../shared/authorization_middleware/auth';

const router = Router();

router.post('', saleController.createSale);
router.get('/', auth.verifyToken, saleController.getSales);
router.get('/by-product', auth.verifyToken, saleController.getSalesByProduct);
export default router;
