import { ObjectId, Types } from 'mongoose';
import { Product } from '../models/product';
import HttpError from '../../../shared-middleware/src/httpError';
import { sendProductStockEmail } from '../../user-service/services/emailService';

const updateProductInventory = async (productId: string, quantity: number, isSale: boolean, company: string): Promise<void> => {
    const product = await Product.findOne({ _id: productId, company });
    if (!product) {
        throw new HttpError(404, `Product with id "${productId}" not found`);
    }

    if (isSale && product.quantity < quantity) {
        throw new HttpError(400, `Insufficient stock for product with id "${productId}"`);
    }

    product.quantity += isSale ? -quantity : quantity;
    await product.save();

    // Check if product stock is depleted and send an email notification
    if (product.quantity === 0) {
        await sendProductStockEmail(product._id.toHexString());
    }
};

export const updateInventoryAfterPurchase = async (products: { productId: string; quantity: number }[], company: string): Promise<void> => {
    await Promise.all(products.map(({ productId, quantity }) => updateProductInventory(productId, quantity, false, company)));
};