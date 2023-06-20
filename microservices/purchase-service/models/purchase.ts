import { Schema, model, Document, Types } from 'mongoose';
import { ICompany } from './company';
import { IProduct } from './product';

export interface IPurchase extends Document {
    provider: Types.ObjectId;
    products: { product: Types.ObjectId; quantity: number }[];
    company: string;
    date: Date;
    total: number;
}

const purchaseSchema = new Schema<IPurchase>({
    provider: { type: Schema.Types.ObjectId, required: true },
    products: [
        {
            product: { type: Schema.Types.ObjectId, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    company: { type: String, required: true }, // now this is a string, no longer a Schema.Types.ObjectId
    date: { type: Date, required: true },
    total: { type: Number, required: true }
});

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
