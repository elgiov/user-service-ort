//@ts-nocheck
import { Router } from 'express';
import inviteController from '../controllers/inviteController';
import auth from '../shared/authorization_middleware/auth';

const router = Router();

router.post('/', auth.verifyToken, inviteController.sendInvitation);
router.get('/:token', auth.verifyToken, inviteController.getInvitationData);

export default router;
