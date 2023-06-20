"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-nocheck
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
const auth_1 = __importDefault(require("../../../shared-middleware/src/auth"));
const router = (0, express_1.Router)();
router.post('/register/admin', userController_1.default.registerAdmin);
router.post('/register/employee', userController_1.default.registerEmployee);
router.post('/login', userController_1.default.login);
router.post('/register', userController_1.default.registerUser);
router.get('/info', auth_1.default.verifyToken, userController_1.default.infoUser);
router.get('/byId/:id', userController_1.default.infoUserById);
exports.default = router;
