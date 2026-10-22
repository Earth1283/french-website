import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;

const quizBody = {
  kind: 'quiz',
  items: [{ type: 'fill-blank', prompt: 'Je ___ français', answer: 'parle' }],
  xpReward: 10,
};

async function registerTeacher(email = 'curie@example.com') {
  const res = await request(app)
    .post('/api/auth/teacher/register')
    .send({ name: 'Ms. Curie', email, password: 'supersecret1', signupCode: 'test-invite-code' });
  return res.body.token as string;
}

async function registerStudent(email = 'alex@example.com') {
  const res = await request(app)
    .post('/api/auth/student/register')
    .send({ name: 'Alex', email, password: 'studentpass1' });
  return { token: res.body.token as string, id: res.body.student.id as string };
}

async function setup() {
  const teacher = await registerTeacher();
  const cls = (
    await request(app).post('/api/teacher/classes').set('Authorization', `Bearer ${teacher}`).send({ name: 'Period 1' })
  ).body.class;
  const student = await registerStudent();
  await request(app)
    .post('/api/student/enroll')
    .set('Authorization', `Bearer ${student.token}`)
    .send({ joinCode: cls.join_code });
  const content = (
    await request(app)
      .post('/api/teacher/content')
      .set('Authorization', `Bearer ${teacher}`)
      .send({ title: 'Quiz 1', body: quizBody })
  ).body.content;
  const assignment = (
    await request(app)
      .post(`/api/teacher/classes/${cls.id}/assignments`)
      .set('Authorization', `Bearer ${teacher}`)
      .send({ contentId: content.id })
  ).body.assignment;
  return { teacher, student, cls, assignment };
}

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(() => resetDb(db));

