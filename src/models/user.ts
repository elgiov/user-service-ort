import { Schema, model, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

export enum UserRole {
    ADMIN = 'ADMIN',
    EMPLOYEE = 'EMPLOYEE'
}

export interface IUserInput extends Omit<Document, keyof Document> {
    name: string;
    email: string;
    password: string;
    companyName: string;
    role: UserRole;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    companyName: string;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: [validator.isEmail, 'Invalid email']
        },
        password: { type: String, required: true },
        companyName: { type: String, required: true },
        role: { type: String, required: true, enum: Object.values(UserRole) }
    },
    { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export const User = model<IUser>('User', userSchema);
