import sgMail from '@sendgrid/mail';
import axios, { Axios, AxiosResponse } from 'axios';

const SENDGRID_API_KEY = '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';

sgMail.setApiKey(SENDGRID_API_KEY);

interface SendInvitationEmailOptions {
    to: string;
    company: string;
    invitationLink: string;
}

export async function sendInvitationEmail({ to, company, invitationLink }: SendInvitationEmailOptions): Promise<void> {
    const companyById = await axios.get(`http://localhost:3002/api/companies/${company}`);
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
    await sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent');
        })
        .catch((error) => {
            console.error(error);
        });
}

export async function sendProductSoldEmail(productId: string, token: string): Promise<void> {
    const headers = {
        Authorization: token
    };

    const productFromDB: { data: any } = (await axios.get(`http://localhost:3000/api/products/byId/${productId}`)) as AxiosResponse;
    if (!productFromDB) {
        throw new Error('Product not found');
    }

    const subscribedAdmins = await axios.get(`http://localhost:3000/api/products/subscribed-admins/${productId}`, { headers });
    const msg = {
        to: subscribedAdmins.data,
        from: 'gioghisellini@gmail.com',
        subject: 'Product Sold Notification',
        text: `The product "${productFromDB.data.name}" has been sold. Check the inventory for stock details.`
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

export async function sendProductStockEmail(productId: string) {
    const productFromDB: { data: any } = await axios.get(`http://localhost:3000/api/products/byId/${productId}`);
    if (!productFromDB) {
        throw new Error('Product not found');
    }

    const subscribedAdmins = await axios.get(`http://localhost:3000/api/products/subscribed-admins-stock/${productId}`);
    const msg = {
        to: subscribedAdmins.data,
        from: 'gioghisellini@gmail.com',
        subject: 'Product Out of Stock Notification',
        text: `The product "${productFromDB.data.name}" is out of stock. Please restock the inventory.`
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

export async function sendProductPurchasedEmail(productId: string, token: string): Promise<void> {
    const headers = {
        Authorization: token
    };

    const productFromDB: { data: any } = await axios.get(`http://localhost:3000/api/products/byId/${productId}`);
    if (!productFromDB) {
        throw new Error('Product not found');
    }

    const subscribedAdmins = await axios.get(`http://localhost:3000/api/products/subscribed-admins/${productId}`, { headers });
    const msg = {
        to: subscribedAdmins.data,
        from: 'gioghisellini@gmail.com',
        subject: 'Product Purchased Notification',
        text: `The product "${productFromDB.data.name}" has been purchased. Check the inventory for stock details.`
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

export async function sendReportEmail(to: string, pdfBuffer: Buffer): Promise<void> {
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
        await sgMail.send(msg);
        console.log('Email sent');
    } catch (error) {
        console.error(error);
    }
}
