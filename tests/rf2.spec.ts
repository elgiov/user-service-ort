//@ts-nocheck
import { Response, NextFunction } from 'express';
import { ICompany } from '../src/models/company';
import { Invite } from '../src/models/invite';
import { CustomRequest } from '../src/types';
import HttpError from '../src/errors/httpError';
import InvitationController from '../src/controllers/inviteController';
import * as emailService from '../src/services/emailService';

const mockResponse: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
};

const mockNext: NextFunction = jest.fn();

afterEach(() => {
    jest.clearAllMocks();
});

it('should send an invitation successfully', async () => {
    const mockCompany: ICompany = { name: 'Mock Company' };
    const mockRequest: CustomRequest<any> = {
        user: { company: mockCompany },
        body: { email: 'test@example.com', role: 'admin' }
    };

    jest.spyOn(Invite.prototype, 'save').mockResolvedValue(undefined);
    jest.spyOn(emailService, 'sendInvitationEmail').mockResolvedValue(undefined);

    await InvitationController.sendInvitation(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invitation sent successfully' });
});

it('should handle errors in sendInvitation', async () => {
    const mockCompany: ICompany = { name: 'Mock Company' };
    const mockRequest: CustomRequest<any> = {
        user: { company: mockCompany },
        body: { email: 'test@example.com', role: 'admin' }
    };

    const mockError = new Error('Mock error in sendInvitation');
    jest.spyOn(Invite.prototype, 'save').mockRejectedValue(mockError);

    await InvitationController.sendInvitation(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
    expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
            status: 500,
            message: mockError.message
        })
    );
});

it('should get invitation data successfully', async () => {
    const mockCompany: ICompany = { name: 'Mock Company' };
    const mockInvite = new Invite({
        company: mockCompany,
        token: 'mockToken',
        role: 'admin',
        email: 'test@example.com'
    });

    const mockRequest: CustomRequest<any> = {
        params: { token: 'mockToken' }
    };

    jest.spyOn(Invite, 'findOne').mockResolvedValue(mockInvite);

    await InvitationController.getInvitationData(mockRequest, mockResponse, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith({
        companyName: mockInvite.company.name,
        email: mockInvite.email,
        role: mockInvite.role
    });
});

it('should handle errors in getInvitationData', async () => {
    const mockRequest: CustomRequest<any> = {
        params: { token: 'mockToken' }
    };

    const mockError = new Error('Mock error in getInvitationData');
    jest.spyOn(Invite, 'findOne').mockRejectedValue(mockError);

    await InvitationController.getInvitationData(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
    expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
            status: 500,
            message: mockError.message
        })
    );
});
