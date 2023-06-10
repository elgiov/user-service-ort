"use strict";
// sale-service/controllers/saleController.ts
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
const saleService = __importStar(require("../services/saleService"));
const logger_1 = require("../../../shared-middleware/src/logger");
const cache_1 = require("../../../shared-middleware/src/cache");
const moment_1 = __importDefault(require("moment"));
const CACHE_TTL_SECONDS = 60;
class SaleController {
    constructor() {
        this.getSalesByProduct = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const startDate = new Date(req.query.startDate);
                const endDate = new Date(req.query.endDate);
                const company = req.user.company;
                const cacheKey = `salesByProduct:${company}:${startDate.toISOString()}:${endDate.toISOString()}`;
                const cachedData = yield (0, cache_1.getAsync)(cacheKey);
                if (cachedData) {
                    const salesByProduct = JSON.parse(cachedData);
                    res.json(salesByProduct);
                    logger_1.logger.info(`Sales by product found. (Retrieved from cache)`);
                }
                else {
                    const salesByProduct = yield saleService.getSalesByProduct(company, startDate, endDate);
                    yield (0, cache_1.setexAsync)(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(salesByProduct));
                    res.json(salesByProduct);
                    logger_1.logger.info(`Sales by product found. (Retrieved from database)`);
                }
            }
            catch (error) {
                logger_1.logger.error(`Error in getSalesByProduct: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    createSale(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = req.user.company;
                const { products, client } = req.body;
                const newSale = yield saleService.createSale(company, products, client);
                res.status(201).json(newSale);
                logger_1.logger.info(`New sale created`);
            }
            catch (error) {
                logger_1.logger.error(`Error in createSale: ${error.message}`);
                next(new httpError_1.default(400, error.message));
            }
        });
    }
    getSales(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const company = req.user.company;
                if (!company) {
                    logger_1.logger.error('No company provided');
                    return next(new httpError_1.default(401, 'No company provided'));
                }
                const page = parseInt(req.query.page) || 1;
                const limit = 5;
                const startDate = req.query.startDate
                    ? (0, moment_1.default)(req.query.startDate, 'YYYY-MM-DD')
                        .toISOString()
                        .substring(0, 10)
                    : moment_1.default.utc().startOf('month').toISOString().substring(0, 10);
                const endDate = req.query.endDate
                    ? (0, moment_1.default)(req.query.endDate, 'YYYY-MM-DD')
                        .toISOString()
                        .substring(0, 10)
                    : moment_1.default.utc().add(1, 'days').toISOString().substring(0, 10);
                const sales = yield saleService.getSales(company, page, limit, startDate, endDate);
                res.json(sales);
                logger_1.logger.info(`All sales found`);
            }
            catch (error) {
                logger_1.logger.error(`Error in getSales: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
}
exports.default = new SaleController();
