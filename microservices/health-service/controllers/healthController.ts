import { Request, Response, NextFunction } from 'express';
import env from 'dotenv';
import HttpError from '../../../shared-middleware/src/httpError';
import { CustomRequest } from '../types';
import { healthCheckLogger } from '../config/logger';
import { checkDatabaseConnection } from '../db';
env.config();
class HealthController {
    async getDatabaseStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        const isDatabaseConnected = await checkDatabaseConnection();

        if (isDatabaseConnected) {
            healthCheckLogger.info('Database connected');
            res.status(200).json({ status: 'OK', database: 'connected' });
        } else {
            healthCheckLogger.error('Database disconnected');
            res.status(500).json({ status: 'ERROR', database: 'disconnected' });
        }
    }
}

export default new HealthController();
