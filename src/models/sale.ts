import { Schema, model, Document } from 'mongoose';
import { IProduct } from './product';

export interface ISale extends Document {
    company: string;
    amount: number;
    products: {
        productId: IProduct['_id'];
        quantity: number;
        unitPrice: number;
    }[];
}

const SaleSchema = new Schema<ISale>(
    {
        company: { type: String, required: true },
        amount: { type: Number, required: true },
        products: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                unitPrice: { type: Number, required: true }
            }
        ]
    },
    {
        timestamps: true
    }
);

export const Sale = model<ISale>('Sale', SaleSchema);
