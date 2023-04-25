// controllers/saleController.ts
import { Request, Response, NextFunction } from 'express';
import { createSale } from '../services/saleService';
import { updateInventoryAfterSale } from '../utils/inventory';
import HttpError from '../errors/httpError';

class SaleController {
    async createSale(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { company, amount, products } = req.body;
            try {
                await updateInventoryAfterSale(products);
            } catch (error: any) {
                return next(new HttpError(400, (error as Error).message));
            }

            const newSale = await createSale(company, amount, products);

            res.status(201).json(newSale);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new SaleController();
