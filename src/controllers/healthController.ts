import { Request, Response, NextFunction } from 'express';
import env from 'dotenv';
import HttpError from '../errors/httpError';
import { CustomRequest } from '../types';
import { logger } from '../config/logger';
import { checkDatabaseConnection } from '../db';
env.config();
class HealthController {
    async getDatabaseStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        const isDatabaseConnected = await checkDatabaseConnection();

        if (isDatabaseConnected) {
            logger.info('Database connected');
            res.status(200).json({ status: 'OK', database: 'connected' });
        } else {
            logger.error('Database disconnected');
            res.status(500).json({ status: 'ERROR', database: 'disconnected' });
        }
    }
}

export default new HealthController();
