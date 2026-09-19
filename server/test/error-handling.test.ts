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

async function teacherToken(): Promise<string> {
  const reg = await request(app)
    .post('/api/auth/teacher/register')
    .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
  return reg.body.token;
}

describe('request errors', () => {
  it('answers malformed JSON with 400, not 500', async () => {
    const res = await request(app)
      .post('/api/auth/student/login')
      .set('Content-Type', 'application/json')
      .send('{not json');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTypeOf('string');
  });

  it('answers an oversized body with 413, not 500', async () => {
    const res = await request(app)
      .post('/api/auth/student/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: 'x@example.com', password: 'a'.repeat(1_200_000) }));
    expect(res.status).toBe(413);
  });

  it('accepts a maximum-size reading lesson full of accented text', async () => {
    const token = await teacherToken();
    const pages = Array.from({ length: 50 }, () => 'é'.repeat(20_000));
    const res = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Long read', body: { kind: 'reading', pages, xpReward: 10 } });
    expect(res.status).toBe(201);

    const fetched = await request(app)
      .get(`/api/teacher/content/${res.body.content.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(fetched.body.content.body.pages).toHaveLength(50);
  });

  it('still caps content bodies well above the reading maximum', async () => {
    const token = await teacherToken();
    const res = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ title: 'Huge', filler: 'x'.repeat(6_000_000) }));
    expect(res.status).toBe(413);
  });
});
