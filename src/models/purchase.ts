import { Schema, model, Document, Types } from 'mongoose';
import { ICompany } from './company';
import { IProduct } from './product';

export interface IPurchase extends Document {
    provider: Types.ObjectId;
    products: { product: Types.ObjectId; quantity: number }[];
    company: ICompany['_id'];
}

const purchaseSchema = new Schema<IPurchase>({
    provider: { type: Schema.Types.ObjectId, required: true },
    products: [
        {
            product: { type: Schema.Types.ObjectId, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
});

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
