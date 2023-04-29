import { Request, Response, NextFunction } from 'express';
import env from 'dotenv';
import * as productService from '../services/productService';
import { getCompanyById } from '../services/companyService';
import HttpError from '../errors/httpError';
import { CustomRequest } from '../types';
import { Company } from '../models/company';
import { Sale } from '../models/sale';
import { Product } from '../models/product';
import { Types } from 'mongoose';
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
                return next(new HttpError(422, `The product ${product.name} already exists for the ${companyObject?.name} company.`));
            }

            const file = req.file;
            if (!file) {
                return next(new HttpError(400, 'No image provided'));
            }

            const { buffer, originalname } = file;
            const image = await productService.uploadImage(buffer, originalname);
            const createdProduct = await productService.createProduct({ ...bodyProduct, company, image });

            res.status(201).json({ message: 'Product added correctly', product: createdProduct });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, company } = req.body;
            const update = req.body;
            const updatedProduct = await productService.updateProduct(name, company, update);
            if (!updatedProduct) {
                return next(new HttpError(404, `Product with name "${name}" for company "${company}" not found`));
            }
            res.status(200).json({ message: 'Product edited correctly', product: updatedProduct });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name } = req.params;
            const { company } = req.body;
            const product = await productService.getProduct(name, company);

            if (!product) {
                return next(new HttpError(404, `Product with name "${name}" for company "${company}" not found`));
            }

            res.status(200).json(product);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getProductsByCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { company } = req.body;
            const products = await productService.getProductsByCompany(company);

            if (!products || products.length === 0) {
                return next(new HttpError(404, `No products found for company "${company}"`));
            }

            res.status(200).json(products);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, company } = req.body;
            const deletedProduct = await productService.deleteProduct(name, company);
            if (!deletedProduct) {
                return next(new HttpError(404, `Product with name "${name}" for company "${company}" not found`));
            }
            res.status(200).json({ message: 'Product deleted correctly' });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getTopProducts(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            let company = req.user.company;
            if (!company) {
                throw new HttpError(401, 'Invalid API key');
            }

            const companyObjectId = new Types.ObjectId(company);

            const results = await Sale.aggregate([
                { $match: { company: companyObjectId } },
                { $unwind: '$products' },
                { $group: { _id: '$products.product', totalSold: { $sum: '$products.quantity' } } },
                { $sort: { totalSold: -1 } },
                { $limit: 3 }
            ]);

            const productIds = results.map((result) => result._id);
            const products = await Product.find({ _id: { $in: productIds } }, { name: 1 });

            const topProducts = results.map((result) => {
                const product = products.find((p) => p._id.equals(result._id));
                if (!product) {
                    throw new HttpError(500, 'Product not found');
                }
                return { name: product.name, totalSold: result.totalSold };
            });
            res.json(topProducts);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new ProductController();
