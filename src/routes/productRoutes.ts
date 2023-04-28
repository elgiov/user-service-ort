import { Router } from 'express';
import productController from '../controllers/productController';
import { multerUpload } from '../config/multerConfig';
import auth from '../shared/authorization_middleware/auth';


const router = Router();

router.post('/add',auth.verifyToken, auth.authRolePermissions(['ADMIN']), multerUpload.single('image'), productController.addProduct);
router.put('/:name', productController.updateProduct);
router.get('/:name', productController.getProduct);
router.get('/', productController.getProductsByCompany);
router.delete('/:name', productController.deleteProduct);

export default router;
