import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { evaluateAttemptPolicy } from '../src/lib/attemptPolicy.js';
import { buildStudentReports, type ActivityInput } from '../src/lib/classInsights.js';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

const quizBody = {
  kind: 'quiz',
  items: [{ type: 'fill-blank', prompt: 'Je ___ français', answer: 'parle' }],
  xpReward: 10,
};

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString();

async function registerTeacher(email = 'curie@example.com') {
  const res = await request(app)
    .post('/api/auth/teacher/register')
    .send({ name: 'Ms. Curie', email, password: 'supersecret1', signupCode: 'test-invite-code' });
  return res.body.token as string;
}

async function registerStudent(email = 'alex@example.com') {
  const res = await request(app).post('/api/auth/student/register').send({ name: 'Alex', email, password: 'studentpass1' });
  return { token: res.body.token as string, id: res.body.student.id as string };
}

async function setup(assignmentOptions: Record<string, unknown> = {}) {
  const teacher = await registerTeacher();
  const cls = (await request(app).post('/api/teacher/classes').set(auth(teacher)).send({ name: 'Period 1' })).body.class;
  const student = await registerStudent();
  await request(app).post('/api/student/enroll').set(auth(student.token)).send({ joinCode: cls.join_code });
  const content = (
    await request(app).post('/api/teacher/content').set(auth(teacher)).send({ title: 'Quiz 1', body: quizBody })
  ).body.content;
  const assignment = (
    await request(app)
      .post(`/api/teacher/classes/${cls.id}/assignments`)
      .set(auth(teacher))
      .send({ contentId: content.id, ...assignmentOptions })
  ).body.assignment;
  return { teacher, student, cls, content, assignment };
}

const submit = (token: string, assignmentId: string) =>
  request(app)
    .post(`/api/student/assignments/${assignmentId}/attempts`)
    .set(auth(token))
    .send({ responses: [{ index: 0, answerGiven: 'parle' }] });

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('attempt policy', () => {
  const base = { dueAt: null, acceptLate: true, maxAttempts: null, override: null, attemptsUsed: 0 };
  const now = new Date('2026-10-22T12:00:00Z');

  it('is open by default, however many times a student has gone', () => {
    expect(evaluateAttemptPolicy({ ...base, attemptsUsed: 9, now })).toMatchObject({ closed: null, attemptsLeft: null });
  });

  it('closes once the attempt limit is used up, and reopens with extra attempts', () => {
    const limited = { ...base, maxAttempts: 2, attemptsUsed: 2, now };
    expect(evaluateAttemptPolicy(limited)).toMatchObject({ closed: 'attempts', attemptsLeft: 0 });
    expect(evaluateAttemptPolicy({ ...limited, override: { dueAt: null, extraAttempts: 1 } })).toMatchObject({
      closed: null,
      attemptsAllowed: 3,
      attemptsLeft: 1,
    });
  });

  it('only closes at the due date when late work is not accepted, and a personal extension wins', () => {
    const pastDue = { ...base, dueAt: '2026-10-21T12:00:00Z', now };
    expect(evaluateAttemptPolicy(pastDue).closed).toBeNull();
    expect(evaluateAttemptPolicy({ ...pastDue, acceptLate: false }).closed).toBe('late');
    const extended = evaluateAttemptPolicy({
      ...pastDue,
      acceptLate: false,
      override: { dueAt: '2026-10-30T12:00:00Z', extraAttempts: 0 },
    });
    expect(extended).toMatchObject({ closed: null, effectiveDueAt: '2026-10-30T12:00:00Z' });
  });
});

