import { Schema, model, Document } from 'mongoose';
import { IProduct } from './product';

interface IPurchaseProduct {
    product: IProduct['_id'];
    quantity: number;
}

export interface IPurchase extends Document {
    date: Date;
    provider: string;
    products: IPurchaseProduct[];
    total: number;
}

const purchaseProductSchema = new Schema<IPurchaseProduct>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
});

const purchaseSchema = new Schema<IPurchase>({
    date: { type: Date, required: true },
    provider: { type: String, required: true },
    products: { type: [purchaseProductSchema], required: true },
    total: { type: Number, required: true }
});

export const Purchase = model<IPurchase>('Purchase', purchaseSchema);
