import { Request, Response, NextFunction } from 'express';
import env from 'dotenv';
import * as providerService from '../services/providerService';
import HttpError from '../errors/httpError';
import { CustomRequest } from '../types';
env.config();

class ProviderController {
    async addProvider(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            if (!company) {
                return next(new HttpError(400, 'No company provided'));
            }

            await providerService.createProvider({ ...req.body }, company);
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
            if (!updatedProvider) {
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

    async getProductsByProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.params.providerId;
            const provider = await providerService.findProviderById(providerId);
            if (!provider) {
                return next(new HttpError(404, `Provider with id "${providerId}" not found`));
            }
            const products = await providerService.getProviderProducts(provider);
            res.status(200).json(products);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providers = await providerService.getProviders();
            res.status(200).json(providers);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new ProviderController();
