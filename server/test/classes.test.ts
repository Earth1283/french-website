import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

async function registerTeacher(email = 'curie@example.com') {
  const res = await request(app)
    .post('/api/auth/teacher/register')
    .send({ name: 'Ms. Curie', email, password: 'supersecret1', signupCode: 'test-invite-code' });
  return res.body.token as string;
}

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('classes', () => {
  it('creates a class with a unique join code', async () => {
    const token = await registerTeacher();
    const res = await request(app)
      .post('/api/teacher/classes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Period 1' });
    expect(res.status).toBe(201);
    expect(res.body.class.join_code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it('only lists classes owned by the requesting teacher', async () => {
    const tokenA = await registerTeacher('a@example.com');
    const tokenB = await registerTeacher('b@example.com');
    await request(app).post('/api/teacher/classes').set('Authorization', `Bearer ${tokenA}`).send({ name: 'A class' });
    await request(app).post('/api/teacher/classes').set('Authorization', `Bearer ${tokenB}`).send({ name: 'B class' });

    const resA = await request(app).get('/api/teacher/classes').set('Authorization', `Bearer ${tokenA}`);
    expect(resA.body.classes).toHaveLength(1);
    expect(resA.body.classes[0].name).toBe('A class');
  });

  it('rejects one teacher from touching another teacher\'s class', async () => {
    const tokenA = await registerTeacher('a@example.com');
    const tokenB = await registerTeacher('b@example.com');
    const created = await request(app)
      .post('/api/teacher/classes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'A class' });

    const res = await request(app)
      .get(`/api/teacher/classes/${created.body.class.id}/roster`)
      .set('Authorization', `Bearer ${tokenB}`);
    expect(res.status).toBe(404);
  });

  it('rotates the join code', async () => {
    const token = await registerTeacher();
    const created = await request(app)
      .post('/api/teacher/classes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Period 1' });
    const rotated = await request(app)
      .post(`/api/teacher/classes/${created.body.class.id}/rotate-join-code`)
      .set('Authorization', `Bearer ${token}`);
    expect(rotated.status).toBe(200);
    expect(rotated.body.class.join_code).not.toBe(created.body.class.join_code);
  });
});
