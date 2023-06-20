import { Schema, model, Document } from 'mongoose';
import { ICompany } from './company';

export interface IProduct extends Document {
    name: string;
    description: string;
    image: string;
    price: number;
    quantity: number;
    company: ICompany['_id'];
    deleted: boolean;
}

export interface ProductDocument extends IProduct {}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        deleted: { type: Boolean, default: false },
        company: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
    },
    {
        timestamps: true
    }
);

productSchema.index({ name: 1, company: 1 }, { unique: true });

export const Product = model<ProductDocument>('Product', productSchema);
