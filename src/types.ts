import { Document } from 'mongoose';

export enum UserRole {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE'
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    companyName: string;
    role: UserRole;
}

export interface RegisterAdminRequest {
    name: string;
    email: string;
    password: string;
    companyName: string;
}

export interface RegisterEmployeeRequest {
    name: string;
    email: string;
    password: string;
    companyName: string;
}

export interface CreateUserResponse {
    name: string;
    email: string;
    companyName: string;
    role: UserRole;
    _id?: string;
    message?: string; // extra property
}
