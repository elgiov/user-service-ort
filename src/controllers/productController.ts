import { Request, Response, NextFunction } from 'express';
import env from 'dotenv';
import * as productService from '../services/productService';
import HttpError from '../errors/httpError';

env.config();

class ProductController {
    async addProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const nameProduct = req.body.name;
            const product = await productService.getProductByName(nameProduct);

            if (product) {
                return next(new HttpError(422, `Product name: ${nameProduct} already exists`));
            }

            const file = req.file;
            if (!file) {
                return next(new HttpError(400, 'No image provided'));
            }

            const { buffer, originalname } = file;
            const image = await productService.uploadImage(buffer, originalname);
            await productService.createProduct({ ...req.body, image });

            res.status(201).json({ message: 'Product added correctly' });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const productName = req.params.name;
            const update = req.body;
            const updatedProduct = await productService.updateProduct(productName, update);
            if (!updatedProduct) {
                return next(new HttpError(404, `Product with name "${productName}" not found`));
            }
            res.status(200).json({ message: 'Product edited correctly', product: updatedProduct });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const productName = req.params.name;
            const product = await productService.getProductByName(productName);

            if (!product) {
                return next(new HttpError(404, `Product with name "${productName}" not found`));
            }

            res.status(200).json(product);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const productName = req.params.name;
            const deletedProduct = await productService.deleteProduct(productName);
            if (!deletedProduct) {
                return next(new HttpError(404, `Product with name "${productName}" not found`));
            }
            res.status(200).json({ message: 'Product deleted correctly' });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new ProductController();
