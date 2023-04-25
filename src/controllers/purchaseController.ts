import { Request, Response, NextFunction } from 'express';
import { createPurchase } from '../services/purchaseService';
import { updateInventoryAfterPurchase } from '../utils/inventory';
import HttpError from '../errors/httpError';

class PurchaseController {
    async createPurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { provider, products } = req.body;
            const newPurchase = await createPurchase(provider, products);
            await updateInventoryAfterPurchase(products);
            res.status(201).json(newPurchase);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new PurchaseController();
