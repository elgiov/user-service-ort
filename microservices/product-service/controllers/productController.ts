// /product-service/controllers/productController.ts

import { Request, Response, NextFunction } from 'express';
import HttpError from '../../../shared-middleware/src/httpError';
import { CustomRequest } from '../../../shared-middleware/src/types';
import * as productService from '../services/productService';
import { getCompanyById } from '../services/companyService';
import { logger } from '../../../shared-middleware/src/logger';
import { getAsync, setexAsync } from '../../../shared-middleware/src/cache';
import { Types } from 'mongoose';
import axios from 'axios';

class ProductController {
    async addProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            let formatProduct = req.body.json;
            const bodyProduct = JSON.parse(formatProduct);
            let company = req.user.company;
            let name = bodyProduct.name;
            const product = await productService.getProduct(name, company);

            if (product) {
                const companyObject = await getCompanyById(company);
                logger.error(`Error in addProduct: The product ${product.name} already exists for the ${companyObject?.name} company.`);
                return next(new HttpError(422, `The product ${product.name} already exists for the ${companyObject?.name} company.`));
            }

            const file = req.file;
            if (!file) {
                logger.error(`Error in addProduct: No image provided`);
                return next(new HttpError(400, 'No image provided'));
            }

            const { buffer, originalname } = file;
            const image = await productService.uploadImage(buffer, originalname);
            const createdProduct = await productService.createProduct({ ...bodyProduct, company, image });

            res.status(201).json({ message: 'Product added correctly', product: createdProduct });
            logger.info(`New product created: ${createdProduct.name}`);
        } catch (error: any) {
            logger.error(`Error in addProduct: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async updateProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const name = req.params.name;
            const company = req.user.company;
            const update = req.body;
            const updatedProduct = await productService.updateProduct(name, company, update);
            if (!updatedProduct) {
                logger.error(`Error in updateProduct: Product with name "${name}" for company "${company}" not found`);
                return next(new HttpError(404, `Product with name "${name}" for company "${company}" not found`));
            }
            res.status(200).json({ message: 'Product edited correctly', product: updatedProduct });
            logger.info(`Product with name "${name}" for company "${company}" updated`);
        } catch (error: any) {
            logger.error(`Error in updateProduct: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name } = req.params;
            const { company } = req.body;
            const product = await productService.getProduct(name, company);

            if (!product) {
                logger.error(`Error in getProduct: Product with name "${name}" for company "${company}" not found`);
                return next(new HttpError(404, `Product with name "${name}" for company "${company}" not found`));
            }

            res.status(200).json(product);
            logger.info(`Product with name "${name}" for company "${company}" found`);
        } catch (error: any) {
            logger.error(`Error in getProduct: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getProductsByCompany(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            const products = await productService.getProductsByCompany(company);

           /* if (!products || products.length === 0) {
                logger.error(`Error in getProductsByCompany: No products found for company "${company}"`);
                return next(new HttpError(404, `No products found for company "${company}"`));
            }
            */
            res.status(200).json(products);
            logger.info(`Products found for company "${company}"`);
        } catch (error: any) {
            logger.error(`Error in getProductsByCompany: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async deleteProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const name = req.params.name;
            const company = req.user.company;
            const deletedProduct = await productService.deleteProduct(name, company);
            if (!deletedProduct) {
                logger.error(`Error in deleteProduct: Product with name "${name}" for company "${company}" not found`);
                return next(new HttpError(404, `Product with name "${name}" for company "${company}" not found`));
            }
            res.status(200).json({ message: 'Product deleted correctly' });
            logger.info(`Product with name "${name}" for company "${company}" deleted`);
        } catch (error: any) {
            logger.error(`Error in deleteProduct: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    getTopProducts = async (req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const company = req.user.company;
            if (!company) {
                logger.error(`Error in getTopProducts: No company provided`);
                throw new HttpError(401, 'No company provided');
            }
    
            const cacheKey = `topProducts:${company}`;
            const cachedData = await getAsync(cacheKey);
    
            if (cachedData) {
                const topProducts = JSON.parse(cachedData);
                res.json(topProducts);
                logger.info(`Top products found for company "${company}" (from cache)`);
            } else {
                try {
                    const response = await axios.get(`http://sales-service/api/sales/top-products/${company}`);
                    const topProducts = response.data;
                    res.json(topProducts);
                    logger.info(`Top products found for company "${company}" (from Sales microservice)`);
                    
                    await setexAsync(cacheKey, 60, JSON.stringify(topProducts));
                } catch (error: any) {
                    logger.error(`Error in getTopProducts: Could not fetch top products from Sales microservice: ${error.message}`);
                    next(new HttpError(500, error.message));
                }
            }
        } catch (error: any) {
            logger.error(`Error in getTopProducts: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    };
}

export default new ProductController();
