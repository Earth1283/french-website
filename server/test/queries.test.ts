import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

const lessonBody = {
  title: 'Greetings',
  body: {
    kind: 'lesson',
    vocab: [],
    exercises: [
      { type: 'multiple-choice', prompt: 'Hello?', answer: 'Bonjour', options: ['Bonjour', 'Merci'] },
      { type: 'multiple-choice', prompt: 'Thanks?', answer: 'Merci', options: ['Bonjour', 'Merci'] },
    ],
    xpReward: 10,
  },
};

async function teacherWithTwoClasses() {
  const reg = await request(app)
    .post('/api/auth/teacher/register')
    .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
  const auth = { Authorization: `Bearer ${reg.body.token}` };
  const first = await request(app).post('/api/teacher/classes').set(auth).send({ name: 'Period 1' });
  const second = await request(app).post('/api/teacher/classes').set(auth).send({ name: 'Period 2' });
  const content = await request(app).post('/api/teacher/content').set(auth).send(lessonBody);

  const assign = async (classId: string) =>
    (
      await request(app)
        .post(`/api/teacher/classes/${classId}/assignments`)
        .set(auth)
        .send({ contentId: content.body.content.id })
    ).body.assignment.id as string;

  return {
    auth,
    first: { id: first.body.class.id as string, joinCode: first.body.class.join_code as string },
    second: { id: second.body.class.id as string, joinCode: second.body.class.join_code as string },
    firstAssignment: await assign(first.body.class.id),
    secondAssignment: await assign(second.body.class.id),
  };
}

async function enrolledStudent(name: string, joinCodes: string[]) {
  const reg = await request(app)
    .post('/api/auth/student/register')
    .send({ name, email: `${name.toLowerCase()}@example.com`, password: 'studentpass1' });
  const auth = { Authorization: `Bearer ${reg.body.token}` };
  for (const joinCode of joinCodes) {
    await request(app).post('/api/student/enroll').set(auth).send({ joinCode });
  }
  return auth;
}

const attempt = (auth: object, assignmentId: string, answers: [string, string]) =>
  request(app)
    .post(`/api/student/assignments/${assignmentId}/attempts`)
    .set(auth)
    .send({ responses: answers.map((answerGiven, index) => ({ index, answerGiven })) });

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('roster', () => {
  it('summarises every student in one pass, counting only this class and only completed work', async () => {
    const { auth, first, second, firstAssignment, secondAssignment } = await teacherWithTwoClasses();
    const zoe = await enrolledStudent('Zoe', [first.joinCode]);
    const amir = await enrolledStudent('amir', [first.joinCode, second.joinCode]);
    await enrolledStudent('Bea', [first.joinCode]);

    await attempt(zoe, firstAssignment, ['Bonjour', 'Merci']);
    await attempt(amir, firstAssignment, ['Bonjour', 'Bonjour']);
    await attempt(amir, secondAssignment, ['Bonjour', 'Merci']);

    const res = await request(app).get(`/api/teacher/classes/${first.id}/roster`).set(auth);
    expect(res.body.roster.map((s: { name: string }) => s.name)).toEqual(['amir', 'Bea', 'Zoe']);
    expect(res.body.roster).toMatchObject([
      { name: 'amir', completedAssignments: 1, totalAssignments: 1, averageScore: 50 },
      { name: 'Bea', completedAssignments: 0, totalAssignments: 1, averageScore: 0 },
      { name: 'Zoe', completedAssignments: 1, totalAssignments: 1, averageScore: 100 },
    ]);
  });

  it('returns an empty roster for a class nobody has joined', async () => {
    const { auth, first } = await teacherWithTwoClasses();
    const res = await request(app).get(`/api/teacher/classes/${first.id}/roster`).set(auth);
    expect(res.body.roster).toEqual([]);
  });
});

describe('question stats', () => {
  it('tallies correct and wrong answers per question across students', async () => {
    const { auth, first, firstAssignment } = await teacherWithTwoClasses();
    const zoe = await enrolledStudent('Zoe', [first.joinCode]);
    const amir = await enrolledStudent('Amir', [first.joinCode]);
    const bea = await enrolledStudent('Bea', [first.joinCode]);

    await attempt(zoe, firstAssignment, ['Bonjour', 'Merci']);
    await attempt(amir, firstAssignment, ['Bonjour', 'Bonjour']);
    await attempt(bea, firstAssignment, ['Merci', 'Bonjour']);

    const res = await request(app)
      .get(`/api/teacher/classes/${first.id}/assignments/${firstAssignment}/results`)
      .set(auth);
    expect(res.body.questions).toEqual([
      { index: 0, correctCount: 2, wrongCount: 1, totalCount: 3, prompt: 'Hello?' },
      { index: 1, correctCount: 1, wrongCount: 2, totalCount: 3, prompt: 'Thanks?' },
    ]);
  });
});

describe('teacher assignment list', () => {
  it('gives each assignment its title and kind without shipping the whole lesson body', async () => {
    const { auth, first } = await teacherWithTwoClasses();
    const res = await request(app).get(`/api/teacher/classes/${first.id}/assignments`).set(auth);
    expect(res.body.assignments).toHaveLength(1);
    expect(res.body.assignments[0]).toMatchObject({ title: 'Greetings', kind: 'lesson', unresolvedFlagCount: 0 });
    expect(res.body.assignments[0]).not.toHaveProperty('content');
  });
});
