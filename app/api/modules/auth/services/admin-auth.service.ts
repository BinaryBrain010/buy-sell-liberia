import { Admin } from '../models/admin.model';
import { AdminRole } from '../models/admin.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

const ADMIN_SUPER_EMAIL = process.env.ADMIN_SUPER_EMAIL;
const ADMIN_SUPER_PASSWORD = process.env.ADMIN_SUPER_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'changemerefresh';

export class AdminAuthService {
    static async login(email: string, password: string) {
        // Check if super admin
        if (email === ADMIN_SUPER_EMAIL) {
            if (password !== ADMIN_SUPER_PASSWORD) {
                throw new Error('Invalid credentials');
            }
            return {
                admin: {
                    email,
                    name: 'BinaryBrains',
                    role: 'super_admin',
                },
                ...this.generateTokens({ email, role: 'super_admin', name: 'BinaryBrains' }),
            };
        }
        // Check DB for other admins
        const admin = await Admin.findOne({ email });
        if (!admin) throw new Error('Admin not found');
        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) throw new Error('Invalid credentials');
        return {
            admin: {
                email: admin.email,
                name: admin.name,
                role: admin.role,
            },
            ...this.generateTokens({ email: admin.email, role: admin.role, name: admin.name }),
        };
    }

    static generateTokens(payload: any) {
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '60m' });
        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    static refreshAccessToken(refreshToken: string) {
        try {
            const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
            const accessToken = jwt.sign(payload as any, JWT_SECRET, { expiresIn: '15m' });
            return { accessToken };
        } catch (e) {
            throw new Error('Invalid refresh token');
        }
    }

    static verifyAccessToken(token: string) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch {
            return null;
        }
    }

    static authorize(roles: string[] = []) {
        return (req: Request, res: Response, next: NextFunction) => {
            const authHeader = req.headers['authorization'];
            if (!authHeader) return res.status(401).json({ error: 'No token' });
            const token = authHeader.split(' ')[1];
            try {
                const payload = jwt.verify(token, JWT_SECRET);
                if (
                    typeof payload !== 'object' ||
                    payload === null ||
                    !('email' in payload) ||
                    !('name' in payload) ||
                    !('role' in payload)
                ) {
                    return res.status(401).json({ error: 'Invalid token' });
                }
                req.admin = payload as { email: string; name: string; role: AdminRole;[key: string]: any };
                next();
            } catch (e) {
                return res.status(401).json({ error: 'Invalid token' });
            }
        };
    }
}
