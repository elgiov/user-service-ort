import { IPurchase } from '../models/purchase';
import { IProduct } from '../models/product';
import { Product } from '../models/product';
import { Purchase } from '../models/purchase';

export const createPurchase = async (date: Date, provider: string, products: { productId: string; quantity: number }[]): Promise<IPurchase> => {
    try {
        const purchaseProducts: { product: IProduct['_id']; quantity: number }[] = [];
        let total = 0;

        for (const { productId, quantity } of products) {
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error(`Product with id "${productId}" not found`);
            }

            purchaseProducts.push({ product: product._id, quantity });
            total += product.price * quantity;
        }

        const purchase = new Purchase({ date, provider, products: purchaseProducts, total });
        await purchase.save();

        return purchase;
    } catch (error: any) {
        throw new Error(`Could not create purchase: ${error.message}`);
    }
};