describe('announcements', () => {
  it('lets a teacher post, pin and delete; enrolled students read pinned first', async () => {
    const { teacher, student, cls } = await setup();
    const post = (title: string, pinned = false) =>
      request(app)
        .post(`/api/teacher/classes/${cls.id}/announcements`)
        .set('Authorization', `Bearer ${teacher}`)
        .send({ title, body: 'Bring a dictionary', pinned });

    const first = await post('Quiz on Friday');
    expect(first.status).toBe(201);
    await post('Pinned note', true);

    const read = await request(app)
      .get(`/api/student/classes/${cls.id}/announcements`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(read.body.announcements.map((a: { title: string }) => a.title)).toEqual(['Pinned note', 'Quiz on Friday']);

    const pinned = await request(app)
      .patch(`/api/teacher/announcements/${first.body.announcement.id}`)
      .set('Authorization', `Bearer ${teacher}`)
      .send({ pinned: true });
    expect(pinned.body.announcement.pinned).toBe(1);

    const del = await request(app)
      .delete(`/api/teacher/announcements/${first.body.announcement.id}`)
      .set('Authorization', `Bearer ${teacher}`);
    expect(del.status).toBe(204);
  });

  it('hides announcements from students outside the class and from other teachers', async () => {
    const { cls, teacher } = await setup();
    await request(app)
      .post(`/api/teacher/classes/${cls.id}/announcements`)
      .set('Authorization', `Bearer ${teacher}`)
      .send({ title: 'Private' });

    const outsider = await registerStudent('outsider@example.com');
    const asStudent = await request(app)
      .get(`/api/student/classes/${cls.id}/announcements`)
      .set('Authorization', `Bearer ${outsider.token}`);
    expect(asStudent.status).toBe(404);

    const otherTeacher = await registerTeacher('other@example.com');
    const asTeacher = await request(app)
      .post(`/api/teacher/classes/${cls.id}/announcements`)
      .set('Authorization', `Bearer ${otherTeacher}`)
      .send({ title: 'Nope' });
    expect(asTeacher.status).toBe(404);
  });

  it('rejects an empty title', async () => {
    const { cls, teacher } = await setup();
    const res = await request(app)
      .post(`/api/teacher/classes/${cls.id}/announcements`)
      .set('Authorization', `Bearer ${teacher}`)
      .send({ title: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('assignment due date and visibility', () => {
  it('updates the due date and clears it again', async () => {
    const { teacher, assignment } = await setup();
    const due = '2030-01-01T12:00:00.000Z';
    const set = await request(app)
      .patch(`/api/teacher/assignments/${assignment.id}`)
      .set('Authorization', `Bearer ${teacher}`)
      .send({ dueAt: due });
    expect(set.body.assignment.due_at).toBe(due);

    const cleared = await request(app)
      .patch(`/api/teacher/assignments/${assignment.id}`)
      .set('Authorization', `Bearer ${teacher}`)
      .send({ dueAt: null });
    expect(cleared.body.assignment.due_at).toBeNull();
  });

  it('hides a hidden assignment from the student list and direct access', async () => {
    const { teacher, student, cls, assignment } = await setup();
    await request(app)
      .patch(`/api/teacher/assignments/${assignment.id}`)
      .set('Authorization', `Bearer ${teacher}`)
      .send({ visible: false });

    const list = await request(app)
      .get(`/api/student/classes/${cls.id}/assignments`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(list.body.assignments).toHaveLength(0);

    const direct = await request(app)
      .get(`/api/student/assignments/${assignment.id}`)
      .set('Authorization', `Bearer ${student.token}`);
    expect(direct.status).toBe(404);

    const submit = await request(app)
      .post(`/api/student/assignments/${assignment.id}/attempts`)
      .set('Authorization', `Bearer ${student.token}`)
      .send({ responses: [{ index: 0, answerGiven: 'parle' }] });
    expect(submit.status).toBe(404);
  });

  it("won't let another teacher edit the assignment", async () => {
    const { assignment } = await setup();
    const other = await registerTeacher('other@example.com');
    const res = await request(app)
      .patch(`/api/teacher/assignments/${assignment.id}`)
      .set('Authorization', `Bearer ${other}`)
      .send({ visible: false });
    expect(res.status).toBe(404);
  });
});

describe('leaving and removing students', () => {
  async function submitAttempt(token: string, assignmentId: string) {
    await request(app)
      .post(`/api/student/assignments/${assignmentId}/attempts`)
      .set('Authorization', `Bearer ${token}`)
      .send({ responses: [{ index: 0, answerGiven: 'parle' }] });
  }

  it('lets a teacher remove a student and their results in that class', async () => {
    const { teacher, student, cls, assignment } = await setup();
    await submitAttempt(student.token, assignment.id);

    const del = await request(app)
      .delete(`/api/teacher/classes/${cls.id}/students/${student.id}`)
      .set('Authorization', `Bearer ${teacher}`);
    expect(del.status).toBe(204);

    const roster = await request(app)
      .get(`/api/teacher/classes/${cls.id}/roster`)
      .set('Authorization', `Bearer ${teacher}`);
    expect(roster.body.roster).toHaveLength(0);
    expect(db.prepare('SELECT COUNT(*) AS n FROM attempts').get()).toEqual({ n: 0 });
  });

  it('404s when removing a student who is not in the class', async () => {
    const { teacher, cls } = await setup();
    const stranger = await registerStudent('stranger@example.com');
    const res = await request(app)
      .delete(`/api/teacher/classes/${cls.id}/students/${stranger.id}`)
      .set('Authorization', `Bearer ${teacher}`);
    expect(res.status).toBe(404);
  });

  it('lets a student leave a class', async () => {
    const { student, cls } = await setup();
    const res = await request(app).delete(`/api/student/classes/${cls.id}`).set('Authorization', `Bearer ${student.token}`);
    expect(res.status).toBe(204);

    const classes = await request(app).get('/api/student/classes').set('Authorization', `Bearer ${student.token}`);
    expect(classes.body.classes).toHaveLength(0);
  });
});

describe('roster activity and gradebook', () => {
  it('reports last activity and the gradebook cells for enrolled students', async () => {
    const { teacher, student, cls, assignment } = await setup();
    const before = await request(app)
      .get(`/api/teacher/classes/${cls.id}/roster`)
      .set('Authorization', `Bearer ${teacher}`);
    expect(before.body.roster[0].lastActiveAt).toBeNull();

    await request(app)
      .post(`/api/student/assignments/${assignment.id}/attempts`)
      .set('Authorization', `Bearer ${student.token}`)
      .send({ responses: [{ index: 0, answerGiven: 'parle' }] });

    const book = await request(app)
      .get(`/api/teacher/classes/${cls.id}/gradebook`)
      .set('Authorization', `Bearer ${teacher}`);
    expect(book.status).toBe(200);
    expect(book.body.assignments).toHaveLength(1);
    expect(book.body.roster[0].lastActiveAt).not.toBeNull();
    expect(book.body.cells).toEqual([
      { studentId: student.id, assignmentId: assignment.id, completed: true, score: 100 },
    ]);
  });

  it('keeps the gradebook private to the class owner', async () => {
    const { cls } = await setup();
    const other = await registerTeacher('other@example.com');
    const res = await request(app)
      .get(`/api/teacher/classes/${cls.id}/gradebook`)
      .set('Authorization', `Bearer ${other}`);
    expect(res.status).toBe(404);
  });
});
