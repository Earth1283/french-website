import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { hashPassword, verifyPassword } from '../auth/hash.js';
import { signToken, verifyToken } from '../auth/jwt.js';
import { config } from '../config.js';
import { countTeachers, createTeacher, getTeacherByEmail, getTeacherById } from '../db/queries/teachers.js';
import { createStudent, getStudentByEmail, getStudentById } from '../db/queries/students.js';
import { loginSchema, studentRegisterSchema, teacherRegisterSchema } from '../lib/validation.js';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: config.authRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
});
authRouter.use(authLimiter);

authRouter.post('/teacher/register', (req, res) => {
  const parsed = teacherRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, email, password, signupCode } = parsed.data;

  const isFirstTeacher = countTeachers() === 0;
  if (!isFirstTeacher) {
    if (!config.teacherSignupCode || signupCode !== config.teacherSignupCode) {
      res.status(403).json({ error: 'Teacher signup requires an invite code on this server' });
      return;
    }
  }

  if (getTeacherByEmail(email)) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  let teacher;
  try {
    teacher = createTeacher(name, email, hashPassword(password));
  } catch {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }
  const token = signToken({ sub: teacher.id, role: 'teacher', tokenVersion: teacher.token_version });
  res.status(201).json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email } });
});

authRouter.post('/teacher/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const teacher = getTeacherByEmail(parsed.data.email);
  if (!teacher || !verifyPassword(parsed.data.password, teacher.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const token = signToken({ sub: teacher.id, role: 'teacher', tokenVersion: teacher.token_version });
  res.json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email } });
});

authRouter.post('/student/register', (req, res) => {
  const parsed = studentRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, email, password } = parsed.data;
  if (getStudentByEmail(email)) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }
  let student;
  try {
    student = createStudent(name, email, hashPassword(password));
  } catch {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }
  const token = signToken({ sub: student.id, role: 'student', tokenVersion: student.token_version });
  res.status(201).json({ token, student: { id: student.id, name: student.name, email: student.email } });
});

authRouter.post('/student/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const student = getStudentByEmail(parsed.data.email);
  if (!student || !verifyPassword(parsed.data.password, student.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const token = signToken({ sub: student.id, role: 'student', tokenVersion: student.token_version });
  res.json({ token, student: { id: student.id, name: student.name, email: student.email } });
});

authRouter.get('/me', (req, res) => {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  if (payload.role === 'teacher') {
    const teacher = getTeacherById(payload.sub);
    if (!teacher || teacher.token_version !== payload.tokenVersion) {
      res.status(401).json({ error: 'Session expired, please log in again' });
      return;
    }
    res.json({ role: 'teacher', id: teacher.id, name: teacher.name, email: teacher.email });
    return;
  }

  const student = getStudentById(payload.sub);
  if (!student || student.token_version !== payload.tokenVersion) {
    res.status(401).json({ error: 'Session expired, please log in again' });
    return;
  }
  res.json({ role: 'student', id: student.id, name: student.name, email: student.email });
});
