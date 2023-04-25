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

export const createSale = async (company: string, amount: number, products: { productId: string; quantity: number }[]): Promise<ISale> => {
    try {
        const productPromises = products.map(({ productId }) => findProductById(productId));
        const foundProducts = await Promise.all(productPromises);

        const saleProducts = foundProducts.map((product, index) => {
            const { quantity } = products[index];
            const unitPrice = product.price;
            return { productId: product._id, quantity, unitPrice };
        });

        const calculatedTotalAmount = calculateTotalAmount(saleProducts);

        if (calculatedTotalAmount !== amount) {
            throw new Error(`Provided total amount (${amount}) does not match calculated total amount (${calculatedTotalAmount})`);
        }

        const sale = new Sale({ company, amount, products: saleProducts });
        await sale.save();

        return sale;
    } catch (error: any) {
        throw new Error(`Could not create sale: ${error.message}`);
    }
};
