import { Schema, model, Document, Types } from 'mongoose';


export interface IProvider extends Document {
    name: string;
    address: string;
    email: string;
    phone: number;
    deleted: boolean;
    company: string; // Now, we just need the ID of the company, it should be string type
}

export interface ProviderDocument extends IProvider {}

const providerSchema = new Schema<IProvider>(
    {
        name: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: Number, required: true },
        deleted: { type: Boolean, default: false },
        company: { type: String, required: true } // now this is a string, no longer a Schema.Types.ObjectId
    },
    {
        timestamps: true
    }
);

export const Provider = model<ProviderDocument>('Provider', providerSchema);
