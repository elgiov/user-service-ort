import { User, IUser, IUserInput } from '../models/user';

export const createUser = async ({ name, email, password, company, role }: IUserInput): Promise<IUser> => {
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const newUser = new User({ name, email, password, company, role });
        const user = await newUser.save();
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
