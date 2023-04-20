import { User, UserRole } from '../../src/models/user';
import request from 'supertest';
import express from 'express';
import { createUser } from '../../src/services/userService';

jest.mock('../../src/services/userService', () => ({
    createUser: jest.fn()
}));

describe('POST /register/admin', () => {
    let app: express.Application;

    beforeAll(async () => {
        app = express();
        app.use(express.json());

        const router = express.Router();
        router.post('/register/admin', async (req, res) => {
            const user = await createUser(req.body);
            res.status(201).json(user);
        });

        app.use('/api/users', router);
    });

    it('should create a new admin user', async () => {
        const userData = {
            name: 'John Doe',
            email: 'johndoe12@example.com',
            password: 'password',
            companyName: 'Acme Inc',
            role: UserRole.ADMIN
        };

        const newUser = {
            _id: 'someId',
            ...userData
        };

        (createUser as jest.Mock).mockResolvedValue(newUser);

        const response = await request(app).post('/api/users/register/admin').send(userData);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(newUser);
    });

    afterAll(async () => {
        
    });
});
