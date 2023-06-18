import { Request, Response, NextFunction } from 'express';
import HttpError from '../../../shared-middleware/src/httpError';
import { CustomRequest } from '../../../shared-middleware/src/types';
import * as saleService from '../services/saleService';
import { logger } from '../../../shared-middleware/src/logger';
import { getAsync, setexAsync } from '../../../shared-middleware/src/cache';
import moment from 'moment';
import env from 'dotenv';
env.config();

const CACHE_TTL_SECONDS = 60;

class SaleController {
    async createSale(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            const adminId = req.user.idUser;
            const { products, client } = req.body;
            const newSale = await saleService.createSale(company, products, client, adminId);
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
                : moment.utc().add(1, 'days').toISOString().substring(0, 10);

            const sales = await saleService.getSales(company, page, limit, startDate, endDate);

            res.json(sales);
            logger.info(`All sales found`);
        } catch (error: any) {
            logger.error(`Error in getSales: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getSalesByProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const startDate = new Date(req.query.startDate as string);
            const endDate = new Date(req.query.endDate as string);
            const company = req.user.company;

            const cacheKey = `salesByProduct:${company}:${startDate.toISOString()}:${endDate.toISOString()}`;
            const cachedData = await getAsync(cacheKey);

            if (cachedData && process.env.NODE_ENV === 'dssevelopment') {
                const salesByProduct = JSON.parse(cachedData);
                res.json(salesByProduct);
                logger.info(`Sales by product found. (Retrieved from cache)`);
            } else {
                const salesByProduct = await saleService.getSalesByProduct(company, startDate, endDate);
                await setexAsync(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(salesByProduct));
                res.json(salesByProduct);
                logger.info(`Sales by product found. (Retrieved from database)`);
            }
        } catch (error: any) {
            logger.error(`Error in getSalesByProduct: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async scheduleSale(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            const adminId = req.user.id;
            const { products, client, scheduledDate } = req.body;
            const scheduledSale = await saleService.scheduleSale(company, products, client, new Date(scheduledDate), adminId);
            res.status(201).json(scheduledSale);
            logger.info(`Sale scheduled`);
        } catch (error: any) {
            logger.error(`Error in scheduleSale: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async getTopProducts(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.params.company;
            const topProducts = await saleService.getTopProducts(company);
            res.json(topProducts);
            logger.info(`Top products found`);
        } catch (error: any) {
            logger.error(`Error in getTopProducts: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }
}

export default new SaleController();
