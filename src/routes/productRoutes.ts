//@ts-nocheck
import { Router } from 'express';
import productController from '../controllers/productController';
import { multerUpload } from '../config/multerConfig';
import auth from '../shared/authorization_middleware/auth';

const router = Router();


router.post('/add',auth.verifyToken, auth.authRolePermissions(['ADMIN']), multerUpload.single('image'), productController.addProduct);
router.put('/:name',auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.updateProduct);
router.get('/:name',auth.verifyToken,productController.getProduct);
router.get('/', auth.verifyToken,productController.getProductsByCompany);
router.delete('/:name', auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.deleteProduct);

export default router;
