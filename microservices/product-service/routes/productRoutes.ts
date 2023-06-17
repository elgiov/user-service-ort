//@ts-nocheck
import { Router } from 'express';
import productController from '../controllers/productController';
import { multerUpload } from '../config/multerConfig';
import auth from '../../../shared-middleware/src/auth';

const router = Router();

router.post('/add', auth.verifyToken, auth.authRolePermissions(['ADMIN']), multerUpload.single('image'), productController.addProduct);
router.put('/:name', auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.updateProduct);
router.get('/top', auth.verifyToken, productController.getTopProducts);
router.get('/:name', auth.verifyToken, productController.getProduct);
router.get('/byId/:id', productController.getProductById);
router.post('/decrease-quantity/:id', productController.decreaseProductStock);
router.get('/', auth.verifyToken, productController.getProductsByCompany);
router.delete('/:name', auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.deleteProduct);
router.post('/subscribe/:productId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.subscribeToProduct);
router.delete('/unsubscribe/:productId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.unsubscribeFromProduct);
router.get('/is-subscribed/:productId', productController.isSubscribedToProduct);
router.get('/subscribed-admins/:productId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.getSubscribedAdminsToProduct);
export default router;
