import { IPurchase } from '../models/purchase';
import { IProduct } from '../models/product';
import { Product } from '../models/product';
import { Purchase } from '../models/purchase';
import { Types } from 'mongoose';
import { findProviderById } from './providerService'

const findProductById = async (productId: string, company: Types.ObjectId): Promise<IProduct> => {
    const product = await Product.findOne({ _id: productId, company });
    if (!product) {
        throw new Error(`Could not find product with id "${productId}" for company "${company}"`);
    }
    return product;
};
const calculateTotal = (products: { quantity: number; unitPrice: number }[]): number => {
    return products.reduce((total, { quantity, unitPrice }) => total + unitPrice * quantity, 0);
};

export const createPurchase = async (provider: string, products: { productId: string; quantity: number }[]): Promise<IPurchase> => {
    try {
        const { company } = await findProviderById(provider);
        const productPromises = products.map(({ productId }) => findProductById(productId, company));
        const foundProducts = await Promise.all(productPromises);

        const purchaseProducts = foundProducts.map((product, index) => {
            const { quantity } = products[index];
            return { product: product._id, quantity };
        });

        const total = calculateTotal(
            purchaseProducts.map((purchaseProduct, index) => ({
                quantity: purchaseProduct.quantity,
                unitPrice: foundProducts[index].price
            }))
        );

        const purchase = new Purchase({ provider, products: purchaseProducts, total, company });
        await purchase.save();

        return purchase;
    } catch (error: any) {
        throw new Error(`Could not create purchase: ${error.message}`);
    }
};
