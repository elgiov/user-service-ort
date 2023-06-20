"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const emailService_1 = require("../services/emailService");
const invite_1 = require("../models/invite");
const httpError_1 = __importDefault(require("../../../shared-middleware/src/httpError"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../../../shared-middleware/src/logger");
class InvitationController {
    sendInvitation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, role } = req.body;
                const company = req.user.company;
                const token = crypto_1.default.randomBytes(32).toString('hex');
                const invite = new invite_1.Invite({
                    company,
                    token,
                    role,
                    email
                });
                yield invite.save();
                //const invitationLink = `https://gestion-inventario-ort.herokuapp.com/register?token=${token}`; ONLY FOR PRODUCTION
                const invitationLink = `https://gestioninventario-frontend-cd431b1fa4da.herokuapp.com/register?token=${token}`;
                yield (0, emailService_1.sendInvitationEmail)({ to: email, company, invitationLink });
                res.status(200).json({ message: 'Invitation sent successfully' });
                logger_1.logger.info(`Invitation sent to ${email}`);
            }
            catch (error) {
                logger_1.logger.error(`Error in sendInvitation: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    getInvitationData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.params.token;
                const invite = yield invite_1.Invite.findOne({ token }).populate('company email role');
                if (!invite) {
                    logger_1.logger.error(`Invitation with token ${token} not found`);
                    return next(new httpError_1.default(404, `Invitation with token ${token} not found`));
                }
                res.json({ companyName: invite.company.name, email: invite.email, role: invite.role });
                logger_1.logger.info(`Invitation with token ${token} found`);
            }
            catch (error) {
                logger_1.logger.error(`Error in getInvitationData: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
}
exports.default = new InvitationController();
