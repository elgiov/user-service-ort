import { Request, Response } from 'express';
import { createPurchase } from '../services/purchaseService';

class PurchaseController {
    async createPurchase(req: Request, res: Response): Promise<void> {
        try {
            const { date, provider, products } = req.body;
            const newPurchase = await createPurchase(date, provider, products);
            res.status(201).json(newPurchase);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }
}

export default new PurchaseController();
