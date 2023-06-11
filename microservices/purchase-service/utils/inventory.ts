import { Types } from 'mongoose';
import { Product } from '../models/product';
import HttpError from '../../../shared-middleware/src/httpError';

const updateProductInventory = async (productId: string, quantity: number, isSale: boolean, company: Types.ObjectId): Promise<void> => {
    const product = await Product.findOne({ _id: productId, company });
    if (!product) {
        throw new HttpError(404, `Product with id "${productId}" not found`);
    }

    if (isSale && product.quantity < quantity) {
        throw new HttpError(400, `Insufficient stock for product with id "${productId}"`);
    }

    product.quantity += isSale ? -quantity : quantity;
    await product.save();
};

export const updateInventoryAfterPurchase = async (products: { productId: string; quantity: number }[], company: Types.ObjectId): Promise<void> => {
    await Promise.all(products.map(({ productId, quantity }) => updateProductInventory(productId, quantity, false, company)));
};