import { Router } from 'express';
import productController from '../controllers/productController';

const router = Router();

router.post('/add', productController.addProduct);
router.put('/edit', productController.updateProduct);


export default router;