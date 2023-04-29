// controllers/saleController.ts
import { Request, Response, NextFunction } from 'express';
import { createSale } from '../services/saleService';
import HttpError from '../errors/httpError';
import { CustomRequest } from '../types';
import { Sale } from '../models/sale';
import { Types } from 'mongoose';

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

    async getSales(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            if (!company) {
                return next(new HttpError(401, 'Invalid API key'));
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

            const companyObjectId = new Types.ObjectId(company);
            const sales = await Sale.find({
                company: companyObjectId,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            })
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ date: -1 });

            res.json(sales);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getSalesByProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const startDate = new Date(req.query.startDate as string);
            const endDate = new Date(req.query.endDate as string);

            const salesByProduct = await Sale.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                { $unwind: '$products' },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'products.product',
                        foreignField: '_id',
                        as: 'productData'
                    }
                },
                {
                    $unwind: '$productData'
                },
                {
                    $group: {
                        _id: {
                            product: '$productData.name',
                            company: '$company'
                        },
                        totalSold: { $sum: '$products.quantity' },
                        totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.unitPrice'] } }
                    }
                },
                {
                    $lookup: {
                        from: 'companies',
                        localField: '_id.company',
                        foreignField: '_id',
                        as: 'companyData'
                    }
                },
                {
                    $unwind: '$companyData'
                },
                {
                    $project: {
                        _id: 0,
                        product: '$_id.product',
                        company: '$companyData.name',
                        totalSold: 1,
                        totalRevenue: 1
                    }
                }
            ]);

            res.json(salesByProduct);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new SaleController();
