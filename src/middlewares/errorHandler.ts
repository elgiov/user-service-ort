// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import HttpError from '../errors/httpError';

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction): void => {
    if (err) {
        console.error(err.message);

        if (!err.statusCode) {
            err.statusCode = 500;
        }

        res.status(err.statusCode).json({
            message: err.message,
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    } else {
        next();
    }
};
