import { Request, Response } from 'express';
import { createSale } from '../services/saleService';

class SaleController {
    async createSale(req: Request, res: Response): Promise<void> {
        try {
            const { company, amount, products } = req.body;
            const newSale = await createSale(company, amount, products);
            res.status(201).json(newSale);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }
}

export default new SaleController();
