import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/sendmail-transport';
import { Company } from '../models/company';

const EMAIL_USER = 'gstorepcs@gmail.com';
const EMAIL_PASS = 'gstorepcs2023';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

interface SendInvitationEmailOptions {
    to: string;
    company: string;
    invitationLink: string;
}

export async function sendInvitationEmail({ to, company, invitationLink }: SendInvitationEmailOptions): Promise<SentMessageInfo> {
    const companyName = await Company.findById(company).select('name');
    const mailOptions = {
        from: EMAIL_USER,
        to,
        subject: 'Invitación para unirse a ' + companyName,
        text: `Ha sido invitado a unirse a la empresa "${companyName}" en nuestra plataforma. Por favor, haga click en el enlace de abajo para registrarse y unirse a la empresa:\n\n${invitationLink}\n\nSi no solicitó esta invitación, ignore este correo electrónico.`
    };
    return transporter.sendMail(mailOptions);
}
