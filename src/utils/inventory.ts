// helpers/inventory.ts
import { Product } from '../models/product';

const updateProductInventory = async (productId: string, quantity: number, isSale: boolean): Promise<void> => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error(`Product with id "${productId}" not found`);
    }

    if (isSale && product.quantity < quantity) {
        throw new Error(`Insufficient stock for product with id "${productId}"`);
    }

    product.quantity += isSale ? -quantity : quantity;
    await product.save();
};

export const updateInventoryAfterSale = async (products: { productId: string; quantity: number }[]): Promise<void> => {
    await Promise.all(products.map(({ productId, quantity }) => updateProductInventory(productId, quantity, true)));
};

export const updateInventoryAfterPurchase = async (products: { productId: string; quantity: number }[]): Promise<void> => {
    await Promise.all(products.map(({ productId, quantity }) => updateProductInventory(productId, quantity, false)));
};
