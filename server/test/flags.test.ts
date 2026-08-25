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
      { type: 'multiple-choice', prompt: 'How do you say thanks?', answer: 'Merci', options: ['Bonjour', 'Merci'] },
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

  const assignmentRes = await request(app)
    .post(`/api/teacher/classes/${classId}/assignments`)
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({ contentId: contentRes.body.content.id });
  const assignmentId = assignmentRes.body.assignment.id;

  const studentReg = await request(app)
    .post('/api/auth/student/register')
    .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
  const studentToken = studentReg.body.token;
  await request(app)
    .post('/api/student/enroll')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ joinCode });

  return { teacherToken, studentToken, classId, assignmentId };
}

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('question analytics', () => {
  it('tallies correct/wrong per question across attempts', async () => {
    const { teacherToken, studentToken, classId, assignmentId } = await setupClassroom();

    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        responses: [
          { index: 0, correct: true },
          { index: 1, correct: false },
        ],
        score: 50,
        xpEarned: 5,
      });

    const res = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments/${assignmentId}/results`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.questions).toEqual([
      { index: 0, correctCount: 1, wrongCount: 0, totalCount: 1, prompt: 'How do you say hello?' },
      { index: 1, correctCount: 0, wrongCount: 1, totalCount: 1, prompt: 'How do you say thanks?' },
    ]);
  });

  it('rejects a teacher who does not own the class', async () => {
    const { classId, assignmentId } = await setupClassroom();
    const otherTeacher = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Other', email: 'other@example.com', password: 'supersecret1', signupCode: 'test-invite-code' });

    const res = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments/${assignmentId}/results`)
      .set('Authorization', `Bearer ${otherTeacher.body.token}`);
    expect(res.status).toBe(404);
  });
});

describe('flags', () => {
  it('lets a student flag a question and a teacher see + resolve it', async () => {
    const { teacherToken, studentToken, classId, assignmentId } = await setupClassroom();

    const flagRes = await request(app)
      .post(`/api/student/assignments/${assignmentId}/flags`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ questionIndex: 1, reason: 'This seems ambiguous' });
    expect(flagRes.status).toBe(201);

    const resultsRes = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments/${assignmentId}/results`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(resultsRes.body.flags).toHaveLength(1);
    expect(resultsRes.body.flags[0].reason).toBe('This seems ambiguous');
    expect(resultsRes.body.flags[0].studentName).toBe('Alex');

    const resolveRes = await request(app)
      .post(`/api/teacher/flags/${flagRes.body.flag.id}/resolve`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.flag.resolved_at).not.toBeNull();
  });

  it('rejects a student flagging an assignment in a class they are not enrolled in', async () => {
    const { assignmentId } = await setupClassroom();
    const outsider = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Outsider', email: 'outsider@example.com', password: 'studentpass1' });

    const res = await request(app)
      .post(`/api/student/assignments/${assignmentId}/flags`)
      .set('Authorization', `Bearer ${outsider.body.token}`)
      .send({ questionIndex: 0 });
    expect(res.status).toBe(404);
  });

  it('excludes resolved flags from the unresolved count shown on the assignments list', async () => {
    const { teacherToken, studentToken, classId, assignmentId } = await setupClassroom();
    const flagRes = await request(app)
      .post(`/api/student/assignments/${assignmentId}/flags`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ questionIndex: 0 });

    let list = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(list.body.assignments[0].unresolvedFlagCount).toBe(1);

    await request(app)
      .post(`/api/teacher/flags/${flagRes.body.flag.id}/resolve`)
      .set('Authorization', `Bearer ${teacherToken}`);

    list = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(list.body.assignments[0].unresolvedFlagCount).toBe(0);
  });
});