describe('student reports', () => {
  const now = new Date('2026-10-22T12:00:00Z');
  const student = (id: string, joinedAt = '2026-09-01 08:00:00') => ({ id, name: id, email: `${id}@x.com`, joinedAt });
  const assignment = (id: string, dueAt: string | null, kind: 'quiz' | 'writing' = 'quiz') => ({
    id,
    title: id,
    kind,
    dueAt,
    maxAttempts: null,
    acceptLate: true,
  });
  const attempt = (studentId: string, assignmentId: string, score: number | null, completedAt = '2026-10-21 08:00:00') => ({
    studentId,
    assignmentId,
    completedAt,
    score,
    hasSubmissionText: score === null,
    attemptCount: 1,
  });
  const report = (input: Partial<ActivityInput>) =>
    buildStudentReports({ students: [], assignments: [], attempts: [], overrides: [], ...input }, now);

  it('flags overdue, not-started, inactive and struggling students', () => {
    const [overdue, idle, stale, weak, fine] = report({
      students: [student('overdue'), student('idle'), student('stale'), student('weak'), student('fine')],
      assignments: [assignment('a1', '2026-10-01T00:00:00Z'), assignment('a2', null), assignment('a3', null)],
      attempts: [
        attempt('overdue', 'a2', 90),
        attempt('stale', 'a1', 90, '2026-10-05 08:00:00'),
        attempt('stale', 'a2', 90, '2026-10-05 08:00:00'),
        attempt('weak', 'a1', 30),
        attempt('weak', 'a2', 40),
        attempt('fine', 'a1', 90),
        attempt('fine', 'a2', 90),
        attempt('fine', 'a3', 90),
      ],
    });
    expect(overdue.reasons).toEqual(['overdue']);
    expect(overdue.overdue).toBe(1);
    expect(idle.reasons).toEqual(['overdue', 'not-started']);
    expect(stale.reasons).toEqual(['inactive']);
    expect(weak.reasons).toEqual(['struggling']);
    expect(fine.reasons).toEqual([]);
  });

  it('gives a new student a grace period and does not count deadlines from before they joined', () => {
    const [newcomer] = report({
      students: [student('new', '2026-10-21 08:00:00')],
      assignments: [assignment('old', '2026-10-01T00:00:00Z'), assignment('open', null)],
    });
    expect(newcomer.reasons).toEqual([]);
    expect(newcomer.overdue).toBe(0);
  });

  it('does not count a single bad score as struggling, and keeps ungraded work out of the average', () => {
    const [one, essay] = report({
      students: [student('one'), student('essay')],
      assignments: [assignment('a1', null), assignment('w1', null, 'writing')],
      attempts: [attempt('one', 'a1', 20), attempt('essay', 'w1', null), attempt('essay', 'a1', 80)],
    });
    expect(one.reasons).toEqual([]);
    expect(essay.averageScore).toBe(80);
    expect(essay.awaitingReview).toBe(1);
    expect(essay.byKind).toEqual([{ kind: 'quiz', averageScore: 80, count: 1 }]);
  });

  it('uses a personal extension as the due date', () => {
    const [extended] = report({
      students: [student('s')],
      assignments: [assignment('a1', '2026-10-01T00:00:00Z'), assignment('a2', null)],
      attempts: [attempt('s', 'a2', 90)],
      overrides: [{ studentId: 's', assignmentId: 'a1', dueAt: '2026-11-01T00:00:00Z', extraAttempts: 0 }],
    });
    expect(extended.overdue).toBe(0);
    expect(extended.assignments.find((a) => a.assignmentId === 'a1')?.dueAt).toBe('2026-11-01T00:00:00Z');
  });
});

describe('attention and student detail endpoints', () => {
  it('lists overdue students for the class and returns one student in full', async () => {
    const { teacher, student, cls, assignment } = await setup({ dueAt: iso(-2) });
    db.prepare("UPDATE enrollments SET joined_at = datetime('now', '-30 days')").run();
    const attention = await request(app).get(`/api/teacher/classes/${cls.id}/attention`).set(auth(teacher));
    expect(attention.status).toBe(200);
    expect(attention.body.students[0]).toMatchObject({ id: student.id, overdue: 1, reasons: ['overdue', 'not-started'] });
    expect(attention.body.students[0].assignments).toBeUndefined();

    const detail = await request(app).get(`/api/teacher/classes/${cls.id}/students/${student.id}`).set(auth(teacher));
    expect(detail.body.student.assignments[0]).toMatchObject({ assignmentId: assignment.id, status: 'overdue' });
  });

  it('keeps other teachers out', async () => {
    const { student, cls } = await setup();
    const other = await registerTeacher('other@example.com');
    expect((await request(app).get(`/api/teacher/classes/${cls.id}/attention`).set(auth(other))).status).toBe(404);
    expect((await request(app).get(`/api/teacher/classes/${cls.id}/students/${student.id}`).set(auth(other))).status).toBe(404);
  });
});

