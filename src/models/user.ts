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
    company: string;
    role: UserRole;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    company: string;
    role: UserRole;
}

const isEmailValid = (email: string): boolean => validator.isEmail(email);

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
};

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: [isEmailValid, 'Invalid email']
        },
        password: { type: String, required: true },
        company: { type: String, required: true },
        role: { type: String, required: true, enum: Object.values(UserRole) }
    },
    { timestamps: true }
);

userSchema.pre('save', async function (this: IUser, next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await hashPassword(this.password);
    next();
});

export const User = model<IUser>('User', userSchema);
