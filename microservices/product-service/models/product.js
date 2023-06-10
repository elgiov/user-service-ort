"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    deleted: { type: Boolean, default: false },
    company: { type: String, required: true } // now this is a string, no longer a Schema.Types.ObjectId
}, {
    timestamps: true
});
productSchema.index({ name: 1, company: 1 }, { unique: true });
exports.Product = (0, mongoose_1.model)('Product', productSchema);