describe('attempt limits, deadlines and retakes', () => {
  it('stays unlimited by default', async () => {
    const { student, assignment } = await setup();
    for (let i = 0; i < 3; i++) expect((await submit(student.token, assignment.id)).status).toBe(201);
  });

  it('refuses attempts past the limit until the teacher grants a retake', async () => {
    const { teacher, student, assignment } = await setup({ maxAttempts: 1 });
    expect((await submit(student.token, assignment.id)).status).toBe(201);

    const blocked = await submit(student.token, assignment.id);
    expect(blocked.status).toBe(403);
    expect(blocked.body.closed).toBe('attempts');

    const shown = await request(app).get(`/api/student/assignments/${assignment.id}`).set(auth(student.token));
    expect(shown.body.policy).toMatchObject({ attemptsUsed: 1, attemptsAllowed: 1, attemptsLeft: 0, closed: 'attempts' });

    const retake = await request(app)
      .post(`/api/teacher/assignments/${assignment.id}/students/${student.id}/retake`)
      .set(auth(teacher));
    expect(retake.body.override.extra_attempts).toBe(1);
    expect((await submit(student.token, assignment.id)).status).toBe(201);
    expect((await submit(student.token, assignment.id)).status).toBe(403);
  });

  it('rejects a retake on an unlimited assignment', async () => {
    const { teacher, student, assignment } = await setup();
    const res = await request(app)
      .post(`/api/teacher/assignments/${assignment.id}/students/${student.id}/retake`)
      .set(auth(teacher));
    expect(res.status).toBe(400);
  });

  it('closes at the due date when late work is off, and a personal extension reopens it', async () => {
    const { teacher, student, assignment } = await setup({ dueAt: iso(-1), acceptLate: false });
    const closed = await submit(student.token, assignment.id);
    expect(closed.status).toBe(403);
    expect(closed.body.closed).toBe('late');

    const extension = iso(3);
    const set = await request(app)
      .put(`/api/teacher/assignments/${assignment.id}/students/${student.id}/override`)
      .set(auth(teacher))
      .send({ dueAt: extension });
    expect(set.body.override.due_at).toBe(extension);
    expect((await submit(student.token, assignment.id)).status).toBe(201);

    const list = await request(app).get(`/api/student/classes/${assignment.class_id}/assignments`).set(auth(student.token));
    expect(list.body.assignments[0].due_at).toBe(extension);

    await request(app).delete(`/api/teacher/assignments/${assignment.id}/students/${student.id}/override`).set(auth(teacher));
    expect((await submit(student.token, assignment.id)).status).toBe(403);
  });

  it('a retake on a date-locked assignment also gives the student time to do it', async () => {
    const { teacher, student, assignment } = await setup({ dueAt: iso(-1), acceptLate: false, maxAttempts: 1 });
    await request(app)
      .post(`/api/teacher/assignments/${assignment.id}/students/${student.id}/retake`)
      .set(auth(teacher));
    expect((await submit(student.token, assignment.id)).status).toBe(201);
  });

  it('lets a teacher change the limits on an existing assignment', async () => {
    const { teacher, assignment } = await setup();
    const res = await request(app)
      .patch(`/api/teacher/assignments/${assignment.id}`)
      .set(auth(teacher))
      .send({ maxAttempts: 3, acceptLate: false });
    expect(res.body.assignment).toMatchObject({ max_attempts: 3, accept_late: 0 });
    const cleared = await request(app).patch(`/api/teacher/assignments/${assignment.id}`).set(auth(teacher)).send({ maxAttempts: null });
    expect(cleared.body.assignment.max_attempts).toBeNull();
  });

  it("won't override another teacher's student", async () => {
    const { student, assignment } = await setup({ maxAttempts: 1 });
    const other = await registerTeacher('other@example.com');
    const res = await request(app)
      .post(`/api/teacher/assignments/${assignment.id}/students/${student.id}/retake`)
      .set(auth(other));
    expect(res.status).toBe(404);
  });
});

