import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

beforeAll(async () => {
  ({ app, db } = await createTestApp({ AUTH_RATE_LIMIT: '3' }));
});

beforeEach(() => resetDb(db));

describe('auth rate limiting', () => {
  it('does not count successful logins, so a classroom sharing one IP is not locked out', async () => {
    await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });

    for (let i = 0; i < 8; i++) {
      const res = await request(app)
        .post('/api/auth/student/login')
        .send({ email: 'alex@example.com', password: 'studentpass1' });
      expect(res.status).toBe(200);
    }
  });

  it('blocks repeated failures against one account with a JSON error', async () => {
    const attempt = () =>
      request(app).post('/api/auth/student/login').send({ email: 'alex@example.com', password: 'wrong-password' });

    for (let i = 0; i < 3; i++) expect((await attempt()).status).toBe(401);
    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/too many/i);
  });

  it('keeps other accounts usable from the same IP while one is blocked', async () => {
    await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Sam', email: 'sam@example.com', password: 'studentpass1' });

    for (let i = 0; i < 4; i++) {
      await request(app).post('/api/auth/student/login').send({ email: 'alex@example.com', password: 'nope-nope' });
    }
    const other = await request(app)
      .post('/api/auth/student/login')
      .send({ email: 'sam@example.com', password: 'studentpass1' });
    expect(other.status).toBe(200);
  });

  it('limits wrong join codes per student', async () => {
    const reg = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Robin', email: 'robin@example.com', password: 'studentpass1' });
    const guess = () =>
      request(app)
        .post('/api/student/enroll')
        .set('Authorization', `Bearer ${reg.body.token}`)
        .send({ joinCode: 'AAAA-AAAA' });

    for (let i = 0; i < 3; i++) expect((await guess()).status).toBe(404);
    expect((await guess()).status).toBe(429);
  });
});
