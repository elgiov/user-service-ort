import { Request, Response, NextFunction } from 'express';
import { createSale } from '../services/saleService';
import HttpError from '../errors/httpError';
import { CustomRequest } from '../types';
import { Sale } from '../models/sale';
import { Types } from 'mongoose';
import logger from '../config/logger';
import moment from 'moment';
class SaleController {
    async createSale(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            const { products, client } = req.body;
            const newSale = await createSale(company, products, client);
            res.status(201).json(newSale);
            logger.info(`New sale created`);
        } catch (error: any) {
            logger.error(`Error in createSale: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async getSales(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            if (!company) {
                logger.error('No company provided');
                return next(new HttpError(401, 'No company provided'));
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = 5;

            const startDate = req.query.startDate
                ? moment(req.query.startDate as string, 'YYYY-MM-DD')
                      .toISOString()
                      .substring(0, 10)
                : moment.utc().startOf('month').toISOString().substring(0, 10);
            const endDate = req.query.endDate
                ? moment(req.query.endDate as string, 'YYYY-MM-DD')
                      .toISOString()
                      .substring(0, 10)
                : moment.utc().toISOString().substring(0, 10);

            const companyObjectId = new Types.ObjectId(company);

            const totalSales = await Sale.countDocuments({
                company: companyObjectId,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            const totalPages = Math.ceil(totalSales / limit);

            const sales = await Sale.find({
                company: companyObjectId,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            })
                .populate('products.product')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ date: -1 });

            res.json({
                sales,
                pageInfo: {
                    totalSales,
                    totalPages,
                    currentPage: page,
                    pageSize: limit
                }
            });
            logger.info(`All sales found`);
        } catch (error: any) {
            logger.error(`Error in getSales: ${error.message}`);
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
            logger.info(`Sales by product found`);
        } catch (error: any) {
            logger.error(`Error in getSalesByProduct: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }
}

export default new SaleController();
