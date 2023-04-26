import { Schema, model, Document } from 'mongoose';

export interface IProvider extends Document {
    name: string;
    address: string;
    email: string;
    phone: number;
    deleted: boolean;
}

export interface ProviderDocument extends IProvider {}

const providerSchema = new Schema<IProvider>(
    {
        name: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: Number, required: true },
        deleted: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

export const Provider = model<ProviderDocument>('Provider', providerSchema);
