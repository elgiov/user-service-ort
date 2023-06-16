import { Schema, model, Document } from 'mongoose';
import { IProductSale, ProductSaleSchema } from '../models/sale';

export interface IScheduledSale extends Document {
    companyId: string;
    products: IProductSale[];
    total: number;
    date: Date;
    client: string;
    scheduledDate: Date;
    adminId: string;
}

const ScheduledSaleSchema = new Schema<IScheduledSale>(
    {
        companyId: { type: String, required: true },
        products: [ProductSaleSchema],
        total: { type: Number, required: true },
        date: { type: Date, required: true },
        client: { type: String, required: true },
        scheduledDate: { type: Date, required: true },
        adminId: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

export const ScheduledSale = model<IScheduledSale>('ScheduledSale', ScheduledSaleSchema);
