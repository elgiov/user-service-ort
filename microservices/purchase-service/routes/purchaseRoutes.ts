import { Router } from 'express';
import purchaseController from '../controllers/purchaseController';
import auth from '../../../shared-middleware/src/auth';

const router = Router();

router.post('', purchaseController.createPurchase);
//@ts-ignore
router.get('/:providerId', auth.verifyToken, purchaseController.getPurchasesForProvider);
//@ts-ignore
router.get('/by-company/:companyId', purchaseController.getPurchasesForCompany);

export default router;
