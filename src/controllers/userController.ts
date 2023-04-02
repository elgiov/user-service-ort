import { Request, Response } from 'express';
import { createUser } from '../services/userService';
import { UserRole } from '../models/user';

class UserController {
  async registerAdmin(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await createUser({ ...req.body, role: UserRole.ADMIN });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

  async registerEmployee(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await createUser({ ...req.body, role: UserRole.EMPLOYEE });
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

}

export default new UserController();
