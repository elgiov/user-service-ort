import sgMail from '@sendgrid/mail';
import axios from 'axios';
import { Company } from '../models/company';

const SENDGRID_API_KEY = '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';

sgMail.setApiKey(SENDGRID_API_KEY);

interface SendInvitationEmailOptions {
    to: string;
    company: string;
    invitationLink: string;
}

export async function sendInvitationEmail({ to, company, invitationLink }: SendInvitationEmailOptions): Promise<void> {
    const companyFromDB = await Company.findById(company).select('name');
    if (!companyFromDB) {
        throw new Error('Company not found');
    }
    const msg = {
        to,
        from: 'gioghisellini@gmail.com',
        subject: 'Invitación para unirse a ' + companyFromDB.name,
        text: `Ha sido invitado a unirse a la empresa "${companyFromDB.name}" en nuestra plataforma. Por favor, haga click en el enlace de abajo para registrarse y unirse a la empresa:\n\n${invitationLink}\n\nSi no solicitó esta invitación, ignore este correo electrónico.`
    };
    await sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent');
        })
        .catch((error) => {
            console.error(error);
        });
}

export async function sendProductSoldEmail(productId: string): Promise<void> {
    const productFromDB: { name: string } = await axios.get(`http://localhost:3000/api/products/${productId}`);
    if (!productFromDB) {
        throw new Error('Product not found');
    }

    const subscribedAdmins = await axios.get(`http://localhost:3000/api/products/subscribed-admins/${productId}`);

    const msg = {
        to: subscribedAdmins.data,
        from: 'gioghisellini@gmail.com',
        subject: 'Product Sold Notification',
        text: `The product "${productFromDB.name}" has been sold. Check the inventory for stock details.`
    };

    await sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent');
        })
        .catch((error) => {
            console.error(error);
        });
}

export async function sendProductPurchasedEmail(productId: string): Promise<void> {
    const productFromDB: { name: string } = await axios.get(`http://localhost:3000/api/products/${productId}`);
    if (!productFromDB) {
        throw new Error('Product not found');
    }

    const subscribedAdmins = await axios.get(`http://localhost:3000/api/products/subscribed-admins/${productId}`);

    const msg = {
        to: subscribedAdmins.data,
        from: 'gioghisellini@gmail.com',
        subject: 'Product Purchased Notification',
        text: `The product "${productFromDB.name}" has been purchased. Check the inventory for stock details.`
    };

    await sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent');
        })
        .catch((error) => {
            console.error(error);
        });
}
