import type { Request } from 'express';
import { Router } from 'express';
import { requireTeacher } from '../auth/middleware.js';
import {
  createClass,
  getClassById,
  getRoster,
  listClassesByTeacher,
  rotateJoinCode,
  updateClass,
} from '../db/queries/classes.js';
import {
  createContent,
  deleteContent,
  getContentById,
  listContentByTeacher,
  updateContent,
} from '../db/queries/content.js';
import { createAssignment, deleteAssignment, getAssignmentById, listAssignmentsByClass } from '../db/queries/assignments.js';
import {
  createAssignmentSchema,
  createClassSchema,
  createContentSchema,
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
  if (!content || content.teacher_id !== req.teacherId) return null;
  return content;
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

teacherRouter.get('/classes/:classId/assignments', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  const assignments = listAssignmentsByClass(cls.id).map((a) => ({
    ...a,
    content: getContentById(a.content_id),
  }));
  res.json({ assignments });
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
  res.json({ content });
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
