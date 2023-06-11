import axios from 'axios';
import { Types } from 'mongoose';
import { ISale, Sale } from '../models/sale';
import { IProductSubscription, ProductSubscription } from '../models/productSubscription';
import { sendProductSoldEmail } from '../../user-service/services/emailService';

const findProductById = async (productId: string): Promise<{ id: string; price: number }> => {
    try {
        const response = await axios.get(`http://product-service/api/products/${productId}`);
        return { id: response.data.id, price: response.data.price };
    } catch (error) {
        throw new Error(`Product with id "${productId}" not found`);
    }
};

const decreaseProductQuantity = async (productId: string, quantity: number): Promise<void> => {
    try {
        await axios.post(`http://product-service/api/products/${productId}/decrease-quantity`, { quantity });
    } catch (error) {
        throw new Error(`Insufficient stock for product with id "${productId}"`);
    }
};

const calculateTotalAmount = (products: { quantity: number; unitPrice: number }[]): number => {
    return products.reduce((total, { quantity, unitPrice }) => total + unitPrice * quantity, 0);
};

export const createSale = async (company: Types.ObjectId, products: { productId: string; quantity: number }[], client: string): Promise<ISale> => {
    try {
        const productPromises = products.map(({ productId }) => findProductById(productId));
        const foundProducts = await Promise.all(productPromises);

        const saleProducts = foundProducts.map((product, index) => {
            const { quantity } = products[index];
            const unitPrice = product.price;
            return { product: product.id, quantity, unitPrice };
        });

        // Check stock for each product
        for (const product of saleProducts) {
            const { product: productId, quantity } = product;
            await decreaseProductQuantity(productId, quantity);
        }

        const total = calculateTotalAmount(saleProducts) as number;

        const today = new Date();
        const sale = new Sale({ company, total, products: saleProducts, date: today, client });
        await sale.save();

        for (const saleProduct of saleProducts) {
            const { product: productId } = saleProduct;
            const subscriptions = await ProductSubscription.find({ productId: productId });
            for (const subscription of subscriptions) {
                await sendProductSoldEmail({ to: subscription.adminId, productId });
            }
        }

        return sale;
    } catch (error: any) {
        throw new Error(`Could not create sale: ${error.message}`);
    }
};

export const getSales = async (company: string, page: number, limit: number, startDate: string, endDate: string) => {
    try {
        const companyObjectId = new Types.ObjectId(company);

        const totalSales = await Sale.countDocuments({
            company: companyObjectId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        });

        const totalPages = Math.ceil(totalSales / limit);

        const sales = await Sale.find({
            company: companyObjectId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .populate('products.product')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ date: -1 });

        return {
            sales,
            pageInfo: {
                totalSales,
                totalPages,
                currentPage: page,
                pageSize: limit
            }
        };
    } catch (error: any) {
        throw new Error(`Could not fetch sales: ${error.message}`);
    }
};

export const getSalesByProduct = async (company: string, startDate: Date, endDate: Date): Promise<any> => {
    try {
        const companyObjectId = new Types.ObjectId(company);

        const salesByProduct = await Sale.aggregate([
            {
                $match: {
                    company: companyObjectId,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.product',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            {
                $unwind: '$productData'
            },
            {
                $group: {
                    _id: {
                        product: '$productData.name',
                        company: '$company'
                    },
                    totalSold: { $sum: '$products.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.unitPrice'] } }
                }
            },
            {
                $lookup: {
                    from: 'companies',
                    localField: '_id.company',
                    foreignField: '_id',
                    as: 'companyData'
                }
            },
            {
                $unwind: '$companyData'
            },
            {
                $project: {
                    _id: 0,
                    product: '$_id.product',
                    company: '$companyData.name',
                    totalSold: 1,
                    totalRevenue: 1
                }
            }
        ]);

        return salesByProduct;
    } catch (error: any) {
        throw new Error(`Could not fetch sales by product: ${error.message}`);
    }
};

export const subscribeToProduct = async (adminId: string, productId: string): Promise<IProductSubscription> => {
    const subscription = new ProductSubscription({ adminId, productId });
    await subscription.save();
    return subscription;
};

export const unsubscribeFromProduct = async (adminId: string, productId: string): Promise<void> => {
    await ProductSubscription.deleteOne({ adminId, productId });
};
