import { Schema, model, Document } from 'mongoose';
import { ICompany } from './company';
import { UserRole } from './user';

export interface IInvite extends Document {
    company: ICompany['_id'];
    token: string;
    role: UserRole;
    email: string;
}

const invitationSchema = new Schema<IInvite>({
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    token: { type: String, required: true },
    role: { type: String, required: true, enum: ['ADMIN', 'EMPLOYEE'] },
    email: { type: String, required: true }
});

export const Invite = model<IInvite>('Invitation', invitationSchema);
