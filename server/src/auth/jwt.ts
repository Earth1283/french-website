import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export type Role = 'teacher' | 'student';

export interface TokenPayload {
  sub: string;
  role: Role;
  tokenVersion: number;
}

const EXPIRES_IN = '30d';

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}
