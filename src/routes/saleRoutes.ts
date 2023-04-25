import { Router } from 'express';
import saleController from '../controllers/saleController';

const router = Router();

router.post('', saleController.createSale);

export default router;
