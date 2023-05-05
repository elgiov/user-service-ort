//@ts-nocheck
import { createMockRequest, createMockResponse } from './setup';
import { mockProvider1Data, mockCompany1Data } from './mocks';
import providerController from '../src/controllers/providerController';
import { CustomRequest } from '../src/types';
import * as providerService from '../src/services/providerService';
import { Response, NextFunction } from 'express';
import HttpError from '../src/errors/httpError';

describe('Provider Controller', () => {
    let mockRequestAddProvider: CustomRequest<any>;
    let mockResponse: Response;
    let mockNext: NextFunction;
    let createProviderSpy: jest.SpyInstance;
    let getProvidersSpy: jest.SpyInstance;
    let deleteProviderSpy = jest.spyOn(providerService, 'deleteProvider');

    beforeEach(() => {
        mockRequestAddProvider = createMockRequest(mockProvider1Data, mockCompany1Data.id);
        updateProviderSpy = jest.spyOn(providerService, 'updateProvider');
        mockResponse = createMockResponse();
        mockNext = jest.fn();
        createProviderSpy = jest.spyOn(providerService, 'createProvider');
        getProvidersSpy = jest.spyOn(providerService, 'getProviders');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add a provider', async () => {
        createProviderSpy.mockResolvedValue({});

        await providerController.addProvider(mockRequestAddProvider, mockResponse, mockNext);

        expect(createProviderSpy).toHaveBeenCalledWith({ ...mockRequestAddProvider.body }, mockRequestAddProvider.user.company);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Provider added correctly' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should not add a provider when no company provided', async () => {
        mockRequestAddProvider.user.company = undefined;

        await providerController.addProvider(mockRequestAddProvider, mockResponse, mockNext);

        expect(createProviderSpy).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 400,
                message: 'No company provided'
            })
        );
    });

    it('should return an error when providerService.createProvider() throws an error', async () => {
        const mockRequest = createMockRequest(mockProvider1Data, mockCompany1Data.id);
        const mockError = new Error('Something went wrong');
        const nextSpy = jest.fn();
        createProviderSpy.mockRejectedValue(mockError);

        await providerController.addProvider(mockRequest, mockResponse, nextSpy);

        expect(createProviderSpy).toHaveBeenCalledWith({ ...mockRequest.body }, mockRequest.user.company);
        expect(nextSpy).toHaveBeenCalledWith(new HttpError(500, mockError.message));
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should update a provider successfully', async () => {
        const mockProviderId = 'provider1';
        const mockUpdateProviderData = {
            name: 'Updated Provider 1',
            address: '456 Updated St',
            email: 'updatedprovider1@test.com',
            phone: '555-555-5555'
        };

        const mockUpdatedProvider = {
            _id: mockProviderId,
            ...mockUpdateProviderData,
            company: 'test-company-id'
        };

        const updateProviderSpy = jest.spyOn(providerService, 'updateProvider');
        updateProviderSpy.mockResolvedValue(mockUpdatedProvider);

        const mockRequest = {
            params: { providerId: mockProviderId },
            body: mockUpdateProviderData
        } as unknown as Request;

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const mockNext = jest.fn() as NextFunction;

        await providerController.updateProvider(mockRequest, mockResponse, mockNext);

        expect(updateProviderSpy).toHaveBeenCalledWith(mockProviderId, mockUpdateProviderData);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Provider edited correctly',
            provider: mockUpdatedProvider
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should delete a provider successfully', async () => {
        const mockProviderId = 'provider1';
        const mockRequestDeleteProvider = {
            params: {
                providerId: mockProviderId
            }
        };

        const mockDeletedProvider = {
            _id: mockProviderId
        };
        deleteProviderSpy.mockResolvedValue(mockDeletedProvider);

        await providerController.deleteProvider(mockRequestDeleteProvider, mockResponse, mockNext);

        expect(deleteProviderSpy).toHaveBeenCalledWith(mockProviderId);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Provider deleted correctly' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should get providers', async () => {
        const mockProviders = [
            {
                _id: 'provider1',
                name: 'Provider 1',
                address: '123 Test St',
                email: 'provider1@test.com',
                phone: '123-456-7890',
                company: 'test-company-id'
            },
            {
                _id: 'provider2',
                name: 'Provider 2',
                address: '456 Test St',
                email: 'provider2@test.com',
                phone: '987-654-3210',
                company: 'test-company-id'
            }
        ];

        getProvidersSpy.mockResolvedValue(mockProviders);

        const req = {
            user: {
                company: 'test-company-id'
            }
        } as CustomRequest<any>;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const next = jest.fn();

        await providerController.getProviders(req, res, next);

        expect(getProvidersSpy).toHaveBeenCalledWith(req.user.company);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockProviders);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return an error when providerService.updateProvider() throws an error', async () => {
        const mockRequest: Request = {
            params: { providerId: 'mockProviderId' },
            body: {
                name: 'Updated Provider 1'
            }
        };

        jest.spyOn(providerService, 'updateProvider').mockImplementation(() => {
            throw new Error('Test error');
        });

        await providerController.updateProvider(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 500,
                message: 'Test error'
            })
        );
    });

    it('should return a 404 error when updatedProvider is not found', async () => {
        const mockRequest: Request = {
            params: { providerId: 'mockProviderId' },
            body: {
                /* updated provider data */
            }
        };

        jest.spyOn(providerService, 'updateProvider').mockResolvedValue(null);

        await providerController.updateProvider(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 404,
                message: `Provider with id "mockProviderId" not found`
            })
        );
    });

    it('should return a 404 error when deletedProvider is not found', async () => {
        const mockRequest: Request = {
            params: { providerId: 'mockProviderId' }
        };

        jest.spyOn(providerService, 'deleteProvider').mockResolvedValue(null);

        await providerController.deleteProvider(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 404,
                message: `Provider with id "mockProviderId" not found`
            })
        );
    });

    it('should handle errors in deleteProvider', async () => {
        const mockRequest: Request = {
            params: { providerId: 'mockProviderId' }
        };

        const mockError = new Error('Mock error in deleteProvider');
        jest.spyOn(providerService, 'deleteProvider').mockRejectedValue(mockError);

        await providerController.deleteProvider(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 500,
                message: mockError.message
            })
        );
    });

    it('should handle errors in getProviders', async () => {
        const mockRequest: CustomRequest<any> = {
            user: { company: 'mockCompany' }
        };

        const mockError = new Error('Mock error in getCompanyProviders');
        jest.spyOn(providerService, 'getProviders').mockRejectedValue(mockError);

        await providerController.getProviders(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 500,
                message: mockError.message
            })
        );
    });
});
