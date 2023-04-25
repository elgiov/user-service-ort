import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    image: string;
    price: number;
    quantity: number;
    deleted: boolean;
}

export interface ProductDocument extends IProduct {}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    deleted: { type: Boolean, default: false }
});

export const Product = model<ProductDocument>('Product', productSchema);
