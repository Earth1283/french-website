import { Router } from 'express';
import { requireStudent } from '../auth/middleware.js';
import { enrollStudent, getClassByJoinCode, isEnrolled, listClassesForStudent } from '../db/queries/classes.js';
import { getAssignmentById, listAssignmentsForStudent } from '../db/queries/assignments.js';
import { getContentById } from '../db/queries/content.js';
import { listAttemptsForStudent, recordAttempt } from '../db/queries/attempts.js';
import { createFlag } from '../db/queries/flags.js';
import { createFlagSchema, enrollSchema, submitAttemptSchema } from '../lib/validation.js';

export const studentRouter = Router();
studentRouter.use(requireStudent);

studentRouter.post('/enroll', (req, res) => {
  const parsed = enrollSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const cls = getClassByJoinCode(parsed.data.joinCode.toUpperCase());
  if (!cls || cls.archived_at) {
    res.status(404).json({ error: 'No class found with that join code' });
    return;
  }
  enrollStudent(req.studentId!, cls.id);
  res.status(201).json({ class: cls });
});

studentRouter.get('/classes', (req, res) => {
  res.json({ classes: listClassesForStudent(req.studentId!) });
});

studentRouter.get('/classes/:classId/assignments', (req, res) => {
  if (!isEnrolled(req.studentId!, req.params.classId)) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  res.json({ assignments: listAssignmentsForStudent(req.studentId!, req.params.classId) });
});

studentRouter.get('/assignments/:assignmentId', (req, res) => {
  const assignment = getAssignmentById(req.params.assignmentId);
  if (!assignment || !isEnrolled(req.studentId!, assignment.class_id)) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  const content = getContentById(assignment.content_id);
  if (!content) {
    res.status(404).json({ error: 'Assignment content not found' });
    return;
  }
  res.json({
    assignment,
    content: {
      id: content.id,
      title: content.title,
      subtitle: content.subtitle,
      kind: content.kind,
      body: JSON.parse(content.body_json),
    },
  });
});

studentRouter.post('/assignments/:assignmentId/attempts', (req, res) => {
  const assignment = getAssignmentById(req.params.assignmentId);
  if (!assignment || !isEnrolled(req.studentId!, assignment.class_id)) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  const parsed = submitAttemptSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const attempt = recordAttempt(
    req.studentId!,
    assignment.id,
    parsed.data.responses,
    parsed.data.score,
    parsed.data.xpEarned
  );
  res.status(201).json({ attempt });
});

studentRouter.post('/assignments/:assignmentId/flags', (req, res) => {
  const assignment = getAssignmentById(req.params.assignmentId);
  if (!assignment || !isEnrolled(req.studentId!, assignment.class_id)) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  const parsed = createFlagSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const flag = createFlag(req.studentId!, assignment.id, parsed.data.questionIndex, parsed.data.reason);
  res.status(201).json({ flag });
});

studentRouter.get('/progress', (req, res) => {
  const attempts = listAttemptsForStudent(req.studentId!);
  const completed = attempts.filter((a) => a.completed_at);
  const totalXp = completed.reduce((sum, a) => sum + (a.xp_earned ?? 0), 0);
  const averageScore = completed.length
    ? completed.reduce((sum, a) => sum + (a.score ?? 0), 0) / completed.length
    : 0;
  res.json({ totalXp, averageScore, completedCount: completed.length, attempts });
});
