import { Request, Response, NextFunction } from 'express';
import { createUser, getUserByEmail } from '../services/userService';
import { UserRole, hashPassword } from '../models/user';
import { createCompany, getCompanyByName } from '../services/companyService';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import env from 'dotenv';
import HttpError from '../errors/httpError';
import bcrypt from 'bcrypt';
import { logger } from '../config/logger';
import { CustomRequest } from '../types';

env.config();

class UserController {
    async registerAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, email, password, company, address, token } = req.body;
            const existingCompany = await getCompanyByName(company);

            if (token) {
                // If token is present it is an invitation (should not create a new company)
                if (!existingCompany) {
                    logger.error(`Error in registerAdmin: Company not found`);
                    next(new HttpError(404, 'Company not found'));
                    return;
                }

                const newUser = await createUser({ name, email, password, company: existingCompany._id, role: UserRole.ADMIN, token });
                res.status(201).json({ user: newUser, company: existingCompany });
            } else {
                // If token is not present it is not an invitation (should create a new company)
                if (existingCompany) {
                    logger.error(`Error in registerAdmin: Company with name: ${existingCompany.name} already exists`);
                    next(new HttpError(409, `Company with name: ${existingCompany.name} already exists`, { type: 'company_exists' }));
                    return;
                }
                const userAlreadyExists = await getUserByEmail(email);
                if (userAlreadyExists) {
                    logger.error(`Error in registerAdmin: User with email: ${email} already exists`);
                    next(new HttpError(409, `User with email: ${email} already exists`, { type: 'user_exists' }));
                    return;
                }
                const newCompany = await createCompany(company, address);
                const newUser = await createUser({ name, email, password, company: newCompany._id, role: UserRole.ADMIN });
                res.status(201).json({ user: newUser, company: newCompany });
                logger.info(`New company created: ${newCompany.name}`);
            }
        } catch (error: any) {
            logger.error(`Error in registerAdmin: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async registerEmployee(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, email, password, company, token } = req.body;
            const userAlreadyExists = await getUserByEmail(email);
            if (userAlreadyExists) {
                logger.error(`Error in registerEmployee: User with email: ${email} already exists`);
                next(new HttpError(409, `User with email: ${email} already exists`, { type: 'user_exists' }));
                return;
            }
            const newUser = await createUser({ name, email, password, company, role: UserRole.EMPLOYEE, token });
            res.status(201).json(newUser);
            logger.info(`New employee created: ${newUser.name}`);
        } catch (error: any) {
            logger.error(`Error in registerEmployee: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    async infoUser(req: CustomRequest<any>, res: Response, next: NextFunction): Promise<void> {
        try {
            const userInfo = req.user;
            res.status(201).json(userInfo);
            logger.info(`GET info user ${userInfo.name}`);
        } catch (error: any) {
            logger.error(`Error in infoUser: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }

    registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { company, role } = req.body;
            if (!company) {
                logger.error(`Error in registerUser: Company name is required`);
                next(new HttpError(400, 'Company name is required'));
                return;
            }
            if (role === UserRole.ADMIN || !role) {
                await this.registerAdmin(req, res, next);
            } else if (role === UserRole.EMPLOYEE) {
                await this.registerEmployee(req, res, next);
            } else {
                logger.error(`Error in registerUser: Invalid role`);
                next(new HttpError(400, 'Invalid role in the token'));
            }
        } catch (error: any) {
            logger.error(`Error in registerUser: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    };

    async login(req: Request, res: Response, next: NextFunction) {
        const email = req.body?.email;
        const password = req.body?.password;
        if (!email) {
            logger.error(`Error in login: Email, parameter required.`);
            next(new HttpError(400, 'Email, parameter required.'));
            return;
        }
        if (!password) {
            logger.error(`Error in login: Password, parameter required.`);
            next(new HttpError(400, 'Password, parameter required.'));
            return;
        }

        try {
            const user = await getUserByEmail(email);
            let comparedPassword = await bcrypt.compare(password, user?.password!);
            if (!user || !comparedPassword) {
                logger.error(`Error in login: Email or password incorrect.`);
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
            logger.info(`User logged in: ${user?.name}`);
        } catch (error: any) {
            logger.error(`Error in login: ${error.message}`);
            next(new HttpError(500, error.message));
        }
    }
}

export default new UserController();
