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
const companyService_1 = require("../services/companyService");
const httpError_1 = __importDefault(require("../../../shared-middleware/src/httpError"));
const logger_1 = require("../../../shared-middleware/src/logger");
class CompanyController {
    createCompany(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, address } = req.body;
                const newCompany = yield (0, companyService_1.createCompany)(name, address);
                res.status(201).json(newCompany);
                logger_1.logger.info(`New company created: ${newCompany.name}`);
            }
            catch (error) {
                logger_1.logger.error(`Error in createCompany: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    getCompanyById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const company = yield (0, companyService_1.getCompanyById)(id);
                res.status(200).json(company);
                logger_1.logger.info(`Company with id: ${id} found`);
            }
            catch (error) {
                logger_1.logger.error(`Error in getCompanyById: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    getCompanies(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companies = yield (0, companyService_1.getCompanies)();
                res.status(200).json(companies);
                logger_1.logger.info(`All companies found`);
            }
            catch (error) {
                logger_1.logger.error(`Error in getCompanies: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
}
exports.default = new CompanyController();
