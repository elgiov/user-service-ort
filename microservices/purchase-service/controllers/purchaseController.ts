import { Request, Response, NextFunction } from 'express';
import { createPurchase } from '../services/purchaseService';
import { updateInventoryAfterPurchase } from '../utils/inventory';
import HttpError from '../../../shared-middleware/src/httpError';
import { logger } from '../../../shared-middleware/src/logger';
import { CustomRequest } from '../types';
import { Types } from 'mongoose';
import { Purchase } from '../models/purchase';
import { getAsync, setexAsync } from '../../../shared-middleware/src/cache';
import env from 'dotenv';
env.config();
const CACHE_TTL_SECONDS = 60;

class PurchaseController {
    async createPurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { provider, products } = req.body;
            const newPurchase = await createPurchase(provider, products);
            await updateInventoryAfterPurchase(products, newPurchase.company);
            res.status(201).json(newPurchase);
            logger.info(`New purchase created`);
        } catch (error: any) {
            logger.error(`Error in createPurchase: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getPurchasesForProvider(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            let company = req.user.company;
            if (!company) {
                logger.error('No company provided');
                throw new HttpError(401, 'No company provided');
            }

            //const companyObjectId = new Types.ObjectId(company);
            const providerId = req.params.providerId;
            const providerObjectId = new Types.ObjectId(providerId);
            const startDate = new Date(req.query.startDate as string);
            const endDate = new Date(req.query.endDate as string);

            const cacheKey = `purchases:${company}:${providerId}:${startDate.toISOString()}:${endDate.toISOString()}`;
            const cachedData = await getAsync(cacheKey);

            if (cachedData) {
                const purchases = JSON.parse(cachedData);
                res.json(purchases);
                logger.info(`Purchases for provider ${providerId}. (Retrieved from cache)`);
            } else {
                const purchases = await Purchase.find({
                    company: company,
                    provider: providerObjectId,
                    date: { $gte: startDate, $lte: endDate }
                })
                    .populate({ path: 'provider', model: 'Provider', select: 'name' })
                    .populate({ path: 'products.product', model: 'Product', select: 'name' })
                    .exec();

                await setexAsync(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(purchases));

                res.json(purchases);
                logger.info(`Purchases for provider ${providerId}. (Retrieved from database)`);
            }
        } catch (error: any) {
            logger.error(`Error in getPurchasesForProvider: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }
}

export default new PurchaseController();
