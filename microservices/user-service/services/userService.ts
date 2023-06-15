import { User, IUser, IUserInput } from '../models/user';

// userService.ts
import { IInvite, Invite } from '../models/invite';

export const createUser = async ({ name, email, password, company, role, token }: IUserInput & { token?: string }): Promise<IUser> => {
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        let invite: IInvite | null = null;
        if (token) {
            invite = await Invite.findOne({ token });
            if (!invite) {
                throw new Error('Invalid invitation token');
            }
            role = invite.role;
            company = invite.company;
        }
        else{
        //TRAERME LA COMPANY SI NO ES ID SOLO SI ES NOMBRE
        }
        const newUser = new User({ name, email, password, company, role });
        const user = await newUser.save();

        if (invite) {
            await Invite.deleteOne({ _id: invite._id });
        }

        return user;
    } catch (error: any) {
        throw new Error(`Could not create user: ${error.message}`);
    }
};

export const getUserById = async (id: string): Promise<IUser | null> => {
    const user = await User.findById(id);
    return user;
};

export const getUserByEmail = async (email: string) => {
    const user = await User.findOne({ email });
    return user;
};