describe('reuse tools', () => {
  it('assigns content to several classes, skipping ones that already have it', async () => {
    const { teacher, cls, content } = await setup();
    const second = (await request(app).post('/api/teacher/classes').set(auth(teacher)).send({ name: 'Period 2' })).body.class;
    const res = await request(app)
      .post('/api/teacher/assignments/bulk')
      .set(auth(teacher))
      .send({ contentId: content.id, classIds: [cls.id, second.id], maxAttempts: 2 });
    expect(res.body).toEqual({ created: [second.id], skipped: [cls.id] });
    const list = await request(app).get(`/api/teacher/classes/${second.id}/assignments`).set(auth(teacher));
    expect(list.body.assignments[0]).toMatchObject({ content_id: content.id, max_attempts: 2 });
  });

  it("won't bulk-assign into someone else's class", async () => {
    const { content, cls } = await setup();
    const other = await registerTeacher('other@example.com');
    const mine = (await request(app).post('/api/teacher/classes').set(auth(other)).send({ name: 'Mine' })).body.class;
    const res = await request(app)
      .post('/api/teacher/assignments/bulk')
      .set(auth(other))
      .send({ contentId: content.id, classIds: [mine.id] });
    expect(res.status).toBe(404);
    const stolen = await request(app)
      .post('/api/teacher/assignments/bulk')
      .set(auth(other))
      .send({ contentId: (await request(app).post('/api/teacher/content').set(auth(other)).send({ title: 'x', body: quizBody })).body.content.id, classIds: [cls.id] });
    expect(stolen.status).toBe(404);
  });

  it('duplicates content, including reading pages on disk', async () => {
    const { teacher, content } = await setup();
    const copy = await request(app).post(`/api/teacher/content/${content.id}/duplicate`).set(auth(teacher)).send({});
    expect(copy.status).toBe(201);
    expect(copy.body.content).toMatchObject({ title: 'Quiz 1 (copy)', kind: 'quiz' });
    expect(copy.body.content.id).not.toBe(content.id);

    const reading = (
      await request(app)
        .post('/api/teacher/content')
        .set(auth(teacher))
        .send({ title: 'Chapter', body: { kind: 'reading', pages: ['# One\n\nBonjour', '# Two\n\nSalut'], xpReward: 5, gradable: false } })
    ).body.content;
    const readingCopy = (
      await request(app).post(`/api/teacher/content/${reading.id}/duplicate`).set(auth(teacher)).send({ title: 'Chapter v2' })
    ).body.content;
    const fetched = await request(app).get(`/api/teacher/content/${readingCopy.id}`).set(auth(teacher));
    expect(fetched.body.content.body.pages).toEqual(['# One\n\nBonjour', '# Two\n\nSalut']);
  });

  it('rolls a class over with hidden, undated assignments and no students', async () => {
    const { teacher, cls, assignment } = await setup({ dueAt: iso(5), maxAttempts: 2 });
    await request(app)
      .post(`/api/teacher/classes/${cls.id}/announcements`)
      .set(auth(teacher))
      .send({ title: 'Welcome', pinned: true });

    const res = await request(app)
      .post(`/api/teacher/classes/${cls.id}/duplicate`)
      .set(auth(teacher))
      .send({ name: 'Period 1 — spring', copyAnnouncements: true });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ copiedAssignments: 1, copiedAnnouncements: 1 });
    expect(res.body.class.join_code).not.toBe(cls.join_code);

    const copied = await request(app).get(`/api/teacher/classes/${res.body.class.id}/assignments`).set(auth(teacher));
    expect(copied.body.assignments[0]).toMatchObject({
      content_id: assignment.content_id,
      due_at: null,
      visible: 0,
      max_attempts: 2,
    });
    const roster = await request(app).get(`/api/teacher/classes/${res.body.class.id}/roster`).set(auth(teacher));
    expect(roster.body.roster).toEqual([]);
  });
});

describe('question bank', () => {
  const mc = { type: 'multiple-choice', prompt: 'Bonjour means?', answer: 'Hello', options: ['Hello', 'Bye'], tags: ['Greetings', 'greetings'] };

  it('stores, edits and deletes questions per teacher, normalising tags', async () => {
    const teacher = await registerTeacher();
    const created = await request(app).post('/api/teacher/bank').set(auth(teacher)).send(mc);
    expect(created.status).toBe(201);
    expect(created.body.question).toMatchObject({ options: ['Hello', 'Bye'], tags: ['greetings'] });

    const edited = await request(app)
      .put(`/api/teacher/bank/${created.body.question.id}`)
      .set(auth(teacher))
      .send({ ...mc, prompt: 'What does bonjour mean?' });
    expect(edited.body.question.prompt).toBe('What does bonjour mean?');

    const other = await registerTeacher('other@example.com');
    expect((await request(app).get('/api/teacher/bank').set(auth(other))).body.questions).toEqual([]);
    expect((await request(app).put(`/api/teacher/bank/${created.body.question.id}`).set(auth(other)).send(mc)).status).toBe(404);
    const foreignDelete = await request(app).post('/api/teacher/bank/delete').set(auth(other)).send({ ids: [created.body.question.id] });
    expect(foreignDelete.body.removed).toBe(0);

    const removed = await request(app).post('/api/teacher/bank/delete').set(auth(teacher)).send({ ids: [created.body.question.id] });
    expect(removed.body.removed).toBe(1);
  });

  it('rejects a multiple-choice question whose answer is not an option', async () => {
    const teacher = await registerTeacher();
    const res = await request(app).post('/api/teacher/bank').set(auth(teacher)).send({ ...mc, answer: 'Cheese' });
    expect(res.status).toBe(400);
  });

  it('imports in bulk and skips questions it already has', async () => {
    const teacher = await registerTeacher();
    const fill = { type: 'fill-blank', prompt: 'Je ___ français', answer: 'parle' };
    const first = await request(app).post('/api/teacher/bank/import').set(auth(teacher)).send({ questions: [mc, fill, fill] });
    expect(first.body.created).toHaveLength(2);
    expect(first.body.skipped).toBe(1);

    const again = await request(app)
      .post('/api/teacher/bank/import')
      .set(auth(teacher))
      .send({ questions: [{ ...fill, prompt: ' JE ___ FRANÇAIS ' }] });
    expect(again.body).toMatchObject({ created: [], skipped: 1 });
  });
});
