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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.decreaseProductQuantity = exports.uploadImage = exports.getProductsByCompany = exports.getProduct = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const product_1 = require("../models/product");
const s3_upload_1 = require("../../upload-service/s3-upload");
const createProduct = ({ name, description, image, price, quantity, company }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newProduct = new product_1.Product({ name, description, image, price, quantity, company });
        const product = yield newProduct.save();
        return product;
    }
    catch (error) {
        throw new Error('Could not create a new product');
    }
});
exports.createProduct = createProduct;
const updateProduct = (name, company, update) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingProduct = yield (0, exports.getProduct)(name, company);
        if (!existingProduct) {
            return null;
        }
        if (update.name && update.name !== existingProduct.name) {
            const productWithNewName = yield (0, exports.getProduct)(update.name, company);
            if (productWithNewName) {
                throw new Error(`A product with name "${update.name}" already exists`);
            }
        }
        const updatedProduct = yield product_1.Product.findOneAndUpdate({ name, company }, Object.assign(Object.assign({}, existingProduct.toObject()), update), { new: true });
        return updatedProduct;
    }
    catch (error) {
        throw new Error(`Could not update product with name "${name}": ${error.message}`);
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (name, company) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingProduct = yield (0, exports.getProduct)(name, company);
        if (!existingProduct) {
            return null;
        }
        const updatedProduct = yield product_1.Product.findOneAndUpdate({ name, company }, { deleted: true }, { new: true });
        return updatedProduct;
    }
    catch (error) {
        throw new Error(`Could not delete product with name "${name}": ${error.message}`);
    }
});
exports.deleteProduct = deleteProduct;
const getProduct = (name, company) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_1.Product.findOne({ name, company });
    return product;
});
exports.getProduct = getProduct;
const getProductsByCompany = (company) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield product_1.Product.find({ company, deleted: false });
        return products;
    }
    catch (error) {
        throw new Error(`Could not get products for company "${company}": ${error.message}`);
    }
});
exports.getProductsByCompany = getProductsByCompany;
const uploadImage = (buffer, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageKey = `products/${Date.now()}-${name}`;
        const image = yield (0, s3_upload_1.uploadToS3)(buffer, imageKey, 'image/jpeg');
        return image;
    }
    catch (error) {
        throw new Error('Could not upload the image');
    }
});
exports.uploadImage = uploadImage;
const decreaseProductQuantity = (productId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_1.Product.findById(productId);
        if (!product) {
            throw new Error(`Product with id "${productId}" not found`);
        }
        if (product.quantity < quantity) {
            throw new Error(`Insufficient stock for product with id "${productId}"`);
        }
        product.quantity -= quantity;
        yield product.save();
    }
    catch (error) {
        throw new Error(`Could not decrease quantity for product with id "${productId}": ${error.message}`);
    }
});
exports.decreaseProductQuantity = decreaseProductQuantity;
const getProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_1.Product.findById(id);
        if (!product) {
            throw new Error(`Product with id "${id}" not found`);
        }
        return product;
    }
    catch (error) {
        throw new Error(`Could not get product with id "${id}": ${error.message}`);
    }
});
exports.getProductById = getProductById;
