import { Types } from 'mongoose';
import { IProduct } from '../models/product';
import { Product } from '../models/product';
import { ISale, Sale } from '../models/sale';

const findProductById = async (productId: string): Promise<IProduct> => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error(`Product with id "${productId}" not found`);
    }
    return product;
};

const calculateTotalAmount = (products: { quantity: number; unitPrice: number }[]): number => {
    return products.reduce((total, { quantity, unitPrice }) => total + unitPrice * quantity, 0);
};

export const createSale = async (company: Types.ObjectId, products: { productId: string; quantity: number }[]): Promise<ISale> => {
    try {
        const productPromises = products.map(({ productId }) => findProductById(productId));
        const foundProducts = await Promise.all(productPromises);

        const saleProducts = foundProducts.map((product, index) => {
            const { quantity } = products[index];
            const unitPrice = product.price;
            return { product: product._id, quantity, unitPrice };
        });

        // Check stock for each product
        for (const product of saleProducts) {
            const { product: productId, quantity } = product;
            const dbProduct = await Product.findById(productId);
            if (!dbProduct) {
                throw new Error(`Product with id "${productId}" not found`);
            }
            if (dbProduct.quantity < quantity) {
                throw new Error(`Insufficient stock for product with id "${productId}"`);
            }
        }

        const total = calculateTotalAmount(saleProducts) as number;

        for (const product of saleProducts) {
            const { product: productId, quantity } = product;
            await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });
        }

        const today = new Date();
        const sale = new Sale({ company, total, products: saleProducts, date: today });
        await sale.save();

        return sale;
    } catch (error: any) {
        throw new Error(`Could not create sale: ${error.message}`);
    }
};
