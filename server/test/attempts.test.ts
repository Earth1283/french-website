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

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('full classroom flow', () => {
  it('register -> class -> content -> assign -> enroll -> attempt -> roster', async () => {
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

    const enrollRes = await request(app)
      .post('/api/student/enroll')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ joinCode });
    expect(enrollRes.status).toBe(201);

    const assignmentsRes = await request(app)
      .get(`/api/student/classes/${classId}/assignments`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(assignmentsRes.body.assignments).toHaveLength(1);
    expect(assignmentsRes.body.assignments[0].completed).toBe(0);

    const fetchedAssignment = await request(app)
      .get(`/api/student/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(fetchedAssignment.body.content.body.exercises[0].prompt).toBe('How do you say hello?');

    const attemptRes = await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ responses: [{ index: 0, correct: true }], score: 100, xpEarned: 10 });
    expect(attemptRes.status).toBe(201);

    const rosterRes = await request(app)
      .get(`/api/teacher/classes/${classId}/roster`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(rosterRes.body.roster).toHaveLength(1);
    expect(rosterRes.body.roster[0].completedAssignments).toBe(1);
    expect(rosterRes.body.roster[0].averageScore).toBe(100);
  });

  it('rejects joining with a nonexistent code', async () => {
    const studentReg = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });

    const res = await request(app)
      .post('/api/student/enroll')
      .set('Authorization', `Bearer ${studentReg.body.token}`)
      .send({ joinCode: 'ZZZZ-ZZZZ' });
    expect(res.status).toBe(404);
  });

  it('rejects fetching an assignment for a class the student never joined', async () => {
    const teacherReg = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    const classRes = await request(app)
      .post('/api/teacher/classes')
      .set('Authorization', `Bearer ${teacherReg.body.token}`)
      .send({ name: 'Period 1' });
    const contentRes = await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${teacherReg.body.token}`)
      .send(lessonBody);
    const assignmentRes = await request(app)
      .post(`/api/teacher/classes/${classRes.body.class.id}/assignments`)
      .set('Authorization', `Bearer ${teacherReg.body.token}`)
      .send({ contentId: contentRes.body.content.id });

    const studentReg = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });

    const res = await request(app)
      .get(`/api/student/assignments/${assignmentRes.body.assignment.id}`)
      .set('Authorization', `Bearer ${studentReg.body.token}`);
    expect(res.status).toBe(404);
  });
});
