import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('self-service change password', () => {
  it('lets a teacher change their password and keeps them logged in with a fresh token', async () => {
    const reg = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });

    const change = await request(app)
      .post('/api/auth/teacher/change-password')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ currentPassword: 'supersecret1', newPassword: 'brandnewpass1' });
    expect(change.status).toBe(200);
    expect(change.body.token).toBeTypeOf('string');

    const oldLogin = await request(app)
      .post('/api/auth/teacher/login')
      .send({ email: 'curie@example.com', password: 'supersecret1' });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/teacher/login')
      .send({ email: 'curie@example.com', password: 'brandnewpass1' });
    expect(newLogin.status).toBe(200);
  });

  it('invalidates the old token after a password change', async () => {
    const reg = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    const oldToken = reg.body.token;

    await request(app)
      .post('/api/auth/teacher/change-password')
      .set('Authorization', `Bearer ${oldToken}`)
      .send({ currentPassword: 'supersecret1', newPassword: 'brandnewpass1' });

    const res = await request(app).get('/api/teacher/classes').set('Authorization', `Bearer ${oldToken}`);
    expect(res.status).toBe(401);
  });

  it('rejects a change-password request with the wrong current password', async () => {
    const reg = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });

    const res = await request(app)
      .post('/api/auth/student/change-password')
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'brandnewpass1' });
    expect(res.status).toBe(401);
  });
});

describe('teacher resets a student password', () => {
  async function setupClassroom() {
    const teacherReg = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    const teacherToken = teacherReg.body.token;

    const classRes = await request(app)
      .post('/api/teacher/classes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Period 1' });
    const classId = classRes.body.class.id;
    const joinCode = classRes.body.class.join_code;

    const studentReg = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
    const studentToken = studentReg.body.token;
    const studentId = studentReg.body.student.id;
    await request(app).post('/api/student/enroll').set('Authorization', `Bearer ${studentToken}`).send({ joinCode });

    return { teacherToken, studentToken, classId, studentId };
  }

  it('lets a teacher set a new password for a student in their class', async () => {
    const { teacherToken, classId, studentId } = await setupClassroom();

    const res = await request(app)
      .post(`/api/teacher/classes/${classId}/students/${studentId}/reset-password`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ newPassword: 'teacherset123' });
    expect(res.status).toBe(204);

    const login = await request(app)
      .post('/api/auth/student/login')
      .send({ email: 'alex@example.com', password: 'teacherset123' });
    expect(login.status).toBe(200);
  });

  it('logs the student out everywhere once their password is reset', async () => {
    const { teacherToken, studentToken, classId, studentId } = await setupClassroom();

    await request(app)
      .post(`/api/teacher/classes/${classId}/students/${studentId}/reset-password`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ newPassword: 'teacherset123' });

    const res = await request(app).get('/api/student/classes').set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(401);
  });

  it('rejects resetting a password for a student not enrolled in that class', async () => {
    const { teacherToken, classId } = await setupClassroom();
    const outsider = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Outsider', email: 'outsider@example.com', password: 'studentpass1' });

    const res = await request(app)
      .post(`/api/teacher/classes/${classId}/students/${outsider.body.student.id}/reset-password`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ newPassword: 'teacherset123' });
    expect(res.status).toBe(404);
  });

  it("rejects a teacher resetting a student's password in a class they don't own", async () => {
    const { classId, studentId } = await setupClassroom();
    const otherTeacher = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Other', email: 'other@example.com', password: 'supersecret1', signupCode: 'test-invite-code' });

    const res = await request(app)
      .post(`/api/teacher/classes/${classId}/students/${studentId}/reset-password`)
      .set('Authorization', `Bearer ${otherTeacher.body.token}`)
      .send({ newPassword: 'teacherset123' });
    expect(res.status).toBe(404);
  });
});
