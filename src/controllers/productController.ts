import { Request, Response, NextFunction } from 'express';
import env from 'dotenv';
import * as productService from '../services/productService';
import { getCompanyById } from '../services/companyService';
import HttpError from '../errors/httpError';
import { CustomRequest } from '../types';
env.config();

class ProductController {
    async addProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            let formatProduct = req.body.json
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
            const createdProduct = await productService.createProduct({ ...bodyProduct,company, image });

            res.status(201).json({ message: 'Product added correctly', product: createdProduct });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async updateProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const name  = req.params.name;
            const company = req.user.company;
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

    async getProductsByCompany(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const company = req.user.company;
            const products = await productService.getProductsByCompany(company);

            if (!products || products.length === 0) {
                return next(new HttpError(404, `No products found for company "${company}"`));
            }

            res.status(200).json(products);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async deleteProduct(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const name  = req.params.name;
            const company = req.user.company;
            const deletedProduct = await productService.deleteProduct(name, company);
            if (!deletedProduct) {
                return next(new HttpError(404, `Product with name "${name}" for company "${company}" not found`));
            }
            res.status(200).json({ message: 'Product deleted correctly' });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new ProductController();
