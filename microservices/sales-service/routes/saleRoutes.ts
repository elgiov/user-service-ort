//@ts-nocheck
import { Router } from 'express';
import saleController from '../controllers/saleController';
import auth from '../../../shared-middleware/src/auth';

const router = Router();

router.post('/', auth.verifyToken, saleController.createSale);
router.get('/', auth.verifyToken, saleController.getSales);
router.get('/by-company/:id', saleController.getSalesByCompanyId);
router.get('/by-product', auth.verifyToken, saleController.getSalesByProduct);
router.get('/topProducts/:company', saleController.getTopProducts);
router.post('/schedule', auth.verifyToken, saleController.scheduleSale);
export default router;