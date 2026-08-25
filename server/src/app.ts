import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { studentRouter } from './routes/student.js';
import { teacherRouter } from './routes/teacher.js';

export const app = express();

app.use(cors({ origin: config.corsOrigin, exposedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/student', studentRouter);

// Not a real page — just enough for a teacher/student who types the bare
// server URL into a browser (a very natural sanity check) to see the server
// is alive instead of hitting a raw JSON 404.
app.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html><head><meta charset="utf-8"><title>French Classroom Server</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1.5rem; color: #222;">
  <h1>✅ French Classroom Server is running</h1>
  <p>This is an API server for Oh Non! Le French Website's classroom feature — it has no pages of its own.</p>
  <p>If you're a teacher or student, go back to the main site and use the <strong>Connect to a Class</strong> screen, pasting in this server's address.</p>
  <p><a href="/api/health">/api/health</a> for a machine-readable status check.</p>
</body></html>`);
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
