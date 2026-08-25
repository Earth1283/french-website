import { Router } from 'express';
import { config } from '../config.js';
import { countTeachers } from '../db/queries/teachers.js';

export const healthRouter = Router();

function meta() {
  const teacherCount = countTeachers();
  return {
    ok: true,
    name: 'French Classroom Server',
    version: '0.1.0',
    requiresTeacherSetup: teacherCount === 0,
    allowOpenTeacherSignup: teacherCount === 0 || !!config.teacherSignupCode,
  };
}

healthRouter.get('/health', (_req, res) => res.json(meta()));
healthRouter.get('/meta', (_req, res) => res.json(meta()));
