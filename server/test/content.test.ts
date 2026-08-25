import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

const lessonBody = {
  title: 'Greetings',
  subtitle: 'Say hello',
  body: {
    kind: 'lesson',
    vocab: [{ french: 'Bonjour', english: 'Hello', pronunciation: 'bohn-zhoor' }],
    exercises: [
      { type: 'multiple-choice', prompt: 'How do you say hello?', answer: 'Bonjour', options: ['Bonjour', 'Merci'] },
    ],
    xpReward: 10,
  },
};

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

describe('content', () => {
  it('creates lesson content matching the frontend Exercise/VocabItem shape', async () => {
    const token = await registerTeacher();
    const res = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${token}`)
      .send(lessonBody);
    expect(res.status).toBe(201);
    expect(res.body.content.kind).toBe('lesson');
  });

  it('rejects content with an empty exercises array', async () => {
    const token = await registerTeacher();
    const res = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...lessonBody, body: { ...lessonBody.body, exercises: [] } });
    expect(res.status).toBe(400);
  });

  it('prevents a teacher from editing another teacher\'s content', async () => {
    const tokenA = await registerTeacher('a@example.com');
    const tokenB = await registerTeacher('b@example.com');
    const created = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(lessonBody);

    const res = await request(app)
      .put(`/api/teacher/content/${created.body.content.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hijacked' });
    expect(res.status).toBe(404);
  });
});
