import { IPurchase } from '../models/purchase';
import { IProduct } from '../models/product';
import { Product } from '../models/product';
import { Purchase } from '../models/purchase';
import { ObjectId, Types } from 'mongoose';
import { sendProductPurchasedEmail } from '../../user-service/services/emailService';
import axios from 'axios';

const baseApi = axios.create({
    baseURL: `https://provider-service-gestion-inv-768e628673da.herokuapp.com/api/providers`,
    proxy: false
});

const findProductById = async (productId: string, company: ObjectId): Promise<IProduct> => {
    const product = await Product.findOne({ _id: productId, company: company });
    if (!product) {
        throw new Error(`Could not find product with id "${productId}" for company "${company}"`);
    }
    return product;
};
const calculateTotal = (products: { quantity: number; unitPrice: number }[]): number => {
    return products.reduce((total, { quantity, unitPrice }) => total + unitPrice * quantity, 0);
};

export const createPurchase = async (provider: string, products: { productId: string; quantity: number }[], token: string): Promise<IPurchase> => {
    try {
        const { data } = await baseApi.get(`/id/${provider}`);
        const company = data.company;
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
        const today = new Date();
        const purchase = new Purchase({ provider, products: purchaseProducts, total, company, date: today });
        await purchase.save();

        for (const product of purchaseProducts) {
            await notifyAdmins(product.product.toHexString(), token);
        }
        return purchase;
    } catch (error: any) {
        throw new Error(`Could not create purchase: ${error.message}`);
    }
};

const notifyAdmins = async (productId: string, token: string): Promise<void> => {
    await sendProductPurchasedEmail(productId, token);
    console.log(`Sending email about product ${productId}`);
};
