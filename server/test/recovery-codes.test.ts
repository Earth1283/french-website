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

describe('recovery codes', () => {
  it('issues a recovery code on teacher registration', async () => {
    const res = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    expect(res.body.recoveryCode).toMatch(/^([A-Z0-9]{4}-){4}[A-Z0-9]{4}$/);
  });

  it('issues a recovery code on student registration', async () => {
    const res = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
    expect(res.body.recoveryCode).toMatch(/^([A-Z0-9]{4}-){4}[A-Z0-9]{4}$/);
  });

  it('lets a student reset their password with a valid recovery code, without a login', async () => {
    const reg = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });

    const res = await request(app).post('/api/auth/student/reset-with-recovery-code').send({
      email: 'alex@example.com',
      recoveryCode: reg.body.recoveryCode,
      newPassword: 'freshpassword1',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.recoveryCode).toBeTypeOf('string');
    expect(res.body.recoveryCode).not.toBe(reg.body.recoveryCode);

    const login = await request(app)
      .post('/api/auth/student/login')
      .send({ email: 'alex@example.com', password: 'freshpassword1' });
    expect(login.status).toBe(200);
  });

  it('rejects a reset with the wrong recovery code', async () => {
    await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });

    const res = await request(app).post('/api/auth/teacher/reset-with-recovery-code').send({
      email: 'curie@example.com',
      recoveryCode: 'ZZZZ-ZZZZ-ZZZZ-ZZZZ-ZZZZ',
      newPassword: 'freshpassword1',
    });
    expect(res.status).toBe(401);
  });

  it('is single-use — the old code stops working after one reset', async () => {
    const reg = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });

    await request(app).post('/api/auth/teacher/reset-with-recovery-code').send({
      email: 'curie@example.com',
      recoveryCode: reg.body.recoveryCode,
      newPassword: 'freshpassword1',
    });

    const secondAttempt = await request(app).post('/api/auth/teacher/reset-with-recovery-code').send({
      email: 'curie@example.com',
      recoveryCode: reg.body.recoveryCode,
      newPassword: 'anotherpassword1',
    });
    expect(secondAttempt.status).toBe(401);
  });

  it('invalidates existing sessions once a recovery-code reset happens', async () => {
    const reg = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
    const oldToken = reg.body.token;

    await request(app).post('/api/auth/student/reset-with-recovery-code').send({
      email: 'alex@example.com',
      recoveryCode: reg.body.recoveryCode,
      newPassword: 'freshpassword1',
    });

    const res = await request(app).get('/api/student/classes').set('Authorization', `Bearer ${oldToken}`);
    expect(res.status).toBe(401);
  });

  it('lets a logged-in teacher regenerate their recovery code on demand', async () => {
    const reg = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });

    const regen = await request(app)
      .post('/api/auth/teacher/regenerate-recovery-code')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(regen.status).toBe(200);
    expect(regen.body.recoveryCode).not.toBe(reg.body.recoveryCode);

    // The original code from registration no longer works...
    const oldCodeAttempt = await request(app).post('/api/auth/teacher/reset-with-recovery-code').send({
      email: 'curie@example.com',
      recoveryCode: reg.body.recoveryCode,
      newPassword: 'freshpassword1',
    });
    expect(oldCodeAttempt.status).toBe(401);

    // ...but the freshly regenerated one does.
    const newCodeAttempt = await request(app).post('/api/auth/teacher/reset-with-recovery-code').send({
      email: 'curie@example.com',
      recoveryCode: regen.body.recoveryCode,
      newPassword: 'freshpassword1',
    });
    expect(newCodeAttempt.status).toBe(200);
  });
});
