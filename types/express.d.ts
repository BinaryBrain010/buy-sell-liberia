import { AdminRole } from '../app/api/modules/auth/models/admin.model';

declare global {
  namespace Express {
    interface Request {
      admin?: {
        email: string;
        name: string;
        role: AdminRole;
        [key: string]: any;
      };
    }
  }
}

export {};
