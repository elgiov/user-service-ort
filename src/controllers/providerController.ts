import { Request, Response, NextFunction } from 'express';
import env from 'dotenv';
import * as providerService from '../services/providerService';
import HttpError from '../errors/httpError';
env.config();

class ProviderController {

    async addProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await providerService.createProvider({ ...req.body });
            res.status(201).json({ message: 'Provider added correctly' });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async updateProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.params.providerId;
            const updateProvider = req.body;
            const updatedProvider = await providerService.updateProvider(providerId, updateProvider);
            if (!updateProvider) {
                return next(new HttpError(404, `Provider with id "${providerId}" not found`));
            }
            res.status(200).json({ message: 'Provider edited correctly', provider: updatedProvider });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async deleteProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.params.providerId;
            const deletedProvider = await providerService.deleteProvider(providerId);
            if (!deletedProvider) {
                return next(new HttpError(404, `Provider with id "${providerId}" not found`));
            }
            res.status(200).json({ message: 'Provider deleted correctly' });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new ProviderController();
