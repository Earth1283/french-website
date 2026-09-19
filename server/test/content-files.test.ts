import { existsSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type Database from 'better-sqlite3';
import type { Express } from 'express';
import request from 'supertest';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestApp, resetDb } from './setup.js';

let app: Express;
let db: Database.Database;
let auth: { Authorization: string };

const contentFilesDir = () => join(process.env.DATA_DIR!, 'content-files');

const readingBody = (pages: string[], title = 'Long read') => ({
  title,
  body: { kind: 'reading', pages, xpReward: 10, gradable: true },
});

beforeAll(async () => {
  ({ app, db } = await createTestApp());
});

beforeEach(async () => {
  resetDb(db);
  rmSync(contentFilesDir(), { recursive: true, force: true });
  const reg = await request(app)
    .post('/api/auth/teacher/register')
    .send({ name: 'Ms. Curie', email: 'curie@example.com', password: 'supersecret1' });
  auth = { Authorization: `Bearer ${reg.body.token}` };
});

afterEach(() => vi.restoreAllMocks());

async function createReading(pages: string[]): Promise<string> {
  const res = await request(app).post('/api/teacher/content').set(auth).send(readingBody(pages));
  return res.body.content.id;
}

describe('reading page files', () => {
  it('leaves nothing but the content directory behind after repeated rewrites', async () => {
    const id = await createReading(['# One\n\na', '# Two\n\nb']);
    await request(app).put(`/api/teacher/content/${id}`).set(auth).send(readingBody(['# Only\n\nc']));
    await request(app).put(`/api/teacher/content/${id}`).set(auth).send(readingBody(['# A\n\nx', '# B\n\ny', '# C\n\nz']));

    expect(readdirSync(contentFilesDir())).toEqual([id]);
    expect(readdirSync(join(contentFilesDir(), id))).toEqual(['01.md', '02.md', '03.md']);
  });

  it('removes the page files when reading content is turned into a lesson', async () => {
    const id = await createReading(['# One\n\na']);
    const res = await request(app)
      .put(`/api/teacher/content/${id}`)
      .set(auth)
      .send({
        body: {
          kind: 'lesson',
          exercises: [{ type: 'fill-blank', prompt: 'Merci = ___', answer: 'merci' }],
        },
      });
    expect(res.status).toBe(200);
    expect(existsSync(join(contentFilesDir(), id))).toBe(false);
  });
});

describe('when the page files cannot be written', () => {
  function breakContentFiles(): () => void {
    rmSync(contentFilesDir(), { recursive: true, force: true });
    writeFileSync(contentFilesDir(), 'a file where the directory should be');
    return () => rmSync(contentFilesDir(), { force: true });
  }

  it('does not leave a content row behind for a failed create', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const restore = breakContentFiles();

    const res = await request(app).post('/api/teacher/content').set(auth).send(readingBody(['# One\n\na']));
    restore();

    expect(res.status).toBe(500);
    expect(db.prepare('SELECT COUNT(*) AS n FROM content_items').get()).toEqual({ n: 0 });
  });

  it('keeps the previous title and pages when an update fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const id = await createReading(['# Original\n\nkeep me']);
    const backup = `${contentFilesDir()}.backup`;
    renameSync(contentFilesDir(), backup);
    writeFileSync(contentFilesDir(), 'a file where the directory should be');

    const failed = await request(app)
      .put(`/api/teacher/content/${id}`)
      .set(auth)
      .send(readingBody(['# Replacement\n\nlost'], 'New title'));

    rmSync(contentFilesDir(), { force: true });
    renameSync(backup, contentFilesDir());
    expect(failed.status).toBe(500);

    const fetched = await request(app).get(`/api/teacher/content/${id}`).set(auth);
    expect(fetched.body.content.title).toBe('Long read');
    expect(fetched.body.content.body.pages).toEqual(['# Original\n\nkeep me']);
  });
});
