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

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
