import { Request, Response } from 'express';
import { createUser, getUserByEmail } from '../services/userService';
import { UserRole } from '../models/user';
import { readFileSync } from "fs";
import jwt from 'jsonwebtoken';
import env from 'dotenv';
env.config();

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

   login = async (req: Request, res: Response) => {
    const email = req.body?.email;
    const password = req.body?.password;
    if (!email) {
      res.status(400).json({message: ' Email, parameter required.'});
    }
    if (!password) {
      res.status(400).json({message: 'Password, parameter required.'});
    }

    try {
      const user = await getUserByEmail(email);
      if (!user || user.password !== password) {
        res.status(401).json({message: 'Email or password incorrect.'});
      }
      const privateKey = readFileSync(process.env.JWT_PRIVATE_KEY_PATH!);
      const role = user?.role;
      const name = user?.name;
      const tokenPayload = {email, role, name};
      const token = jwt.sign(tokenPayload, privateKey, {algorithm: 'RS256',expiresIn: "1h"});
      res.status(200).json({userToken: token});
    } catch (error) {
      res.status(500).json({message: 'Error obtaining user.', error});
    }
  }


}

export default new UserController();
