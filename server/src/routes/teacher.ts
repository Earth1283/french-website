import type { Request } from 'express';
import { Router } from 'express';
import { requireTeacher } from '../auth/middleware.js';
import {
  createClass,
  getClassById,
  getRoster,
  isEnrolled,
  listClassesByTeacher,
  rotateJoinCode,
  updateClass,
} from '../db/queries/classes.js';
import {
  createContent,
  deleteContent,
  getContentById,
  hydrateContentBody,
  listContentByTeacher,
  updateContent,
} from '../db/queries/content.js';
import { createAssignment, deleteAssignment, getAssignmentById, listAssignmentsByClass } from '../db/queries/assignments.js';
import { getQuestionStatsForAssignment } from '../db/queries/attempts.js';
import { countUnresolvedFlagsByAssignment, getFlagById, listFlagsForAssignment, resolveFlag } from '../db/queries/flags.js';
import { updateStudentPassword } from '../db/queries/students.js';
import { hashPassword } from '../auth/hash.js';
import {
  createAssignmentSchema,
  createClassSchema,
  createContentSchema,
  resetStudentPasswordSchema,
  updateClassSchema,
  updateContentSchema,
} from '../lib/validation.js';

export const teacherRouter = Router();
teacherRouter.use(requireTeacher);

function ownedClass(req: Request, classId: string) {
  const cls = getClassById(classId);
  if (!cls || cls.teacher_id !== req.teacherId) return null;
  return cls;
}

function ownedContent(req: Request, contentId: string) {
  const content = getContentById(contentId);
  if (!content || content.teacher_id !== req.teacherId || content.deleted_at) return null;
  return content;
}

function promptsFromBody(bodyJson: string): string[] {
  const body = JSON.parse(bodyJson) as { kind: string; exercises?: { prompt: string }[]; items?: { prompt: string }[] };
  const list = body.kind === 'lesson' ? body.exercises : body.items;
  return (list ?? []).map((item) => item.prompt);
}

teacherRouter.get('/classes', (req, res) => {
  res.json({ classes: listClassesByTeacher(req.teacherId!) });
});

teacherRouter.post('/classes', (req, res) => {
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const cls = createClass(req.teacherId!, parsed.data.name);
  res.status(201).json({ class: cls });
});

teacherRouter.patch('/classes/:classId', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  const parsed = updateClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json({ class: updateClass(cls.id, parsed.data) });
});

teacherRouter.post('/classes/:classId/rotate-join-code', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  res.json({ class: rotateJoinCode(cls.id) });
});

teacherRouter.get('/classes/:classId/roster', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  res.json({ roster: getRoster(cls.id) });
});

teacherRouter.post('/classes/:classId/students/:studentId/reset-password', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls || !isEnrolled(req.params.studentId, cls.id)) {
    res.status(404).json({ error: 'Student not found in this class' });
    return;
  }
  const parsed = resetStudentPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  updateStudentPassword(req.params.studentId, hashPassword(parsed.data.newPassword));
  res.status(204).end();
});

teacherRouter.get('/classes/:classId/assignments', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  const flagCounts = countUnresolvedFlagsByAssignment(cls.id);
  const assignments = listAssignmentsByClass(cls.id).map((a) => ({
    ...a,
    content: getContentById(a.content_id),
    unresolvedFlagCount: flagCounts[a.id] ?? 0,
  }));
  res.json({ assignments });
});

teacherRouter.get('/classes/:classId/assignments/:assignmentId/results', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  const assignment = getAssignmentById(req.params.assignmentId);
  if (!assignment || assignment.class_id !== cls.id) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  const content = getContentById(assignment.content_id);
  const prompts = content ? promptsFromBody(content.body_json) : [];
  const questions = getQuestionStatsForAssignment(assignment.id).map((q) => ({
    ...q,
    prompt: prompts[q.index] ?? `Question ${q.index + 1}`,
  }));
  res.json({ assignment, content, questions, flags: listFlagsForAssignment(assignment.id) });
});

teacherRouter.post('/classes/:classId/assignments', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  const parsed = createAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const content = ownedContent(req, parsed.data.contentId);
  if (!content) {
    res.status(404).json({ error: 'Content not found' });
    return;
  }
  const assignment = createAssignment(cls.id, content.id, parsed.data.dueAt ?? null);
  res.status(201).json({ assignment });
});

teacherRouter.delete('/assignments/:assignmentId', (req, res) => {
  const assignment = getAssignmentById(req.params.assignmentId);
  if (!assignment || !ownedClass(req, assignment.class_id)) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  deleteAssignment(assignment.id);
  res.status(204).end();
});

teacherRouter.post('/flags/:flagId/resolve', (req, res) => {
  const flag = getFlagById(req.params.flagId);
  if (!flag) {
    res.status(404).json({ error: 'Flag not found' });
    return;
  }
  const assignment = getAssignmentById(flag.assignment_id);
  if (!assignment || !ownedClass(req, assignment.class_id)) {
    res.status(404).json({ error: 'Flag not found' });
    return;
  }
  res.json({ flag: resolveFlag(flag.id) });
});

teacherRouter.get('/content', (req, res) => {
  res.json({ content: listContentByTeacher(req.teacherId!) });
});

teacherRouter.post('/content', (req, res) => {
  const parsed = createContentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const content = createContent(req.teacherId!, parsed.data.title, parsed.data.subtitle, parsed.data.body);
  res.status(201).json({ content });
});

teacherRouter.get('/content/:contentId', (req, res) => {
  const content = ownedContent(req, req.params.contentId);
  if (!content) {
    res.status(404).json({ error: 'Content not found' });
    return;
  }
  res.json({ content: { ...content, body: hydrateContentBody(content) } });
});

teacherRouter.put('/content/:contentId', (req, res) => {
  const content = ownedContent(req, req.params.contentId);
  if (!content) {
    res.status(404).json({ error: 'Content not found' });
    return;
  }
  const parsed = updateContentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json({ content: updateContent(content.id, parsed.data) });
});

teacherRouter.delete('/content/:contentId', (req, res) => {
  const content = ownedContent(req, req.params.contentId);
  if (!content) {
    res.status(404).json({ error: 'Content not found' });
    return;
  }
  deleteContent(content.id);
  res.status(204).end();
});
