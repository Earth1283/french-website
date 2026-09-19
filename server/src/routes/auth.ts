import { Router } from 'express';
import { requireStudent, requireTeacher } from '../auth/middleware.js';
import { hashPassword, verifyPassword } from '../auth/hash.js';
import { signToken, verifyToken } from '../auth/jwt.js';
import { config } from '../config.js';
import { authLimiters } from './rateLimits.js';
import { generateRecoveryCode, hashRecoveryCode, verifyRecoveryCode } from '../lib/recoveryCode.js';
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
  regenerateRecoveryCodeSchema,
  resetWithRecoveryCodeSchema,
  studentRegisterSchema,
  teacherRegisterSchema,
} from '../lib/validation.js';

export const authRouter = Router();

authRouter.use(authLimiters);

function teacherSignupAllowed(signupCode: string | undefined): boolean {
  if (countTeachers() === 0) return true;
  return !!config.teacherSignupCode && signupCode === config.teacherSignupCode;
}

authRouter.post('/teacher/register', async (req, res) => {
  const parsed = teacherRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, email, password, signupCode } = parsed.data;

  if (!teacherSignupAllowed(signupCode)) {
    res.status(403).json({ error: 'Teacher signup requires an invite code on this server' });
    return;
  }

  if (getTeacherByEmail(email)) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const recoveryCode = generateRecoveryCode();
  const passwordHash = await hashPassword(password);

  // Hashing yields the event loop, so another signup can land in between —
  // re-check right before the insert, with nothing awaited in between, or two
  // concurrent first-time signups would both count as "the first teacher".
  if (!teacherSignupAllowed(signupCode)) {
    res.status(403).json({ error: 'Teacher signup requires an invite code on this server' });
    return;
  }
  let teacher;
  try {
    teacher = createTeacher(name, email, passwordHash, hashRecoveryCode(recoveryCode));
  } catch {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }
  const token = signToken({ sub: teacher.id, role: 'teacher', tokenVersion: teacher.token_version });
  res
    .status(201)
    .json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email }, recoveryCode });
});

authRouter.post('/teacher/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const teacher = getTeacherByEmail(parsed.data.email);
  if (!teacher || !await verifyPassword(parsed.data.password, teacher.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const token = signToken({ sub: teacher.id, role: 'teacher', tokenVersion: teacher.token_version });
  res.json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email } });
});

authRouter.post('/student/register', async (req, res) => {
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
    student = createStudent(name, email, await hashPassword(password), hashRecoveryCode(recoveryCode));
  } catch {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }
  const token = signToken({ sub: student.id, role: 'student', tokenVersion: student.token_version });
  res
    .status(201)
    .json({ token, student: { id: student.id, name: student.name, email: student.email }, recoveryCode });
});

authRouter.post('/student/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const student = getStudentByEmail(parsed.data.email);
  if (!student || !await verifyPassword(parsed.data.password, student.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }
  const token = signToken({ sub: student.id, role: 'student', tokenVersion: student.token_version });
  res.json({ token, student: { id: student.id, name: student.name, email: student.email } });
});

// Recovery codes are single-use: a successful reset immediately issues a
// replacement so an intercepted code can't be reused, and stops the account
// being permanently unrecoverable after one reset.
authRouter.post('/teacher/reset-with-recovery-code', async (req, res) => {
  const parsed = resetWithRecoveryCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const teacher = getTeacherByEmail(parsed.data.email);
  if (!teacher?.recovery_code_hash || !await verifyRecoveryCode(parsed.data.recoveryCode, teacher.recovery_code_hash)) {
    res.status(401).json({ error: 'Invalid email or recovery code' });
    return;
  }
  updateTeacherPassword(teacher.id, await hashPassword(parsed.data.newPassword));
  const recoveryCode = generateRecoveryCode();
  updateTeacherRecoveryCodeHash(teacher.id, hashRecoveryCode(recoveryCode));
  const updated = getTeacherById(teacher.id)!;
  const token = signToken({ sub: updated.id, role: 'teacher', tokenVersion: updated.token_version });
  res.json({ token, teacher: { id: updated.id, name: updated.name, email: updated.email }, recoveryCode });
});

authRouter.post('/student/reset-with-recovery-code', async (req, res) => {
  const parsed = resetWithRecoveryCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const student = getStudentByEmail(parsed.data.email);
  if (!student?.recovery_code_hash || !await verifyRecoveryCode(parsed.data.recoveryCode, student.recovery_code_hash)) {
    res.status(401).json({ error: 'Invalid email or recovery code' });
    return;
  }
  updateStudentPassword(student.id, await hashPassword(parsed.data.newPassword));
  const recoveryCode = generateRecoveryCode();
  updateStudentRecoveryCodeHash(student.id, hashRecoveryCode(recoveryCode));
  const updated = getStudentById(student.id)!;
  const token = signToken({ sub: updated.id, role: 'student', tokenVersion: updated.token_version });
  res.json({ token, student: { id: updated.id, name: updated.name, email: updated.email }, recoveryCode });
});

authRouter.post('/teacher/regenerate-recovery-code', requireTeacher, async (req, res) => {
  const parsed = regenerateRecoveryCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const teacher = getTeacherById(req.teacherId!)!;
  if (!await verifyPassword(parsed.data.currentPassword, teacher.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }
  const recoveryCode = generateRecoveryCode();
  updateTeacherRecoveryCodeHash(teacher.id, hashRecoveryCode(recoveryCode));
  res.json({ recoveryCode });
});

authRouter.post('/student/regenerate-recovery-code', requireStudent, async (req, res) => {
  const parsed = regenerateRecoveryCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const student = getStudentById(req.studentId!)!;
  if (!await verifyPassword(parsed.data.currentPassword, student.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }
  const recoveryCode = generateRecoveryCode();
  updateStudentRecoveryCodeHash(student.id, hashRecoveryCode(recoveryCode));
  res.json({ recoveryCode });
});

authRouter.post('/teacher/change-password', requireTeacher, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const teacher = getTeacherById(req.teacherId!)!;
  if (!await verifyPassword(parsed.data.currentPassword, teacher.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }
  updateTeacherPassword(teacher.id, await hashPassword(parsed.data.newPassword));
  const updated = getTeacherById(teacher.id)!;
  const token = signToken({ sub: updated.id, role: 'teacher', tokenVersion: updated.token_version });
  res.json({ token });
});

authRouter.post('/student/change-password', requireStudent, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const student = getStudentById(req.studentId!)!;
  if (!await verifyPassword(parsed.data.currentPassword, student.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }
  updateStudentPassword(student.id, await hashPassword(parsed.data.newPassword));
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
