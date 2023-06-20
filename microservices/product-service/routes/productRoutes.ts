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
router.post('/subscribe-stock/:productId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.subscribeToProductStock);
router.delete('/unsubscribe/:productId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.unsubscribeFromProduct);
router.delete('/unsubscribe-stock/:productId', auth.verifyToken, auth.authRolePermissions(['ADMIN']), productController.unsubscribeFromProductStock);
router.get('/is-subscribed/:productId', auth.verifyToken, productController.isSubscribedToProduct);
router.get('/is-subscribed/stock/:productId', auth.verifyToken, productController.isSubscribedToProductStock);
router.get('/subscribed-admins/:productId', productController.getSubscribedAdminsToProduct);
router.get('/subscribed-admins-stock/:productId', productController.getSubscribedAdminsToProductStock);
export default router;
