import { Schema, model, Document } from 'mongoose';

export interface ICompany extends Document {
    name: string;
    address: string;
}

export interface CompanyDocument extends ICompany {}

const companySchema = new Schema<ICompany>(
    {
        name: { type: String, required: true, unique: true },
        address: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

export const Company = model<CompanyDocument>('Company', companySchema);
