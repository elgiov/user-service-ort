import { Request, Response } from 'express';
import env from 'dotenv';
import * as productService from '../services/productService';

env.config();

class ProductController {
    async addProduct(req: Request, res: Response): Promise<void> {
        try {
            const nameProduct = req.body.name;
            const product = await productService.getProductByName(nameProduct);

            if (product) {
                res.status(422).json({ message: 'Product name: ' + nameProduct + ' already exists' });
                return;
            }

            const file = req.file;
            if (!file) {
                res.status(400).json({ message: 'No image provided' });
                return;
            }

            const { buffer, originalname } = file;
            const image = await productService.uploadImage(buffer, originalname);
            await productService.createProduct({ ...req.body, image });

            res.status(201).json({ message: 'Product added correctly' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const productName = req.params.name;
            const update = req.body;
            const updatedProduct = await productService.updateProduct(productName, update);
            if (!updatedProduct) {
                res.status(404).json({ message: `Product with name "${productName}" not found` });
                return;
            }
            res.status(200).json({ message: 'Product edited correctly', product: updatedProduct });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    async getProduct(req: Request, res: Response): Promise<void> {
        try {
            const productName = req.params.name;
            const product = await productService.getProductByName(productName);

            if (!product) {
                res.status(404).json({ message: `Product with name "${productName}" not found` });
                return;
            }

            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const productName = req.params.name;
            const deletedProduct = await productService.deleteProduct(productName);
            if (!deletedProduct) {
                res.status(404).json({ message: `Product with name "${productName}" not found` });
                return;
            }
            res.status(200).json({ message: 'Product deleted correctly' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }
}

export default new ProductController();
