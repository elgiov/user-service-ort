// services/companyService.ts
import { Company, ICompany } from '../models/company';

export const createCompany = async (name: string, address: string): Promise<ICompany> => {
    try {
        const newCompany = new Company({ name, address });
        const company = await newCompany.save();
        return company;
    } catch (error) {
        throw new Error('Could not create company');
    }
};

export const getCompanyById = async (id: string): Promise<ICompany | null> => {
    try {
        const company = await Company.findById(id);
        return company;
    } catch (error) {
        throw new Error('Could not fetch company');
    }
};

export const getCompanies = async (): Promise<ICompany[]> => {
    try {
        const companies = await Company.find();
        return companies;
    } catch (error) {
        throw new Error('Could not fetch companies');
    }
};
