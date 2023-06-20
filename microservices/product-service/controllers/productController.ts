import { Request, Response, NextFunction } from 'express';
import HttpError from '../../../shared-middleware/src/httpError';
import { CustomRequest } from '../../../shared-middleware/src/types';
import * as productService from '../services/productService';
import { getCompanyById } from '../services/companyService';
import { logger } from '../../../shared-middleware/src/logger';
import { getAsync, setexAsync } from '../../../shared-middleware/src/cache';
import { Types } from 'mongoose';
import axios from 'axios';
import env from 'dotenv';
env.config();

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

    async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(id);

            if (!product) {
                logger.error(`Error in getProduct: Product with id "${id}"`);
                return next(new HttpError(404, `Product with id "${id}"`));
            }

            res.status(200).json(product);
            logger.info(`Product with id "${id}"`);
        } catch (error: any) {
            logger.error(`Error in getProduct: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getProductsByCompany(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            const products = await productService.getProductsByCompany(company);

            if (!products || products.length === 0) {
                logger.error(`Error in getProductsByCompany: No products found for company "${company}"`);
                return next(new HttpError(404, `No products found for company "${company}"`));
            }
            
            res.status(200).json(products);
            logger.info(`Products found for company "${company}". The products are: ${products}`);
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
                    const response = await axios.get(`https://sales-service-gestion-inv-bdbf7ceab368.herokuapp.com/api/sales/topProducts/${company}`);
                    const topProducts = response.data;
                    res.json(topProducts);
                    logger.info(`Top products found for company "${company}" (from Product microservice)`);

                    await setexAsync(cacheKey, 60, JSON.stringify(topProducts));
                } catch (error: any) {
                    logger.error(`Error in getTopProducts: Could not fetch top products from Product microservice: ${error.message}`);
                    next(new HttpError(500, error.message));
                }
            }
        } catch (error: any) {
            logger.error(`Error in getTopProducts: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    };

    async subscribeToProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user.idUser;
            const productId = req.params.productId;
            await productService.subscribeToProduct(adminId, productId);
            res.json({ message: 'Subscription successful.' });
            logger.info(`Admin subscribed to product`);
        } catch (error: any) {
            logger.error(`Error in subscribeToProduct: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async subscribeToProductStock(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user.idUser;
            const productId = req.params.productId;
            await productService.subscribeToProductStock(adminId, productId);
            res.json({ message: 'Subscription successful.' });
            logger.info(`Admin subscribed to product stock`);
        } catch (error: any) {
            logger.error(`Error in subscribeToProductStock: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async unsubscribeFromProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user.idUser;
            const productId = req.params.productId;
            await productService.unsubscribeFromProduct(adminId, productId);
            res.json({ message: 'Unsubscription successful.' });
            logger.info(`Admin unsubscribed from product`);
        } catch (error: any) {
            logger.error(`Error in unsubscribeFromProduct: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async unsubscribeFromProductStock(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user.idUser;
            const productId = req.params.productId;
            await productService.unsubscribeFromProductStock(adminId, productId);
            res.json({ message: 'Unsubscription successful.' });
            logger.info(`Admin unsubscribed from product stock`);
        } catch (error: any) {
            logger.error(`Error in unsubscribeFromProductStock: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async isSubscribedToProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user.idUser;
            const productId = req.params.productId;
            const isSubscribed = await productService.isSubscribedToProduct(adminId, productId);
            res.json({ isSubscribed });
            logger.info(`Admin is subscribed to product`);
        } catch (error: any) {
            logger.error(`Error in isSubscribedToProduct: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async isSubscribedToProductStock(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user.idUser;
            const productId = req.params.productId;
            const isSubscribed = await productService.isSubscribedToProductStock(adminId, productId);
            res.json({ isSubscribed });
            logger.info(`Admin is subscribed to product stock`);
        } catch (error: any) {
            logger.error(`Error in isSubscribedToProductStock: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async decreaseProductStock (req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const productId = req.params.id;
            const {quantity} = req.body;
            await productService.decreaseProductQuantity(productId,quantity);
            res.json({ message: 'Decrease successful.' });
        } catch (error: any) {
            logger.error(`Error in decreaseProductStock: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async getSubscribedAdminsToProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const productId = req.params.productId;
            const subscribedAdmins = await productService.getSubscribedAdminsToProduct(productId);
            res.json(subscribedAdmins);
            logger.info(`Admins subscribed to product`);
        } catch (error: any) {
            logger.error(`Error in checkSubscribedAdminsToProduct: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }

    async getSubscribedAdminsToProductStock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const productId = req.params.productId;
            const subscribedAdmins = await productService.getSubscribedAdminsToProductStock(productId);
            res.json(subscribedAdmins);
            logger.info(`Admins subscribed to product stock`);
        } catch (error: any) {
            logger.error(`Error in checkSubscribedAdminsToProductStock: ${error.message}`);
            next(new HttpError(400, error.message));
        }
    }
}

export default new ProductController();
