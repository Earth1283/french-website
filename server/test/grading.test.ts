import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { checkAnswer } from '../../src/utils/fuzzy.js';
import { isTypedAnswerAccepted } from '../src/lib/grading.js';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

const quizBody = {
  title: 'Mixed quiz',
  body: {
    kind: 'quiz',
    items: [
      { type: 'multiple-choice', prompt: 'Hello?', answer: 'Bonjour', options: ['Bonjour', 'Merci'] },
      { type: 'fill-blank', prompt: 'Thank you = ___', answer: 'merci' },
      { type: 'translation', prompt: 'Where is the station?', answer: 'Où est la gare ?' },
      { type: 'multiple-choice', prompt: 'Goodbye?', answer: 'Au revoir', options: ['Au revoir', 'Bonsoir'] },
    ],
    xpReward: 20,
  },
};

async function setupAssignment() {
  const teacher = await request(app)
    .post('/api/auth/teacher/register')
    .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
  const teacherAuth = { Authorization: `Bearer ${teacher.body.token}` };
  const cls = await request(app).post('/api/teacher/classes').set(teacherAuth).send({ name: 'Period 1' });
  const content = await request(app).post('/api/teacher/content').set(teacherAuth).send(quizBody);
  const assignment = await request(app)
    .post(`/api/teacher/classes/${cls.body.class.id}/assignments`)
    .set(teacherAuth)
    .send({ contentId: content.body.content.id });
  const student = await request(app)
    .post('/api/auth/student/register')
    .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
  const studentAuth = { Authorization: `Bearer ${student.body.token}` };
  await request(app).post('/api/student/enroll').set(studentAuth).send({ joinCode: cls.body.class.join_code });
  return { studentAuth, attemptsUrl: `/api/student/assignments/${assignment.body.assignment.id}/attempts` };
}

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('server-side grading', () => {
  it('grades answers itself and ignores a forged score, XP and correctness', async () => {
    const { studentAuth, attemptsUrl } = await setupAssignment();
    const res = await request(app)
      .post(attemptsUrl)
      .set(studentAuth)
      .send({
        responses: [
          { index: 0, correct: true, answerGiven: 'Merci' },
          { index: 1, correct: true, answerGiven: 'wrong' },
          { index: 2, correct: true, answerGiven: 'nope' },
          { index: 3, correct: true, answerGiven: 'Bonsoir' },
        ],
        score: 100,
        xpEarned: 1_000_000,
      });
    expect(res.status).toBe(201);
    expect(res.body.attempt.score).toBe(0);
    expect(res.body.attempt.xp_earned).toBe(20);
    const stored = JSON.parse(res.body.attempt.responses_json);
    expect(stored.map((r: { correct: boolean }) => r.correct)).toEqual([false, false, false, false]);
  });

  it('accepts multiple choice exactly and typed answers with typo leniency', async () => {
    const { studentAuth, attemptsUrl } = await setupAssignment();
    const res = await request(app)
      .post(attemptsUrl)
      .set(studentAuth)
      .send({
        responses: [
          { index: 0, answerGiven: 'Bonjour' },
          { index: 1, answerGiven: 'Mercii' },
          { index: 2, answerGiven: 'où est la gare' },
          { index: 3, answerGiven: 'au revoir' },
        ],
      });
    expect(res.status).toBe(201);
    // "au revoir" is a valid typed answer but not a valid multiple-choice one.
    expect(res.body.attempt.score).toBe(75);
  });

  it('rejects a submission missing answers, so old clients get a clear error', async () => {
    const { studentAuth, attemptsUrl } = await setupAssignment();
    const res = await request(app)
      .post(attemptsUrl)
      .set(studentAuth)
      .send({ responses: [0, 1, 2, 3].map((index) => ({ index, correct: true })), score: 100, xpEarned: 20 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/out of date/i);
  });

  it('rejects incomplete, duplicated and out-of-range responses', async () => {
    const { studentAuth, attemptsUrl } = await setupAssignment();
    const submit = (responses: unknown[]) => request(app).post(attemptsUrl).set(studentAuth).send({ responses });

    expect((await submit([{ index: 0, answerGiven: 'Bonjour' }])).status).toBe(400);
    expect((await submit([0, 0, 0, 0].map((index) => ({ index, answerGiven: 'Bonjour' })))).status).toBe(400);
    expect((await submit([0, 1, 2, 99].map((index) => ({ index, answerGiven: 'x' })))).status).toBe(400);
  });

  it('does not let a forged score or XP through for reading content', async () => {
    const teacher = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
    const teacherAuth = { Authorization: `Bearer ${teacher.body.token}` };
    const cls = await request(app).post('/api/teacher/classes').set(teacherAuth).send({ name: 'Period 1' });
    const content = await request(app)
      .post('/api/teacher/content')
      .set(teacherAuth)
      .send({ title: 'Read', body: { kind: 'reading', pages: ['# One\n\ntext'], xpReward: 15, gradable: false } });
    const assignment = await request(app)
      .post(`/api/teacher/classes/${cls.body.class.id}/assignments`)
      .set(teacherAuth)
      .send({ contentId: content.body.content.id });
    const student = await request(app)
      .post('/api/auth/student/register')
      .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
    const studentAuth = { Authorization: `Bearer ${student.body.token}` };
    await request(app).post('/api/student/enroll').set(studentAuth).send({ joinCode: cls.body.class.join_code });

    const res = await request(app)
      .post(`/api/student/assignments/${assignment.body.assignment.id}/attempts`)
      .set(studentAuth)
      .send({ responses: [], score: 100, xpEarned: 999 });
    expect(res.body.attempt.score).toBeNull();
    expect(res.body.attempt.xp_earned).toBe(0);
  });
});

describe('answer matching parity with the frontend', () => {
  const cases: Array<[string, string]> = [
    ['merci', 'merci'],
    ['Merci !', 'merci'],
    ['où est la gare', 'Où est la gare ?'],
    ['ou est la gare', 'Où est la gare ?'],
    ['tu parle', 'tu parles'],
    ['je suis alle', 'je suis allée'],
    ['Mercii', 'merci'],
    ['Ou est la gar', 'Où est la gare ?'],
    ['bonjuor', 'bonjour'],
    ['bonj', 'bonjour'],
    ['garçon', 'garcon'],
    ["l'eau", "l'eau"],
    ['l’eau', "l'eau"],
    ['cœur', 'coeur'],
    ['  trop   d\'espaces  ', "trop d'espaces"],
    ['a', 'ab'],
    ['ab', 'abcdef'],
    ['je suis fatigue', 'Je suis fatigué.'],
    ['je suis fatigué', 'Je suis fatigué.'],
    ['completely different sentence here', 'Où est la gare ?'],
  ];

  it.each(cases)('agrees on %j vs %j', (input, expected) => {
    const frontend = checkAnswer(input, expected) !== 'wrong';
    expect(isTypedAnswerAccepted(input, expected)).toBe(frontend);
  });
});
