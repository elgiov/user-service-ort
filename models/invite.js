"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invite = void 0;
const mongoose_1 = require("mongoose");
const invitationSchema = new mongoose_1.Schema({
    company: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Company', required: true },
    token: { type: String, required: true },
    role: { type: String, required: true, enum: ['ADMIN', 'EMPLOYEE'] },
    email: { type: String, required: true }
});
exports.Invite = (0, mongoose_1.model)('Invitation', invitationSchema);
