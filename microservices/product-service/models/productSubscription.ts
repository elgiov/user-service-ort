import { Schema, model, Document } from 'mongoose';

export interface IProductSubscription extends Document {
    adminId: string;
    productId: string;
}

const ProductSubscriptionSchema = new Schema<IProductSubscription>(
    {
        adminId: { type: String, required: true },
        productId: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

export const ProductSubscription = model<IProductSubscription>('ProductSubscription', ProductSubscriptionSchema);
