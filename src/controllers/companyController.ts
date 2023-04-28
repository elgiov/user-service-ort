// controllers/companyController.ts
import { Request, Response, NextFunction } from 'express';
import { createCompany, getCompanies, getCompanyById } from '../services/companyService';
import HttpError from '../errors/httpError';

class CompanyController {
    async createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, address } = req.body;
            const newCompany = await createCompany(name, address);
            res.status(201).json(newCompany);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getCompanyById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const company = await getCompanyById(id);
            res.status(200).json(company);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async getCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const companies = await getCompanies();
            res.status(200).json(companies);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new CompanyController();
