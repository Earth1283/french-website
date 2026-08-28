import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

function readingBody(overrides: Partial<{ gradable: boolean; pages: string[] }> = {}) {
  return {
    title: 'The Bisou Minefield',
    subtitle: 'How many kisses, and where',
    body: {
      kind: 'reading',
      pages: overrides.pages ?? ['# Page One\n\nContent for page one.', '# Page Two\n\nContent for page two.'],
      xpReward: 15,
      gradable: overrides.gradable ?? true,
    },
  };
}

async function setup() {
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
  await request(app).post('/api/student/enroll').set('Authorization', `Bearer ${studentToken}`).send({ joinCode });

  return { teacherToken, studentToken, classId };
}

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('reading content', () => {
  it('stores page text as files, not in body_json', async () => {
    const { teacherToken } = await setup();
    const res = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send(readingBody());
    expect(res.status).toBe(201);
    expect(res.body.content.kind).toBe('reading');

    const rawRow = db.prepare('SELECT body_json FROM content_items WHERE id = ?').get(res.body.content.id) as {
      body_json: string;
    };
    const stored = JSON.parse(rawRow.body_json);
    expect(stored.pages).toBeUndefined();
    expect(stored.pageCount).toBe(2);
  });

  it('hydrates page text back from disk when a teacher fetches it to edit', async () => {
    const { teacherToken } = await setup();
    const created = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send(readingBody());

    const fetched = await request(app)
      .get(`/api/teacher/content/${created.body.content.id}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(fetched.body.content.body.pages).toEqual([
      '# Page One\n\nContent for page one.',
      '# Page Two\n\nContent for page two.',
    ]);
  });

  it('rewrites page files in place on update, dropping removed pages', async () => {
    const { teacherToken } = await setup();
    const created = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send(readingBody());

    await request(app)
      .put(`/api/teacher/content/${created.body.content.id}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ body: { kind: 'reading', pages: ['# Only Page\n\nJust one now.'], xpReward: 15, gradable: true } });

    const fetched = await request(app)
      .get(`/api/teacher/content/${created.body.content.id}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(fetched.body.content.body.pages).toEqual(['# Only Page\n\nJust one now.']);
  });

  it('lets a student read an assigned lesson and complete it for XP when gradable', async () => {
    const { teacherToken, studentToken, classId } = await setup();
    const content = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send(readingBody({ gradable: true }));
    const assignment = await request(app)
      .post(`/api/teacher/classes/${classId}/assignments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ contentId: content.body.content.id });

    const fetched = await request(app)
      .get(`/api/student/assignments/${assignment.body.assignment.id}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(fetched.body.content.body.pages).toHaveLength(2);

    const attempt = await request(app)
      .post(`/api/student/assignments/${assignment.body.assignment.id}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ responses: [], score: 100, xpEarned: 15 });
    expect(attempt.status).toBe(201);
    expect(attempt.body.attempt.score).toBe(100);

    const roster = await request(app)
      .get(`/api/teacher/classes/${classId}/roster`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(roster.body.roster[0].completedAssignments).toBe(1);
    expect(roster.body.roster[0].averageScore).toBe(100);
  });

  it('lets a non-gradable reading assignment be completed without affecting the grade average', async () => {
    const { teacherToken, studentToken, classId } = await setup();
    const content = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send(readingBody({ gradable: false }));
    const assignment = await request(app)
      .post(`/api/teacher/classes/${classId}/assignments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ contentId: content.body.content.id });

    const attempt = await request(app)
      .post(`/api/student/assignments/${assignment.body.assignment.id}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ responses: [], score: null, xpEarned: 0 });
    expect(attempt.status).toBe(201);
    expect(attempt.body.attempt.score).toBeNull();

    const roster = await request(app)
      .get(`/api/teacher/classes/${classId}/roster`)
      .set('Authorization', `Bearer ${teacherToken}`);
    // Completed (shows up in the ratio) but a null score is excluded from
    // the average rather than counting as a 0.
    expect(roster.body.roster[0].completedAssignments).toBe(1);
    expect(roster.body.roster[0].averageScore).toBe(0);
  });
});
