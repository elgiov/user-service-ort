import { Document } from 'mongoose';
import { Request } from 'express';

export enum UserRole {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE'
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    company: string;
    role: UserRole;
}

export interface RegisterAdminRequest {
    name: string;
    email: string;
    password: string;
    company: string;
}

export interface RegisterEmployeeRequest {
    name: string;
    email: string;
    password: string;
    company: string;
}

export interface CreateUserResponse {
    name: string;
    email: string;
    company: string;
    role: UserRole;
    _id?: string;
    message?: string; // extra property
}

export interface CustomRequest<T> extends Request {
    user: IUser;
    body: T;
}
