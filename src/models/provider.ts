import { Schema, model, Document, Types } from 'mongoose';
import { ICompany } from './company';

export interface IProvider extends Document {
    name: string;
    address: string;
    email: string;
    phone: number;
    deleted: boolean;
    company: ICompany['_id'];
}

export interface ProviderDocument extends IProvider {}

const providerSchema = new Schema<IProvider>(
    {
        name: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: Number, required: true },
        deleted: { type: Boolean, default: false },
        company: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
    },
    {
        timestamps: true
    }
);

export const Provider = model<ProviderDocument>('Provider', providerSchema);
