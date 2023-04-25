import { Router } from 'express';
import purchaseController from '../controllers/purchaseController';

const router = Router();

router.post('', purchaseController.createPurchase);

export default router;
