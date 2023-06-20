"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const mongoose_1 = require("mongoose");
const companySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String }
}, {
    timestamps: true
});
exports.Company = (0, mongoose_1.model)('Company', companySchema);
