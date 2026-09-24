import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import * as frontendRubric from '../../src/data/exam/rubric.js';
import { BAND_POINTS, countWords, maxWritingScore } from '../src/lib/rubric.js';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

const listeningContent = {
  title: 'À la gare',
  body: {
    kind: 'listening',
    level: 'a1',
    situation: 'Vous êtes à la gare.',
    plays: 2,
    script: [{ text: 'Le train pour Rouen part voie 3 à 10 heures 45.' }],
    questions: [
      { type: 'multiple-choice', prompt: 'Le train va à…', options: ['Rouen.', 'Rennes.', 'Reims.'], answer: 'Rouen.' },
      { type: 'short', prompt: 'Quelle voie ?', answer: '3' },
      { type: 'short', prompt: 'Quelle ville ?', answer: 'Rouen' },
    ],
    xpReward: 15,
  },
};

const writingContent = {
  title: 'Inviter un ami',
  body: {
    kind: 'writing',
    level: 'b1',
    consigne: 'Donnez votre opinion. (160 mots minimum)',
    minWords: 160,
    timeMinutes: 45,
    checklist: ['Give an opinion'],
    modelAnswer: 'Voici un modèle.',
    xpReward: 25,
  },
};

async function setup(content: object) {
  const teacher = await request(app)
    .post('/api/auth/teacher/register')
    .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
  const teacherAuth = { Authorization: `Bearer ${teacher.body.token}` };
  const cls = await request(app).post('/api/teacher/classes').set(teacherAuth).send({ name: 'P1' });
  const created = await request(app).post('/api/teacher/content').set(teacherAuth).send(content);
  expect(created.status).toBe(201);
  const assignment = await request(app)
    .post(`/api/teacher/classes/${cls.body.class.id}/assignments`)
    .set(teacherAuth)
    .send({ contentId: created.body.content.id });
  const student = await request(app)
    .post('/api/auth/student/register')
    .send({ name: 'Alex', email: 'alex@example.com', password: 'studentpass1' });
  const studentAuth = { Authorization: `Bearer ${student.body.token}` };
  await request(app).post('/api/student/enroll').set(studentAuth).send({ joinCode: cls.body.class.join_code });
  return { teacherAuth, studentAuth, classId: cls.body.class.id as string, assignmentId: assignment.body.assignment.id as string };
}

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('listening content', () => {
  it('rejects a multiple-choice answer that is not among the options', async () => {
    const teacher = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'T', email: 't@example.com', password: 'supersecret1' });
    const bad = structuredClone(listeningContent);
    bad.body.questions[0].answer = 'Paris.';
    const res = await request(app)
      .post('/api/teacher/content')
      .set({ Authorization: `Bearer ${teacher.body.token}` })
      .send(bad);
    expect(res.status).toBe(400);
  });

  it('grades on the server, with typo tolerance on short answers', async () => {
    const { studentAuth, teacherAuth, classId, assignmentId } = await setup(listeningContent);
    const detail = await request(app).get(`/api/student/assignments/${assignmentId}`).set(studentAuth);
    expect(detail.body.content.body.script[0].text).toContain('Rouen');

    const res = await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set(studentAuth)
      .send({
        responses: [
          { index: 0, answerGiven: 'Rennes.' },
          { index: 1, answerGiven: ' 3 ' },
          { index: 2, answerGiven: 'rouenn' },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.attempt.score).toBe(67);
    expect(res.body.attempt.xp_earned).toBe(15);

    const results = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments/${assignmentId}/results`)
      .set(teacherAuth);
    expect(results.body.questions.map((q: { prompt: string }) => q.prompt)).toEqual([
      'Le train va à…',
      'Quelle voie ?',
      'Quelle ville ?',
    ]);
    expect(results.body.submissions).toEqual([]);
  });
});

describe('writing content', () => {
  it('hides the model answer until the student submits', async () => {
    const { studentAuth, assignmentId } = await setup(writingContent);
    const before = await request(app).get(`/api/student/assignments/${assignmentId}`).set(studentAuth);
    expect(before.body.content.body.consigne).toContain('opinion');
    expect(before.body.content.body.modelAnswer).toBeUndefined();

    const empty = await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set(studentAuth)
      .send({ responses: [], text: '   ' });
    expect(empty.status).toBe(400);

    const submit = await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set(studentAuth)
      .send({ responses: [], text: 'À mon avis, les téléphones sont utiles.' });
    expect(submit.status).toBe(201);
    expect(submit.body.attempt.score).toBeNull();
    expect(submit.body.attempt.xp_earned).toBe(25);

    const after = await request(app).get(`/api/student/assignments/${assignmentId}`).set(studentAuth);
    expect(after.body.content.body.modelAnswer).toBe('Voici un modèle.');
    expect(after.body.previousAttempt.submissionText).toBe('À mon avis, les téléphones sont utiles.');
    expect(after.body.previousAttempt.review).toBeNull();
  });

  it('lets the teacher mark a submission with the DELF grid, and a resubmission clears it', async () => {
    const { studentAuth, teacherAuth, classId, assignmentId } = await setup(writingContent);
    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set(studentAuth)
      .send({ responses: [], text: 'Premier jet de mon texte.' });

    const results = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments/${assignmentId}/results`)
      .set(teacherAuth);
    expect(results.body.submissions).toHaveLength(1);
    const sub = results.body.submissions[0];
    expect(sub.studentName).toBe('Alex');
    expect(sub.wordCount).toBe(5);
    expect(sub.reviewedAt).toBeNull();

    const bad = await request(app)
      .post(`/api/teacher/attempts/${sub.attemptId}/review`)
      .set(teacherAuth)
      .send({ bands: { task: 4, coherence: 2, sociolinguistic: 2, lexicon: 2, morphosyntax: 2 } });
    expect(bad.status).toBe(400);

    const review = await request(app)
      .post(`/api/teacher/attempts/${sub.attemptId}/review`)
      .set(teacherAuth)
      .send({ bands: { task: 3, coherence: 2, sociolinguistic: 2, lexicon: 1, morphosyntax: 2 }, feedback: 'Bon début !' });
    expect(review.status).toBe(200);
    // B1: 5 + 3 + 3 + 1 + 3 = 15 / 25
    expect(review.body.attempt.score).toBe(60);

    const seen = await request(app).get(`/api/student/assignments/${assignmentId}`).set(studentAuth);
    expect(seen.body.previousAttempt.score).toBe(60);
    expect(seen.body.previousAttempt.review.feedback).toBe('Bon début !');
    expect(seen.body.previousAttempt.review.bands.task).toBe(3);

    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set(studentAuth)
      .send({ responses: [], text: 'Deuxième version, plus longue.' });
    const resubmitted = await request(app).get(`/api/student/assignments/${assignmentId}`).set(studentAuth);
    expect(resubmitted.body.previousAttempt.score).toBeNull();
    expect(resubmitted.body.previousAttempt.review).toBeNull();
  });

  it("does not let another teacher review a class's submission", async () => {
    const { studentAuth, teacherAuth, classId, assignmentId } = await setup(writingContent);
    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set(studentAuth)
      .send({ responses: [], text: 'Mon texte.' });
    const results = await request(app)
      .get(`/api/teacher/classes/${classId}/assignments/${assignmentId}/results`)
      .set(teacherAuth);
    const other = await request(app)
      .post('/api/auth/teacher/register')
      .send({ name: 'Other', email: 'other@example.com', password: 'supersecret1', signupCode: 'test-invite-code' });
    const res = await request(app)
      .post(`/api/teacher/attempts/${results.body.submissions[0].attemptId}/review`)
      .set({ Authorization: `Bearer ${other.body.token}` })
      .send({ bands: { task: 3, coherence: 3, sociolinguistic: 3, lexicon: 3, morphosyntax: 3 } });
    expect(res.status).toBe(404);
  });

  it('leaves unmarked work out of the student average instead of counting it as zero', async () => {
    const { studentAuth, assignmentId } = await setup(writingContent);
    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set(studentAuth)
      .send({ responses: [], text: 'Mon texte.' });
    const progress = await request(app).get('/api/student/progress').set(studentAuth);
    expect(progress.body.completedCount).toBe(1);
    expect(progress.body.averageScore).toBe(0);
    expect(progress.body.totalXp).toBe(25);
  });
});

describe('rubric', () => {
  it('matches the frontend grid and word count', () => {
    expect(BAND_POINTS).toEqual(frontendRubric.BAND_POINTS);
    for (const level of ['a1', 'a2', 'b1', 'b2'] as const) {
      expect(maxWritingScore(level)).toBe(frontendRubric.maxWritingScore(level));
    }
    for (const text of ["C'est l'été, n'est-ce pas ?", '  a  b\n\nc — …', 'Bonjour à tous, 12 rue des Lilas.']) {
      expect(countWords(text)).toBe(frontendRubric.countWords(text));
    }
  });
});
