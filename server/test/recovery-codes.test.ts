import type Database from 'better-sqlite3';
import type { Express } from 'express';
import bcrypt from 'bcrypt';
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
      .set('Authorization', `Bearer ${reg.body.token}`)
      .send({ currentPassword: 'supersecret1' });
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

  it('refuses to regenerate a recovery code without the current password', async () => {
    const reg = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
    const auth = { Authorization: `Bearer ${reg.body.token}` };

    const missing = await request(app).post('/api/auth/student/regenerate-recovery-code').set(auth).send({});
    expect(missing.status).toBe(400);

    const wrong = await request(app)
      .post('/api/auth/student/regenerate-recovery-code')
      .set(auth)
      .send({ currentPassword: 'not-the-password' });
    expect(wrong.status).toBe(401);

    const stillValid = await request(app).post('/api/auth/student/reset-with-recovery-code').send({
      email: 'alex@example.com',
      recoveryCode: reg.body.recoveryCode,
      newPassword: 'freshpassword1',
    });
    expect(stillValid.status).toBe(200);
  });

  it('stores recovery codes as a digest, never in plain text', async () => {
    const reg = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    const row = db.prepare('SELECT recovery_code_hash FROM teachers').get() as { recovery_code_hash: string };
    expect(row.recovery_code_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(row.recovery_code_hash).not.toContain(reg.body.recoveryCode);
  });

  it('still accepts a bcrypt-hashed recovery code issued before the digest format', async () => {
    await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    db.prepare('UPDATE teachers SET recovery_code_hash = ?').run(bcrypt.hashSync('LEGACY-CODE-0000', 4));

    const res = await request(app).post('/api/auth/teacher/reset-with-recovery-code').send({
      email: 'curie@example.com',
      recoveryCode: 'LEGACY-CODE-0000',
      newPassword: 'freshpassword1',
    });
    expect(res.status).toBe(200);
    const row = db.prepare('SELECT recovery_code_hash FROM teachers').get() as { recovery_code_hash: string };
    expect(row.recovery_code_hash).toMatch(/^sha256:/);
  });
});
