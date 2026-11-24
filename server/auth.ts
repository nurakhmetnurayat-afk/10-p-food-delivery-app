import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { db, save } from './db.ts';
import type { AuthLocals, PublicUser, User } from './types.ts';

export type AuthResponse = Response<unknown, AuthLocals>;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function checkPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, 'hex'));
}

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
  save();
  return token;
}

export function publicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  return rest;
}

export function requireAuth(req: Request, res: AuthResponse, next: NextFunction): void {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = db.sessions.find((s) => s.token === token);
  const user = session && db.users.find((u) => u.id === session.userId);
  if (!user) {
    res.status(401).json({ error: 'Войдите в аккаунт' });
    return;
  }
  res.locals.user = user;
  res.locals.token = token;
  next();
}

export function requireChef(req: Request, res: AuthResponse, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (res.locals.user.role !== 'chef') {
      res.status(403).json({ error: 'Только для ресторанов' });
      return;
    }
    next();
  });
}
