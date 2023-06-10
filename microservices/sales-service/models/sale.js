"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sale = void 0;
const mongoose_1 = require("mongoose");
const ProductSaleSchema = new mongoose_1.Schema({
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }
});
const SaleSchema = new mongoose_1.Schema({
    companyId: { type: String, required: true },
    products: [ProductSaleSchema],
    total: { type: Number, required: true },
    date: { type: Date, required: true },
    client: { type: String, required: true }
}, {
    timestamps: true
});
exports.Sale = (0, mongoose_1.model)('Sale', SaleSchema);
