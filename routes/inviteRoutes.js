"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-nocheck
const express_1 = require("express");
const inviteController_1 = __importDefault(require("../controllers/inviteController"));
const auth_1 = __importDefault(require("../../../shared-middleware/src/auth"));
const router = (0, express_1.Router)();
router.post('/', auth_1.default.verifyToken, inviteController_1.default.sendInvitation);
router.get('/:token', auth_1.default.verifyToken, inviteController_1.default.getInvitationData);
exports.default = router;
