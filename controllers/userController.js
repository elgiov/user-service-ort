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
const userService_1 = require("../services/userService");
const user_1 = require("../models/user");
const fs_1 = require("fs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const httpError_1 = __importDefault(require("../../../shared-middleware/src/httpError"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = require("../../../shared-middleware/src/logger");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const baseApi = axios_1.default.create({
    baseURL: `https://company-service-gestion-inv-a517252dd275.herokuapp.com/api/companies`,
    proxy: false
});
class UserController {
    constructor() {
        this.registerUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { company, role } = req.body;
                if (!company) {
                    logger_1.logger.error(`Error in registerUser: Company name is required`);
                    next(new httpError_1.default(400, 'Company name is required'));
                    return;
                }
                if (role === user_1.UserRole.ADMIN || !role) {
                    yield this.registerAdmin(req, res, next);
                }
                else if (role === user_1.UserRole.EMPLOYEE) {
                    yield this.registerEmployee(req, res, next);
                }
                else {
                    logger_1.logger.error(`Error in registerUser: Invalid role`);
                    next(new httpError_1.default(400, 'Invalid role in the token'));
                }
            }
            catch (error) {
                logger_1.logger.error(`Error in registerUser: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    registerAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, company, address, token } = req.body;
                const { data } = yield baseApi.get(`/byName/` + company);
                const existingCompany = data;
                if (token) {
                    // If token is present it is an invitation (should not create a new company)
                    if (!existingCompany) {
                        logger_1.logger.error(`Error in registerAdmin: Company not found`);
                        next(new httpError_1.default(404, 'Company not found'));
                        return;
                    }
                    const newUser = yield (0, userService_1.createUser)({ name, email, password, company: existingCompany._id, role: user_1.UserRole.ADMIN, token });
                    res.status(201).json({ user: newUser, company: existingCompany });
                }
                else {
                    // If token is not present it is not an invitation (should create a new company)
                    if (existingCompany) {
                        logger_1.logger.error(`Error in registerAdmin: Company with name: ${existingCompany.name} already exists`);
                        next(new httpError_1.default(409, `Company with name: ${existingCompany.name} already exists`, { type: 'company_exists' }));
                        return;
                    }
                    const userAlreadyExists = yield (0, userService_1.getUserByEmail)(email);
                    if (userAlreadyExists) {
                        logger_1.logger.error(`Error in registerAdmin: User with email: ${email} already exists`);
                        next(new httpError_1.default(409, `User with email: ${email} already exists`, { type: 'user_exists' }));
                        return;
                    }
                    const body = {
                        name: company,
                        address: address
                    };
                    const { data } = yield baseApi.post(`/add`, body);
                    const newCompany = data;
                    const newUser = yield (0, userService_1.createUser)({ name, email, password, company: newCompany._id, role: user_1.UserRole.ADMIN });
                    res.status(201).json({ user: newUser, company: newCompany });
                    logger_1.logger.info(`New user admin created: ${newUser.name} to company: ${newCompany.name} `);
                }
            }
            catch (error) {
                logger_1.logger.error(`Error in registerAdmin: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    registerEmployee(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, company, token } = req.body;
                const userAlreadyExists = yield (0, userService_1.getUserByEmail)(email);
                if (userAlreadyExists) {
                    logger_1.logger.error(`Error in registerEmployee: User with email: ${email} already exists`);
                    next(new httpError_1.default(409, `User with email: ${email} already exists`, { type: 'user_exists' }));
                    return;
                }
                const newUser = yield (0, userService_1.createUser)({ name, email, password, company, role: user_1.UserRole.EMPLOYEE, token });
                res.status(201).json(newUser);
                logger_1.logger.info(`New employee created: ${newUser.name}`);
            }
            catch (error) {
                logger_1.logger.error(`Error in registerEmployee: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    infoUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userInfo = req.user;
                res.status(201).json(userInfo);
                logger_1.logger.info(`GET info user ${userInfo.name}`);
            }
            catch (error) {
                logger_1.logger.error(`Error in infoUser: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    infoUserById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const user = yield (0, userService_1.getUserById)(id);
                if (!user) {
                    logger_1.logger.error(`Error in infoUserById: User with id: ${id} not found`);
                    next(new httpError_1.default(404, `User with id: ${id} not found`));
                    return;
                }
                res.status(201).json(user);
                logger_1.logger.info(`GET info user ${user.name}`);
            }
            catch (error) {
                logger_1.logger.error(`Error in infoUserById: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
    login(req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const email = (_a = req.body) === null || _a === void 0 ? void 0 : _a.email;
            const password = (_b = req.body) === null || _b === void 0 ? void 0 : _b.password;
            if (!email) {
                logger_1.logger.error(`Error in login: Email, parameter required.`);
                next(new httpError_1.default(400, 'Email, parameter required.'));
                return;
            }
            if (!password) {
                logger_1.logger.error(`Error in login: Password, parameter required.`);
                next(new httpError_1.default(400, 'Password, parameter required.'));
                return;
            }
            try {
                const user = yield (0, userService_1.getUserByEmail)(email);
                if (!user) {
                    logger_1.logger.error(`Error in login: Email or password incorrect.`);
                    next(new httpError_1.default(401, 'Email or password incorrect.'));
                    return;
                }
                let comparedPassword = yield bcrypt_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
                if (!comparedPassword) {
                    logger_1.logger.error(`Error in login: Email or password incorrect.`);
                    next(new httpError_1.default(401, 'Email or password incorrect.'));
                    return;
                }
                const privateKey = (0, fs_1.readFileSync)(process.env.JWT_PRIVATE_KEY_PATH);
                const role = user === null || user === void 0 ? void 0 : user.role;
                const name = user === null || user === void 0 ? void 0 : user.name;
                const company = user === null || user === void 0 ? void 0 : user.company;
                const idUser = user === null || user === void 0 ? void 0 : user.id;
                const tokenPayload = { email, role, name, company, idUser };
                const token = jsonwebtoken_1.default.sign(tokenPayload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
                res.status(200).json({ userToken: token });
                logger_1.logger.info(`User logged in: ${user === null || user === void 0 ? void 0 : user.name}`);
            }
            catch (error) {
                logger_1.logger.error(`Error in login: ${error.message}`);
                next(new httpError_1.default(500, error.message));
            }
        });
    }
}
exports.default = new UserController();
