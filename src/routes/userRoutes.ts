import { Router } from 'express';
import userController from '../controllers/userController';

const router = Router();

router.post('/register/admin', userController.registerAdmin);
router.post('/register/employee', userController.registerEmployee);

export default router;
