import { CustomRequest } from '../src/types';
import { Response } from 'express';

export const createMockRequest = (body?: any, company?: string): CustomRequest<any> => {
    return {
        body,
        user: {
            company
        }
    } as CustomRequest<any>;
};

export const createMockResponse = (): Response => {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;
};
