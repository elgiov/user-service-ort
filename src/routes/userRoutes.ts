//@ts-nocheck
import { Router } from 'express';
import userController from '../controllers/userController';
import auth from '../shared/authorization_middleware/auth';


const router = Router();

router.post('/register/admin', userController.registerAdmin);
router.post('/register/employee', userController.registerEmployee);
router.post('/login', userController.login);
router.post('/register', userController.registerUser);
router.get('/info', auth.verifyToken, userController.infoUser);


export default router;
