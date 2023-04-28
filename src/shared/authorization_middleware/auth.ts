import fs from "fs"
import jwt from "jsonwebtoken"
import jwt_decode from "jwt-decode"
import { Request, Response, NextFunction } from 'express';
import { CustomRequest } from "../../types";

export interface DecodedToken {
    role: string;
    email: string, 
    name: string, 
    company: string
}

const verifyToken = (req: CustomRequest<any>, res: Response, next: NextFunction) => {
    const authorization = req.header("Authorization");
    const token = authorization ? authorization.replace("Bearer ", "") : null;

    if (!token) {
        return res.status(403).json({message: 'Authentication require token'});
    }
    if (!process.env.JWT_PUBLIC_KEY_PATH) {
        throw new Error('Public key not set')
    }
    try {
        const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);
        const decoded = jwt.verify(token, publicKey,{algorithms: ['RS256']});
        req.user = decoded;
    } catch (error) {
        return res.status(500).json({message: 'Invalid authentication token', error});
    }
    return next();
};

const authRolePermissions = (permissions: string | any[]) => {
    return (req: CustomRequest<any>, res: Response, next: NextFunction) => {
        const authorization = req.header("Authorization");
        const token = authorization ? authorization.replace("Bearer ", "") : null;
        var decoded : DecodedToken = jwt_decode(token!);
        const userRole = decoded.role;
        if (permissions.length == 0 || permissions.includes(userRole)) {
            next();
        } else {
            return res.status(401).json({message: 'Invalid permission'});
        }
    }
};

export default {
    verifyToken,
    authRolePermissions
}
