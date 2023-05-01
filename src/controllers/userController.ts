import { Request, Response, NextFunction } from 'express';
import { createUser, getUserByEmail } from '../services/userService';
import { UserRole, hashPassword } from '../models/user';
import { createCompany, getCompanyByName } from '../services/companyService';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import env from 'dotenv';
import HttpError from '../errors/httpError';
import bcrypt from 'bcrypt';

env.config();

class UserController {
    async registerAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, email, password, company, address, token } = req.body;
            const existingCompany = await getCompanyByName(company);

            if (existingCompany) {
                next(new HttpError(409, 'Company with this name already exists'));
                return;
            }

            const newCompany = await createCompany(company, address);
            const newUser = await createUser({ name, email, password, company: newCompany._id, role: UserRole.ADMIN, token });
            res.status(201).json({ user: newUser, company: newCompany });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async registerEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, email, password, company, token } = req.body;
            const newUser = await createUser({ name, email, password, company, role: UserRole.EMPLOYEE, token });
            res.status(201).json(newUser);
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const email = req.body?.email;
        const password = req.body?.password;
        if (!email) {
            next(new HttpError(400, 'Email, parameter required.'));
            return;
        }
        if (!password) {
            next(new HttpError(400, 'Password, parameter required.'));
            return;
        }

        try {
            const user = await getUserByEmail(email);
            let comparedPassword = await bcrypt.compare(password, user?.password!);
            if (!user || !comparedPassword) {
                next(new HttpError(401, 'Email or password incorrect.'));
                return;
            }
            const privateKey = readFileSync(process.env.JWT_PRIVATE_KEY_PATH!);
            const role = user?.role;
            const name = user?.name;
            const company = user?.company;
            const tokenPayload = { email, role, name, company };
            const token = jwt.sign(tokenPayload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
            res.status(200).json({ userToken: token });
        } catch (error: any) {
            next(new HttpError(500, error.message));
        }
    }
}

export default new UserController();
