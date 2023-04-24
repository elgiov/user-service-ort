import { Request, Response } from 'express';
import env from 'dotenv';
import { createProduct, getProductByName } from '../services/productService';
env.config();

class ProductController {
    async addProduct(req: Request, res: Response): Promise<void> {
        try {
            const nameProduct = req.body.name
            const product = await getProductByName(nameProduct)
            if (product) {
                res.status(422).json({ message: 'Product name: '+ nameProduct + ' already exist' });
            }
            await createProduct({ ...req.body });
            res.status(201).json({ message: 'Product added correctly' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }



}

export default new ProductController();