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
exports.getCompanies = exports.getCompanyByName = exports.getCompanyById = exports.createCompany = void 0;
// services/companyService.ts
const company_1 = require("../models/company");
const createCompany = (name, address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCompany = new company_1.Company({ name, address });
        const company = yield newCompany.save();
        return company;
    }
    catch (error) {
        throw new Error('Could not create company');
    }
});
exports.createCompany = createCompany;
const getCompanyById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield company_1.Company.findById(id);
        return company;
    }
    catch (error) {
        throw new Error('Could not fetch company');
    }
});
exports.getCompanyById = getCompanyById;
const getCompanyByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield company_1.Company.findOne({ name });
        return company;
    }
    catch (error) {
        throw new Error(`Error fetching company by name: ${error.message}`);
    }
});
exports.getCompanyByName = getCompanyByName;
const getCompanies = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const companies = yield company_1.Company.find();
        return companies;
    }
    catch (error) {
        throw new Error('Could not fetch companies');
    }
});
exports.getCompanies = getCompanies;
