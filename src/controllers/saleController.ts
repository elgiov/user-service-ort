// controllers/saleController.ts
import { Request, Response, NextFunction } from 'express';
import { createSale } from '../services/saleService';
import HttpError from '../errors/httpError';

class SaleController {
    async createSale(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { companyRef, products } = req.body;
            const newSale = await createSale(companyRef, products);
            res.status(201).json(newSale);
        } catch (error: any) {
            next(new HttpError(400, error.message));
        }
    }
}

export default new SaleController();
