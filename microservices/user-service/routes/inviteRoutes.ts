//@ts-nocheck
import { Router } from 'express';
import inviteController from '../controllers/inviteController';
import auth from '../../../shared-middleware/src/auth';

const router = Router();

router.post('/', auth.verifyToken, inviteController.sendInvitation);
router.get('/:token', auth.verifyToken, inviteController.getInvitationData);

export default router;
