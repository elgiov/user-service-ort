import { Schema, model, Document } from 'mongoose';
import { IProduct } from './product';
import { ICompany } from './company';

export interface ISale extends Document {
    company: ICompany['_id'];
    products: {
        product: IProduct['_id'];
        quantity: number;
        unitPrice: number;
    }[];
    total: number;
    date: Date;
}

const SaleSchema = new Schema<ISale>(
    {
        company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
        products: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                unitPrice: { type: Number, required: true }
            }
        ],
        total: { type: Number, required: true },
        date: { type: Date, required: true }
    },
    {
        timestamps: true
    }
);

export const Sale = model<ISale>('Sale', SaleSchema);
