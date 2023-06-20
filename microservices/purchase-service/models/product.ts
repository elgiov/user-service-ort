import { Schema, model, Document } from 'mongoose';
import { ICompany } from './company';

export interface IProduct extends Document {
    name: string;
    description: string;
    image: string;
    price: number;
    quantity: number;
    company: string; // Now, we just need the ID of the company, it should be string type
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
        company: { type: String, required: true } // now this is a string, no longer a Schema.Types.ObjectId
    },
    {
        timestamps: true
    }
);

productSchema.index({ name: 1, company: 1 }, { unique: true });

export const Product = model<ProductDocument>('Product', productSchema);
