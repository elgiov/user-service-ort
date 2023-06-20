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
exports.getUserByEmail = exports.getUserById = exports.createUser = void 0;
const user_1 = require("../models/user");
// userService.ts
const invite_1 = require("../models/invite");
const createUser = ({ name, email, password, company, role, token }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield (0, exports.getUserByEmail)(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        let invite = null;
        if (token) {
            invite = yield invite_1.Invite.findOne({ token });
            if (!invite) {
                throw new Error('Invalid invitation token');
            }
            role = invite.role;
            company = invite.company;
        }
        else {
            //TRAERME LA COMPANY SI NO ES ID SOLO SI ES NOMBRE
        }
        const newUser = new user_1.User({ name, email, password, company, role });
        const user = yield newUser.save();
        if (invite) {
            yield invite_1.Invite.deleteOne({ _id: invite._id });
        }
        return user;
    }
    catch (error) {
        throw new Error(`Could not create user: ${error.message}`);
    }
});
exports.createUser = createUser;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.User.findById(id);
    return user;
});
exports.getUserById = getUserById;
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.User.findOne({ email });
    return user;
});
exports.getUserByEmail = getUserByEmail;
