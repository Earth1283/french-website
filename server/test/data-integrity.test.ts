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

  const contentRes = await request(app)
    .post('/api/teacher/content')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send(lessonBody);
  const contentId = contentRes.body.content.id;

  const assignmentRes = await request(app)
    .post(`/api/teacher/classes/${classId}/assignments`)
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({ contentId });
  const assignmentId = assignmentRes.body.assignment.id;

  const studentReg = await request(app)
    .post('/api/auth/student/register')
    .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
  const studentToken = studentReg.body.token;
  await request(app).post('/api/student/enroll').set('Authorization', `Bearer ${studentToken}`).send({ joinCode });

  return { teacherToken, studentToken, classId, contentId, assignmentId };
}

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('retaking an assignment', () => {
  it('replaces the previous attempt instead of adding a second one', async () => {
    const { teacherToken, studentToken, classId, assignmentId } = await setupClassroom();

    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ responses: [{ index: 0, correct: false }], score: 0, xpEarned: 0 });

    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ responses: [{ index: 0, correct: true }], score: 100, xpEarned: 10 });

    const list = await request(app)
      .get(`/api/student/classes/${classId}/assignments`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(list.body.assignments).toHaveLength(1);
    expect(list.body.assignments[0].score).toBe(100);

    const roster = await request(app)
      .get(`/api/teacher/classes/${classId}/roster`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(roster.body.roster[0].completedAssignments).toBe(1);
    expect(roster.body.roster[0].totalAssignments).toBe(1);

    const results = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments/${assignmentId}/results`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(results.body.questions[0].totalCount).toBe(1);
    expect(results.body.questions[0].correctCount).toBe(1);
  });

  it('surfaces the previous attempt to the student before they redo it', async () => {
    const { studentToken, assignmentId } = await setupClassroom();
    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ responses: [{ index: 0, correct: true }], score: 100, xpEarned: 10 });

    const res = await request(app)
      .get(`/api/student/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.body.previousAttempt).toEqual({ score: 100, xpEarned: 10 });
  });
});

describe('deleting content', () => {
  it('is a soft delete that preserves assignment and attempt history', async () => {
    const { teacherToken, studentToken, classId, contentId, assignmentId } = await setupClassroom();

    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ responses: [{ index: 0, correct: true }], score: 100, xpEarned: 10 });

    const del = await request(app)
      .delete(`/api/teacher/content/${contentId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(del.status).toBe(204);

    // Gone from the content library...
    const list = await request(app).get('/api/teacher/content').set('Authorization', `Bearer ${teacherToken}`);
    expect(list.body.content.find((c: { id: string }) => c.id === contentId)).toBeUndefined();

    // ...but the roster, assignment, and attempt history are untouched.
    const roster = await request(app)
      .get(`/api/teacher/classes/${classId}/roster`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(roster.body.roster[0].completedAssignments).toBe(1);

    const results = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments/${assignmentId}/results`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(results.body.questions[0].totalCount).toBe(1);
    expect(results.body.assignment.id).toBe(assignmentId);
  });

  it('cannot be re-assigned or edited once deleted', async () => {
    const { teacherToken, contentId } = await setupClassroom();
    await request(app).delete(`/api/teacher/content/${contentId}`).set('Authorization', `Bearer ${teacherToken}`);

    const editRes = await request(app)
      .put(`/api/teacher/content/${contentId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ title: 'Resurrected' });
    expect(editRes.status).toBe(404);
  });
});
