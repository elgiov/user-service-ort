import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

router.post('/register/admin', userController.registerAdmin);
router.post('/register/employee', userController.registerEmployee);
router.post('/login', userController.login);


export default router;
