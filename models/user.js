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
exports.User = exports.hashPassword = exports.UserRole = void 0;
const mongoose_1 = require("mongoose");
const validator_1 = __importDefault(require("validator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["EMPLOYEE"] = "EMPLOYEE";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
const isEmailValid = (email) => validator_1.default.isEmail(email);
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt();
    return bcrypt_1.default.hash(password, salt);
});
exports.hashPassword = hashPassword;
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [isEmailValid, 'Invalid email']
    },
    password: { type: String, required: true },
    company: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true },
    role: { type: String, required: true, enum: Object.values(UserRole) },
    token: { type: String }
}, { timestamps: true });
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password')) {
            return next();
        }
        this.password = yield (0, exports.hashPassword)(this.password);
        next();
    });
});
exports.User = (0, mongoose_1.model)('User', userSchema);
