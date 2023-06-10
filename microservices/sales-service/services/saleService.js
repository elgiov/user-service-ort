"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesByProduct = exports.getSales = exports.createSale = void 0;
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = require("mongoose");
const sale_1 = require("../models/sale");
const findProductById = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`http://product-service/api/products/${productId}`);
        return { id: response.data.id, price: response.data.price };
    }
    catch (error) {
        throw new Error(`Product with id "${productId}" not found`);
    }
});
const decreaseProductQuantity = (productId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield axios_1.default.post(`http://product-service/api/products/${productId}/decrease-quantity`, { quantity });
    }
    catch (error) {
        throw new Error(`Insufficient stock for product with id "${productId}"`);
    }
});
const calculateTotalAmount = (products) => {
    return products.reduce((total, { quantity, unitPrice }) => total + unitPrice * quantity, 0);
};
const createSale = (company, products, client) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productPromises = products.map(({ productId }) => findProductById(productId));
        const foundProducts = yield Promise.all(productPromises);
        const saleProducts = foundProducts.map((product, index) => {
            const { quantity } = products[index];
            const unitPrice = product.price;
            return { product: product.id, quantity, unitPrice };
        });
        // Check stock for each product
        for (const product of saleProducts) {
            const { product: productId, quantity } = product;
            yield decreaseProductQuantity(productId, quantity);
        }
        const total = calculateTotalAmount(saleProducts);
        const today = new Date();
        const sale = new sale_1.Sale({ company, total, products: saleProducts, date: today, client });
        yield sale.save();
        return sale;
    }
    catch (error) {
        throw new Error(`Could not create sale: ${error.message}`);
    }
});
exports.createSale = createSale;
const getSales = (company, page, limit, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyObjectId = new mongoose_1.Types.ObjectId(company);
        const totalSales = yield sale_1.Sale.countDocuments({
            company: companyObjectId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        });
        const totalPages = Math.ceil(totalSales / limit);
        const sales = yield sale_1.Sale.find({
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
    }
    catch (error) {
        throw new Error(`Could not fetch sales: ${error.message}`);
    }
});
exports.getSales = getSales;
const getSalesByProduct = (company, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companyObjectId = new mongoose_1.Types.ObjectId(company);
        const salesByProduct = yield sale_1.Sale.aggregate([
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
    }
    catch (error) {
        throw new Error(`Could not fetch sales by product: ${error.message}`);
    }
});
exports.getSalesByProduct = getSalesByProduct;
