"use strict";
// /product-service/controllers/productController.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const httpError_1 = __importDefault(require("../../../shared-middleware/src/httpError"));
const productService = __importStar(require("../services/productService"));
const companyService_1 = require("../services/companyService");
const logger_1 = require("../../../shared-middleware/src/logger");
const cache_1 = require("../../../shared-middleware/src/cache");
const axios_1 = __importDefault(require("axios"));
class ProductController {
    constructor() {
        this.getTopProducts = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const company = req.user.company;
                if (!company) {
                    logger_1.logger.error(`Error in getTopProducts: No company provided`);
                    throw new httpError_1.default(401, 'No company provided');
                }
                const cacheKey = `topProducts:${company}`;
                const cachedData = yield (0, cache_1.getAsync)(cacheKey);
                if (cachedData) {
                    const topProducts = JSON.parse(cachedData);
                    res.json(topProducts);
                    logger_1.logger.info(`Top products found for company "${company}" (from cache)`);
                }
                else {
                    try {
                        const response = yield axios_1.default.get(`http://sales-service/api/sales/top-products/${company}`);
                        const topProducts = response.data;
                        res.json(topProducts);
                        logger_1.logger.info(`Top products found for company "${company}" (from Sales microservice)`);
                        yield (0, cache_1.setexAsync)(cacheKey, 60, JSON.stringify(topProducts));
                    }
                    catch (error) {
                        logger_1.logger.error(`Error in getTopProducts: Could not fetch top products from Sales microservice: ${error.message}`);
                        next(new httpError_1.default(500, error.message));
                    }
                }
            }
            catch (error) {
                logger_1.logger.error(`Error in getTopProducts: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    addProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let formatProduct = req.body.json;
                const bodyProduct = JSON.parse(formatProduct);
                let company = req.user.company;
                let name = bodyProduct.name;
                const product = yield productService.getProduct(name, company);
                if (product) {
                    const companyObject = yield (0, companyService_1.getCompanyById)(company);
                    logger_1.logger.error(`Error in addProduct: The product ${product.name} already exists for the ${companyObject === null || companyObject === void 0 ? void 0 : companyObject.name} company.`);
                    return next(new httpError_1.default(422, `The product ${product.name} already exists for the ${companyObject === null || companyObject === void 0 ? void 0 : companyObject.name} company.`));
                }
                const file = req.file;
                if (!file) {
                    logger_1.logger.error(`Error in addProduct: No image provided`);
                    return next(new httpError_1.default(400, 'No image provided'));
                }
                const { buffer, originalname } = file;
                const image = yield productService.uploadImage(buffer, originalname);
                const createdProduct = yield productService.createProduct(Object.assign(Object.assign({}, bodyProduct), { company, image }));
                res.status(201).json({ message: 'Product added correctly', product: createdProduct });
                logger_1.logger.info(`New product created: ${createdProduct.name}`);
            }
            catch (error) {
                logger_1.logger.error(`Error in addProduct: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    updateProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const name = req.params.name;
                const company = req.user.company;
                const update = req.body;
                const updatedProduct = yield productService.updateProduct(name, company, update);
                if (!updatedProduct) {
                    logger_1.logger.error(`Error in updateProduct: Product with name "${name}" for company "${company}" not found`);
                    return next(new httpError_1.default(404, `Product with name "${name}" for company "${company}" not found`));
                }
                res.status(200).json({ message: 'Product edited correctly', product: updatedProduct });
                logger_1.logger.info(`Product with name "${name}" for company "${company}" updated`);
            }
            catch (error) {
                logger_1.logger.error(`Error in updateProduct: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    getProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name } = req.params;
                const { company } = req.body;
                const product = yield productService.getProduct(name, company);
                if (!product) {
                    logger_1.logger.error(`Error in getProduct: Product with name "${name}" for company "${company}" not found`);
                    return next(new httpError_1.default(404, `Product with name "${name}" for company "${company}" not found`));
                }
                res.status(200).json(product);
                logger_1.logger.info(`Product with name "${name}" for company "${company}" found`);
            }
            catch (error) {
                logger_1.logger.error(`Error in getProduct: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    getProductsByCompany(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = req.user.company;
                const products = yield productService.getProductsByCompany(company);
                /* if (!products || products.length === 0) {
                     logger.error(`Error in getProductsByCompany: No products found for company "${company}"`);
                     return next(new HttpError(404, `No products found for company "${company}"`));
                 }
                 */
                res.status(200).json(products);
                logger_1.logger.info(`Products found for company "${company}"`);
            }
            catch (error) {
                logger_1.logger.error(`Error in getProductsByCompany: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    deleteProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const name = req.params.name;
                const company = req.user.company;
                const deletedProduct = yield productService.deleteProduct(name, company);
                if (!deletedProduct) {
                    logger_1.logger.error(`Error in deleteProduct: Product with name "${name}" for company "${company}" not found`);
                    return next(new httpError_1.default(404, `Product with name "${name}" for company "${company}" not found`));
                }
                res.status(200).json({ message: 'Product deleted correctly' });
                logger_1.logger.info(`Product with name "${name}" for company "${company}" deleted`);
            }
            catch (error) {
                logger_1.logger.error(`Error in deleteProduct: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
}
exports.default = new ProductController();
