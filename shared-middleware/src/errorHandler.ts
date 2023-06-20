import { Request, Response, NextFunction } from 'express';
import HttpError from './httpError';

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction): void => {
    if (err) {
        console.error(err.message);

        if (!err.status) {
            err.status = 500;
        }

        res.status(err.status).json({
            message: err.message,
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    } else {
        next();
    }
};
