// controllers/companyController.ts
import { Request, Response, NextFunction } from 'express';
import { createCompany, getCompanies, getCompanyById } from '../services/companyService';
import HttpError from '../errors/httpError';
import logger from '../config/logger';

class CompanyController {
    async createCompany(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, address } = req.body;
            const newCompany = await createCompany(name, address);
            res.status(201).json(newCompany);
            logger.info(`New company created: ${newCompany.name}`);
        } catch (error: any) {
            logger.error(`Error in createCompany: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getCompanyById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const company = await getCompanyById(id);
            res.status(200).json(company);
            logger.info(`Company with id: ${id} found`);
        } catch (error: any) {
            logger.error(`Error in getCompanyById: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async getCompanies(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const companies = await getCompanies();
            res.status(200).json(companies);
            logger.info(`All companies found`);
        } catch (error: any) {
            logger.error(`Error in getCompanies: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }
}

export default new CompanyController();
