//@ts-nocheck
import { Router } from 'express';
import productController from '../controllers/productController';
import auth from '../shared/authorization_middleware/auth';

const router = Router();

router.post('/', invitationController.sendInvitation);
router.get('/:token', InvitationController.getInvitationData);

export default router;
