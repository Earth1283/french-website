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

describe('response compression', () => {
  it('gzips large JSON responses when the client accepts it', async () => {
    const reg = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    const auth = { Authorization: `Bearer ${reg.body.token}` };
    const pages = Array.from({ length: 5 }, () => 'bonjour '.repeat(2000));
    const created = await request(app)
      .post('/api/teacher/content')
      .set(auth)
      .send({ title: 'Long read', body: { kind: 'reading', pages, xpReward: 10 } });

    const res = await request(app)
      .get(`/api/teacher/content/${created.body.content.id}`)
      .set(auth)
      .set('Accept-Encoding', 'gzip');
    expect(res.headers['content-encoding']).toBe('gzip');
    expect(res.body.content.body.pages).toHaveLength(5);
  });
});
