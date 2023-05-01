import { Request, Response, NextFunction } from 'express';
import env from 'dotenv';
import * as providerService from '../services/providerService';
import HttpError from '../errors/httpError';
import { CustomRequest } from '../types';
import logger from '../config/logger';
env.config();
class ProviderController {
    async addProvider(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            if (!company) {
                logger.error('No company provided');
                return next(new HttpError(400, 'No company provided'));
            }

            await providerService.createProvider({ ...req.body }, company);
            res.status(201).json({ message: 'Provider added correctly' });
            logger.info(`New provider created`);
        } catch (error: any) {
            logger.error(`Error in addProvider: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async updateProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.params.providerId;
            const updateProvider = req.body;
            const updatedProvider = await providerService.updateProvider(providerId, updateProvider);
            if (!updatedProvider) {
                logger.error(`Error in updateProvider: Provider with id "${providerId}" not found`);
                return next(new HttpError(404, `Provider with id "${providerId}" not found`));
            }
            res.status(200).json({ message: 'Provider edited correctly', provider: updatedProvider });
            logger.info(`Provider with id "${providerId}" updated`);
        } catch (error: any) {
            logger.error(`Error in updateProvider: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async deleteProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.params.providerId;
            const deletedProvider = await providerService.deleteProvider(providerId);
            if (!deletedProvider) {
                logger.error(`Error in deleteProvider: Provider with id "${providerId}" not found`);
                return next(new HttpError(404, `Provider with id "${providerId}" not found`));
            }
            res.status(200).json({ message: 'Provider deleted correctly' });
            logger.info(`Provider with id "${providerId}" deleted`);
        } catch (error: any) {
            logger.error(`Error in deleteProvider: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getProductsByProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providerId = req.params.providerId;
            const provider = await providerService.findProviderById(providerId);
            if (!provider) {
                logger.error(`Error in getProductsByProvider: Provider with id "${providerId}" not found`);
                return next(new HttpError(404, `Provider with id "${providerId}" not found`));
            }
            const products = await providerService.getProviderProducts(provider);
            res.status(200).json(products);
            logger.info(`Products from provider with id "${providerId}" found`);
        } catch (error: any) {
            logger.error(`Error in getProductsByProvider: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const providers = await providerService.getProviders();
            res.status(200).json(providers);
            logger.info(`All providers found`);
        } catch (error: any) {
            logger.error(`Error in getProviders: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }
}

export default new ProviderController();
