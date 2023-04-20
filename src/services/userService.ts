import { User, IUser, IUserInput } from '../models/user';

export const createUser = async ({ name, email, password, companyName, role }: IUserInput): Promise<IUser> => {
    try {
        console.log('Creating user');
        const newUser = new User({ name, email, password, companyName, role });
        console.log('User created in service');
        const user = await newUser.save();
        console.log('User saved in service');
        return user;
    } catch (error) {
        throw new Error('Could not create user');
    }
};

export const getUserById = async (id: string): Promise<IUser | null> => {
    const user = await User.findById(id);
    return user;
};
