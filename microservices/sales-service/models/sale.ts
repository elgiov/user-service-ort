import { Schema, model, Document } from 'mongoose';

export interface IProductSale extends Document {
    productId: string; 
    quantity: number;
    unitPrice: number;
    product?: any;
}

export interface ISale extends Document {
    companyId: string; 
    products: IProductSale[];
    total: number;
    date: Date;
    client: string;
}

export const ProductSaleSchema = new Schema<IProductSale>(
    {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        product: { type: Object }
    }
);

const SaleSchema = new Schema<ISale>(
    {
        companyId: { type: String, required: true },
        products: [ProductSaleSchema],
        total: { type: Number, required: true },
        date: { type: Date, required: true },
        client: {type: String, required: true}
    },
    {
        timestamps: true
    }
);

export const Sale = model<ISale>('Sale', SaleSchema);
