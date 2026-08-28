import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireStudent, requireTeacher } from '../auth/middleware.js';
import { hashPassword, verifyPassword } from '../auth/hash.js';
import { signToken, verifyToken } from '../auth/jwt.js';
import { config } from '../config.js';
import { generateRecoveryCode } from '../lib/recoveryCode.js';
import {
  countTeachers,
  createTeacher,
  getTeacherByEmail,
  getTeacherById,
  updateTeacherPassword,
  updateTeacherRecoveryCodeHash,
} from '../db/queries/teachers.js';
import {
  createStudent,
  getStudentByEmail,
  getStudentById,
  updateStudentPassword,
  updateStudentRecoveryCodeHash,
} from '../db/queries/students.js';
import {
  changePasswordSchema,
  loginSchema,
  resetWithRecoveryCodeSchema,
  studentRegisterSchema,
  teacherRegisterSchema,
} from '../lib/validation.js';

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

  const recoveryCode = generateRecoveryCode();
  let teacher;
  try {
    teacher = createTeacher(name, email, hashPassword(password), hashPassword(recoveryCode));
  } catch {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }
  const token = signToken({ sub: teacher.id, role: 'teacher', tokenVersion: teacher.token_version });
  res
    .status(201)
    .json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email }, recoveryCode });
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
  const recoveryCode = generateRecoveryCode();
  let student;
  try {
    student = createStudent(name, email, hashPassword(password), hashPassword(recoveryCode));
  } catch {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }
  const token = signToken({ sub: student.id, role: 'student', tokenVersion: student.token_version });
  res
    .status(201)
    .json({ token, student: { id: student.id, name: student.name, email: student.email }, recoveryCode });
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

// Recovery codes are single-use: a successful reset immediately issues a
// replacement so an intercepted code can't be reused, and stops the account
// being permanently unrecoverable after one reset.
authRouter.post('/teacher/reset-with-recovery-code', (req, res) => {
  const parsed = resetWithRecoveryCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const teacher = getTeacherByEmail(parsed.data.email);
  if (!teacher?.recovery_code_hash || !verifyPassword(parsed.data.recoveryCode, teacher.recovery_code_hash)) {
    res.status(401).json({ error: 'Invalid email or recovery code' });
    return;
  }
  updateTeacherPassword(teacher.id, hashPassword(parsed.data.newPassword));
  const recoveryCode = generateRecoveryCode();
  updateTeacherRecoveryCodeHash(teacher.id, hashPassword(recoveryCode));
  const updated = getTeacherById(teacher.id)!;
  const token = signToken({ sub: updated.id, role: 'teacher', tokenVersion: updated.token_version });
  res.json({ token, teacher: { id: updated.id, name: updated.name, email: updated.email }, recoveryCode });
});

authRouter.post('/student/reset-with-recovery-code', (req, res) => {
  const parsed = resetWithRecoveryCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const student = getStudentByEmail(parsed.data.email);
  if (!student?.recovery_code_hash || !verifyPassword(parsed.data.recoveryCode, student.recovery_code_hash)) {
    res.status(401).json({ error: 'Invalid email or recovery code' });
    return;
  }
  updateStudentPassword(student.id, hashPassword(parsed.data.newPassword));
  const recoveryCode = generateRecoveryCode();
  updateStudentRecoveryCodeHash(student.id, hashPassword(recoveryCode));
  const updated = getStudentById(student.id)!;
  const token = signToken({ sub: updated.id, role: 'student', tokenVersion: updated.token_version });
  res.json({ token, student: { id: updated.id, name: updated.name, email: updated.email }, recoveryCode });
});

authRouter.post('/teacher/regenerate-recovery-code', requireTeacher, (req, res) => {
  const recoveryCode = generateRecoveryCode();
  updateTeacherRecoveryCodeHash(req.teacherId!, hashPassword(recoveryCode));
  res.json({ recoveryCode });
});

authRouter.post('/student/regenerate-recovery-code', requireStudent, (req, res) => {
  const recoveryCode = generateRecoveryCode();
  updateStudentRecoveryCodeHash(req.studentId!, hashPassword(recoveryCode));
  res.json({ recoveryCode });
});

authRouter.post('/teacher/change-password', requireTeacher, (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const teacher = getTeacherById(req.teacherId!)!;
  if (!verifyPassword(parsed.data.currentPassword, teacher.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }
  updateTeacherPassword(teacher.id, hashPassword(parsed.data.newPassword));
  const updated = getTeacherById(teacher.id)!;
  const token = signToken({ sub: updated.id, role: 'teacher', tokenVersion: updated.token_version });
  res.json({ token });
});

authRouter.post('/student/change-password', requireStudent, (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const student = getStudentById(req.studentId!)!;
  if (!verifyPassword(parsed.data.currentPassword, student.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }
  updateStudentPassword(student.id, hashPassword(parsed.data.newPassword));
  const updated = getStudentById(student.id)!;
  const token = signToken({ sub: updated.id, role: 'student', tokenVersion: updated.token_version });
  res.json({ token });
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
