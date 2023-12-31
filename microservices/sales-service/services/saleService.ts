import axios from 'axios';
import { ObjectId, Types } from 'mongoose';
import { ISale, Sale } from '../models/sale';
import { IScheduledSale, ScheduledSale } from '../models/scheduledSales';
import schedule from 'node-schedule';
import { sendProductSoldEmail } from '../../user-service/services/emailService';

const findProductById = async (productId: string): Promise<{ id: string; price: number }> => {
    try {
        const response = await axios.get(`https://product-service-gestion-inv-a517252dd275.herokuapp.com/api/products/byId/${productId}`);
        return { id: response.data._id, price: response.data.price };
    } catch (error) {
        throw new Error(`Product with id "${productId}" not found`);
    }
};

const decreaseProductQuantity = async (productId: string, quantity: number): Promise<void> => {
    try {
        await axios.post(`https://product-service-gestion-inv-a517252dd275.herokuapp.com/api/products/decrease-quantity/${productId}`, { quantity });
    } catch (error) {
        throw new Error(`Insufficient stock for product with id "${productId}"`);
    }
};

const calculateTotalAmount = (products: { quantity: number; unitPrice: number }[]): number => {
    return products.reduce((total, { quantity, unitPrice }) => total + unitPrice * quantity, 0);
};

export const createSale = async (
    company: Types.ObjectId,
    products: { productId: string; quantity: number }[],
    client: string,
    token: string,
    notify: boolean = true,
    decreaseQty: boolean = true
): Promise<ISale> => {
    try {
        const productPromises = products.map(({ productId }) => findProductById(productId));
        const foundProducts = await Promise.all(productPromises);
        const saleProducts = foundProducts.map((product, index) => {
            const { quantity } = products[index];
            const unitPrice = product.price;
            return { productId: product.id, quantity, unitPrice };
        });

        if (decreaseQty) {
            for (const product of saleProducts) {
                await decreaseProductQuantity(product.productId, product.quantity);
            }
        }

        const total = calculateTotalAmount(saleProducts) as number;
        const today = new Date();
        const sale = new Sale({ companyId: company, total, products: saleProducts, date: today, client });
        await sale.save();

        if (notify) {
            for (const product of saleProducts) {
                await notifyAdmins(product.productId, token);
            }
        }

        return sale;
    } catch (error: any) {
        throw new Error(`Could not create sale: ${error.message}`);
    }
};

const notifyAdmins = async (productId: string, token: string): Promise<void> => {
    await sendProductSoldEmail(productId, token);
    console.log(`Sending email about product ${productId}`);
};

export const getSales = async (company: string, page: number, limit: number, startDate: string, endDate: string) => {
    try {
        const totalSales = await Sale.countDocuments({
            companyId: company,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        });

        const totalPages = Math.ceil(totalSales / limit);

        let sales = await Sale.find({
            companyId: company,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ date: -1 });

        sales = await Promise.all(
            sales.map(async (sale) => {
                sale.products = await Promise.all(
                    sale.products.map(async (productSale) => {
                        const response = await axios.get(`https://product-service-gestion-inv-a517252dd275.herokuapp.com/api/products/byId/${productSale.productId}`);
                        productSale.product = response.data;
                        return productSale;
                    })
                );
                return sale;
            })
        );

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

export const getSalesByProduct = async (company: string, startDate: Date, endDate: Date) => {
    let pipeline: any = [
        {
            $match: {
                companyId: company,
                date: { $gte: startDate, $lte: endDate }
            }
        },
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products.productId',
                totalSold: { $sum: '$products.quantity' },
                totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.unitPrice'] } }
            }
        },
        {
            $project: {
                _id: 0,
                product: '$_id',
                totalSold: 1,
                totalRevenue: 1
            }
        }
    ];

    const salesByProduct = await Sale.aggregate(pipeline);
    return salesByProduct;
};

export const scheduleSale = async (company: Types.ObjectId, products: any[], client: string, scheduledDate: Date, adminId: string, token: string): Promise<IScheduledSale> => {
    const productPromises = products.map(({ productId }) => findProductById(productId));
    const foundProducts = await Promise.all(productPromises);
    const saleProducts = foundProducts.map((product, index) => {
        const { quantity } = products[index];
        const unitPrice = product.price;
        return { productId: product.id, quantity, unitPrice };
    });
    const total = calculateTotalAmount(saleProducts) as number;

    for (const product of products) {
        await decreaseProductQuantity(product.productId, product.quantity);
    }

    const scheduledSale = new ScheduledSale({ companyId: company, total, products: saleProducts, date: new Date(), client, scheduledDate, adminId });
    await scheduledSale.save();

    const currentDay = new Date(); // get the current date and time
    currentDay.setHours(0, 0, 0, 0); // set hours, minutes, seconds and milliseconds to zero to ignore time
    const scheduledDay = new Date(scheduledDate);
    scheduledDay.setHours(0, 0, 0, 0); // do the same for the scheduled date

    if (currentDay.getTime() === scheduledDay.getTime()) {
        // check if the scheduled date is the same as the current date
        await triggerScheduledSale(scheduledSale.id, token);
    } else {
        schedule.scheduleJob(scheduledDate, async () => {
            await triggerScheduledSale(scheduledSale.id, token);
        });
    }

    return scheduledSale;
};

export const triggerScheduledSale = async (scheduledSaleId: Types.ObjectId, token: string): Promise<ISale> => {
    const scheduledSale = await ScheduledSale.findById(scheduledSaleId);
    if (!scheduledSale) throw new Error('Scheduled sale not found');

    const { companyId, products, client } = scheduledSale;
    const sale = await createSale(new Types.ObjectId(companyId), products, client, token, true, false);

    await ScheduledSale.deleteOne({ _id: scheduledSaleId });

    return sale;
};
export async function getTopProducts(company: any) {
    const results = await Sale.aggregate([
        { $match: { companyId: company } },
        { $unwind: '$products' },
        { $group: { _id: '$products.productId', totalSold: { $sum: '$products.quantity' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 3 },
        {
            $project: {
                _id: 0,
                productId: '$_id',
                totalSold: 1
            }
        }
    ]);

    return results;
}

export const getAllSalesNoPagination = async (company: string, startDate: string, endDate: string) => {
    try {
        const sales = await Sale.find({
            companyId: company,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: -1 });

        return sales;
    } catch (error: any) {
        throw new Error(`Could not fetch sales: ${error.message}`);
    }
};

export async function getAllSalesByCompanyId(company: string, startDate: string, endDate: string) {
    const sales = await getAllSalesNoPagination(company, startDate, endDate);

    return sales;
}
