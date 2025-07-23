import { Request } from 'express';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}
