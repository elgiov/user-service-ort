import { IPurchase } from '../models/purchase';
import { IProduct } from '../models/product';
import { Product } from '../models/product';
import { Purchase } from '../models/purchase';

const findProductById = async (productId: string): Promise<IProduct> => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error(`Product with id "${productId}" not found`);
    }
    return product;
};

const calculateTotal = (products: { quantity: number; unitPrice: number }[]): number => {
    return products.reduce((total, { quantity, unitPrice }) => total + unitPrice * quantity, 0);
};

export const createPurchase = async (provider: string, products: { productId: string; quantity: number }[]): Promise<IPurchase> => {
    try {
        const productPromises = products.map(({ productId }) => findProductById(productId));
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

        const purchase = new Purchase({ provider, products: purchaseProducts, total });
        await purchase.save();

        return purchase;
    } catch (error: any) {
        throw new Error(`Could not create purchase: ${error.message}`);
    }
};
