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
exports.sendReportEmail = exports.sendProductPurchasedEmail = exports.sendProductStockEmail = exports.sendProductSoldEmail = exports.sendInvitationEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const axios_1 = __importDefault(require("axios"));
const SENDGRID_API_KEY = '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';
mail_1.default.setApiKey(SENDGRID_API_KEY);
function sendInvitationEmail({ to, company, invitationLink }) {
    return __awaiter(this, void 0, void 0, function* () {
        const companyById = yield axios_1.default.get(`https://company-service-gestion-inv-a517252dd275.herokuapp.com/api/companies/${company}`);
        if (!companyById) {
            throw new Error('Company not found');
        }
        const companyFromDB = companyById.data;
        const msg = {
            to,
            from: 'gioghisellini@gmail.com',
            subject: 'Invitación para unirse a ' + companyFromDB.name,
            text: `Ha sido invitado a unirse a la empresa "${companyFromDB.name}" en nuestra plataforma. Por favor, haga click en el enlace de abajo para registrarse y unirse a la empresa:\n\n${invitationLink}\n\nSi no solicitó esta invitación, ignore este correo electrónico.`
        };
        yield mail_1.default
            .send(msg)
            .then(() => {
            console.log('Email sent');
        })
            .catch((error) => {
            console.error(error);
        });
    });
}
exports.sendInvitationEmail = sendInvitationEmail;
function sendProductSoldEmail(productId, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = {
            Authorization: token
        };
        const productFromDB = (yield axios_1.default.get(`https://product-service-gestion-inv-a517252dd275.herokuapp.com/api/products/byId/${productId}`));
        if (!productFromDB) {
            throw new Error('Product not found');
        }
        const subscribedAdmins = yield axios_1.default.get(`https://product-service-gestion-inv-a517252dd275.herokuapp.com/api/products/subscribed-admins/${productId}`, { headers });
        const msg = {
            to: subscribedAdmins.data,
            from: 'gioghisellini@gmail.com',
            subject: 'Product Sold Notification',
            text: `The product "${productFromDB.data.name}" has been sold. Check the inventory for stock details.`
        };
        yield mail_1.default
            .send(msg)
            .then(() => {
            console.log('Email sent');
        })
            .catch((error) => {
            console.error(error);
        });
    });
}
exports.sendProductSoldEmail = sendProductSoldEmail;
function sendProductStockEmail(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const productFromDB = yield axios_1.default.get(`https://product-service-gestion-inv-a517252dd275.herokuapp.com/api/products/byId/${productId}`);
        if (!productFromDB) {
            throw new Error('Product not found');
        }
        const subscribedAdmins = yield axios_1.default.get(`https://product-service-gestion-inv-a517252dd275.herokuapp.com/api/products/subscribed-admins-stock/${productId}`);
        const msg = {
            to: subscribedAdmins.data,
            from: 'gioghisellini@gmail.com',
            subject: 'Product Out of Stock Notification',
            text: `The product "${productFromDB.data.name}" is out of stock. Please restock the inventory.`
        };
        yield mail_1.default
            .send(msg)
            .then(() => {
            console.log('Email sent');
        })
            .catch((error) => {
            console.error(error);
        });
    });
}
exports.sendProductStockEmail = sendProductStockEmail;
function sendProductPurchasedEmail(productId, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = {
            Authorization: token
        };
        const productFromDB = yield axios_1.default.get(`https://product-service-gestion-inv-a517252dd275.herokuapp.com/api/products/byId/${productId}`);
        if (!productFromDB) {
            throw new Error('Product not found');
        }
        const subscribedAdmins = yield axios_1.default.get(`https://product-service-gestion-inv-a517252dd275.herokuapp.com/api/products/subscribed-admins/${productId}`, { headers });
        const msg = {
            to: subscribedAdmins.data,
            from: 'gioghisellini@gmail.com',
            subject: 'Product Purchased Notification',
            text: `The product "${productFromDB.data.name}" has been purchased. Check the inventory for stock details.`
        };
        yield mail_1.default
            .send(msg)
            .then(() => {
            console.log('Email sent');
        })
            .catch((error) => {
            console.error(error);
        });
    });
}
exports.sendProductPurchasedEmail = sendProductPurchasedEmail;
function sendReportEmail(to, pdfBuffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const attachment = pdfBuffer.toString('base64');
        const msg = {
            to,
            from: 'gioghisellini@gmail.com',
            subject: 'Reporte de ventas y compras',
            text: 'Encuentre el reporte de ventas y compras adjunto.',
            attachments: [
                {
                    content: attachment,
                    filename: 'Report.pdf',
                    type: 'application/pdf',
                    disposition: 'attachment',
                    content_id: 'Report' // Add content_id for the attachment
                }
            ]
        };
        try {
            yield mail_1.default.send(msg);
            console.log('Email sent');
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.sendReportEmail = sendReportEmail;
