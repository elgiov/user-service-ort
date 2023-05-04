import { Response, NextFunction } from 'express';
import { ICompany } from '../models/company';
import { sendInvitationEmail } from '../services/emailService';
import { Invite } from '../models/invite';
import { CustomRequest } from '../types';
import HttpError from '../errors/httpError';
import crypto from 'crypto';
import { logger }from '../config/logger';

class InvitationController {
    async sendInvitation(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, role } = req.body;
            const company = req.user.company;

            const token = crypto.randomBytes(32).toString('hex');

            const invite = new Invite({
                company,
                token,
                role,
                email
            });

            await invite.save();

            const invitationLink = `https://gestion-inventario-ort.herokuapp.com/register?token=${token}`;
            await sendInvitationEmail({ to: email, company, invitationLink });

            res.status(200).json({ message: 'Invitation sent successfully' });
            logger.info(`Invitation sent to ${email}`);
        } catch (error: any) {
            logger.error(`Error in sendInvitation: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getInvitationData(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.params.token;
            const invite = await Invite.findOne({ token }).populate('company email role');
            if (!invite) {
                logger.error(`Invitation with token ${token} not found`);
                return next(new HttpError(404, `Invitation with token ${token} not found`));
            }
            res.json({ companyName: invite.company.name, email: invite.email, role: invite.role });
            logger.info(`Invitation with token ${token} found`);
        } catch (error: any) {
            logger.error(`Error in getInvitationData: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }
}

export default new InvitationController();
