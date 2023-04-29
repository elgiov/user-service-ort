import { Request, Response, NextFunction } from 'express';
import { createPurchase } from '../services/purchaseService';
import { updateInventoryAfterPurchase } from '../utils/inventory';
import HttpError from '../errors/httpError';
import { CustomRequest } from '../types';
import { Types } from 'mongoose';
import { Purchase } from '../models/purchase';

class PurchaseController {
    async createPurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { provider, products } = req.body;
            const newPurchase = await createPurchase(provider, products);
            await updateInventoryAfterPurchase(products, newPurchase.company);
            res.status(201).json(newPurchase);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getPurchasesForProvider(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            let company = req.user.company;
            if (!company) {
                throw new HttpError(401, 'Invalid API key');
            }

            const companyObjectId = new Types.ObjectId(company);
            const providerId = req.params.providerId;
            const providerObjectId = new Types.ObjectId(providerId);
            const startDate = new Date(req.query.startDate as string);
            const endDate = new Date(req.query.endDate as string);

            const purchases = await Purchase.find({
                company: companyObjectId,
                provider: providerObjectId,
                date: { $gte: startDate, $lte: endDate }
            })
                .populate({ path: 'provider', model: 'Provider', select: 'name' })
                .populate({ path: 'products.product', model: 'Product', select: 'name' })
                .exec();

            res.json(purchases);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new PurchaseController();
