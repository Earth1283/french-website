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

describe('teacher auth', () => {
  it('registers the first teacher with no signup code required', async () => {
    const res = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.teacher.email).toBe('curie@example.com');
  });

  it('rejects a second teacher registering without a signup code', async () => {
    await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'First', email: 'first@example.com', password: 'supersecret1' });
    const res = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Second', email: 'second@example.com', password: 'supersecret1' });
    expect(res.status).toBe(403);
  });

  it('rejects duplicate emails', async () => {
    await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'A', email: 'dupe@example.com', password: 'supersecret1' });
    const res = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'B', email: 'dupe@example.com', password: 'anotherpass1', signupCode: 'test-invite-code' });
    expect(res.status).toBe(409);
  });

  it('rejects login with wrong password', async () => {
    await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    const res = await request(app)
      .post('/api/auth/teacher/login')
      .send({ email: 'curie@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('rejects a tampered token', async () => {
    const reg = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    const tampered = reg.body.token.slice(0, -2) + 'xx';
    const res = await request(app).get('/api/teacher/classes').set('Authorization', `Bearer ${tampered}`);
    expect(res.status).toBe(401);
  });
});

describe('student auth', () => {
  it('registers and logs in a student', async () => {
    await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
    const res = await request(app)
      .post('/api/auth/student/login')
      .send({ email: 'alex@example.com', password: 'studentpass1' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });

  it('a student token cannot access teacher-only routes', async () => {
    const reg = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
    const res = await request(app)
      .get('/api/teacher/classes')
      .set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(401);
  });
});
