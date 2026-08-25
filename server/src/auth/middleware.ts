import type { NextFunction, Request, Response } from 'express';
import { getStudentById } from '../db/queries/students.js';
import { getTeacherById } from '../db/queries/teachers.js';
import { verifyToken } from './jwt.js';

declare global {
  namespace Express {
    interface Request {
      teacherId?: string;
      studentId?: string;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

export function requireTeacher(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== 'teacher') {
    res.status(401).json({ error: 'Missing or invalid teacher credentials' });
    return;
  }
  const teacher = getTeacherById(payload.sub);
  if (!teacher || teacher.token_version !== payload.tokenVersion) {
    res.status(401).json({ error: 'Session expired, please log in again' });
    return;
  }
  req.teacherId = teacher.id;
  next();
}

export function requireStudent(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== 'student') {
    res.status(401).json({ error: 'Missing or invalid student credentials' });
    return;
  }
  const student = getStudentById(payload.sub);
  if (!student || student.token_version !== payload.tokenVersion) {
    res.status(401).json({ error: 'Session expired, please log in again' });
    return;
  }
  req.studentId = student.id;
  next();
}
