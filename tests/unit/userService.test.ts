import { User, UserRole } from '../../src/models/user';
import { createUser, getUserById } from '../../src/services/userService';

jest.mock('../../src/services/userService', () => ({
    createUser: jest.fn(),
    getUserById: jest.fn()
}));

describe('createUser', () => {
    it('should create a new user', async () => {
        const userData = {
            name: 'John Doe',
            email: 'johndoe155@example.com',
            password: 'password',
            companyName: 'Acme Inc',
            role: UserRole.EMPLOYEE
        };

        const newUser = {
            _id: 'someId',
            ...userData
        };

        (createUser as jest.Mock).mockResolvedValue(newUser);

        const result = await createUser(userData);

        expect(result).toEqual(newUser);
        expect(createUser).toHaveBeenCalledWith(userData);
    });
});

describe('getUserById', () => {
    it('should return the correct user', async () => {
        const userData = {
            name: 'John Doe',
            email: 'johndoe167@example.com',
            password: 'password',
            companyName: 'Example Inc',
            role: UserRole.EMPLOYEE
        };

        const newUser = new User(userData);
        const userId = newUser._id;

        (getUserById as jest.Mock).mockResolvedValue(newUser);

        const result = await getUserById(userId);

        expect(result).toEqual(newUser);
        expect(getUserById).toHaveBeenCalledWith(userId);
    });
});
