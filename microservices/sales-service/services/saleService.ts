import axios from 'axios';
import { Types } from 'mongoose';
import { ISale, Sale } from '../models/sale';
import { IScheduledSale, ScheduledSale } from '../models/scheduledSales';
import schedule from 'node-schedule';
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

export const createSale = async (company: Types.ObjectId, products: { productId: string; quantity: number }[], client: string, adminId: string): Promise<ISale> => {
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

        for (const product of saleProducts) {
            const hasSubscription = await checkProductSubscription(product.product, adminId);
            if (hasSubscription) {
                await notifyAdmin(product.product, adminId);
            }
        }

        return sale;
    } catch (error: any) {
        throw new Error(`Could not create sale: ${error.message}`);
    }
};

const checkProductSubscription = async (productId: string, adminId: string): Promise<boolean> => {
    try {
        const response = await axios.get(`http://localhost:3000/api/is-subscribed/${productId}/${adminId}`);
        return response.data.isSubscribed;
    } catch (error: any) {
        throw new Error(`Could not check product subscription: ${error.message}`);
    }
};

const notifyAdmin = async (productId: string, adminId: string): Promise<void> => {
    await sendProductSoldEmail({ to: adminId, productId });
    console.log(`Sending email to admin ${adminId} about product ${productId}`);
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

export const scheduleSale = async (company: Types.ObjectId, products: any[], client: string, scheduledDate: Date, adminId: string): Promise<IScheduledSale> => {
    const total = calculateTotalAmount(products) as number;
    const scheduledSale = new ScheduledSale({ company, total, products, date: new Date(), client, scheduledDate, adminId });
    await scheduledSale.save();

    schedule.scheduleJob(scheduledDate, async () => {
        await triggerScheduledSale(scheduledSale.id);
    });

    return scheduledSale;
};

export const triggerScheduledSale = async (scheduledSaleId: Types.ObjectId): Promise<ISale> => {
    const scheduledSale = await ScheduledSale.findById(scheduledSaleId);
    if (!scheduledSale) throw new Error('Scheduled sale not found');

    const { companyId, products, client, adminId } = scheduledSale;
    const sale = await createSale(new Types.ObjectId(companyId), products, client, adminId);

    await ScheduledSale.deleteOne({ _id: scheduledSaleId });

    return sale;
};
