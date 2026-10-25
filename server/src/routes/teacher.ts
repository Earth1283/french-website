import type { Request } from 'express';
import { Router } from 'express';
import { requireTeacher } from '../auth/middleware.js';
import {
  createClass,
  getClassById,
  getGradebookCells,
  getRoster,
  isEnrolled,
  listClassesByTeacher,
  rotateJoinCode,
  unenrollStudent,
  updateClass,
} from '../db/queries/classes.js';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  listAnnouncementsByClass,
  updateAnnouncement,
} from '../db/queries/announcements.js';
import {
  createContent,
  deleteContent,
  getContentById,
  hydrateContentBody,
  listContentByTeacher,
  updateContent,
} from '../db/queries/content.js';
import {
  createAssignment,
  deleteAssignment,
  deleteOverride,
  getAssignmentById,
  getOverride,
  isContentAssignedToClass,
  listAssignmentsByClass,
  updateAssignment,
  upsertOverride,
} from '../db/queries/assignments.js';
import {
  createBankQuestion,
  deleteBankQuestions,
  getBankQuestion,
  importBankQuestions,
  listBankQuestions,
  updateBankQuestion,
} from '../db/queries/bank.js';
import { getClassActivity } from '../db/queries/classActivity.js';
import { db } from '../db/connection.js';
import { buildStudentReports } from '../lib/classInsights.js';
import {
  getAttemptById,
  getQuestionStatsForAssignment,
  listSubmissionsForAssignment,
  reviewAttempt,
} from '../db/queries/attempts.js';
import { countUnresolvedFlagsByAssignment, getFlagById, listFlagsForAssignment, resolveFlag } from '../db/queries/flags.js';
import { updateStudentPassword } from '../db/queries/students.js';
import { hashPassword } from '../auth/hash.js';
import { bandsToPercent, countWords } from '../lib/rubric.js';
import {
  assignmentOverrideSchema,
  bankQuestionSchema,
  bulkAssignSchema,
  createAnnouncementSchema,
  createAssignmentSchema,
  createClassSchema,
  createContentSchema,
  deleteBankSchema,
  duplicateClassSchema,
  duplicateContentSchema,
  importBankSchema,
  resetStudentPasswordSchema,
  reviewAttemptSchema,
  updateAnnouncementSchema,
  updateAssignmentSchema,
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
  const body = JSON.parse(bodyJson) as {
    kind: string;
    exercises?: { prompt: string }[];
    items?: { prompt: string }[];
    questions?: { prompt: string }[];
  };
  const list = body.kind === 'lesson' ? body.exercises : body.kind === 'listening' || body.kind === 'reading' ? body.questions : body.items;
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

teacherRouter.post('/classes/:classId/students/:studentId/reset-password', async (req, res) => {
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
  updateStudentPassword(req.params.studentId, await hashPassword(parsed.data.newPassword));
  res.status(204).end();
});

teacherRouter.delete('/classes/:classId/students/:studentId', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls || !isEnrolled(req.params.studentId, cls.id)) {
    res.status(404).json({ error: 'Student not found in this class' });
    return;
  }
  unenrollStudent(req.params.studentId, cls.id);
  res.status(204).end();
});

teacherRouter.get('/classes/:classId/gradebook', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  res.json({
    assignments: listAssignmentsByClass(cls.id).map((a) => ({ id: a.id, title: a.title, kind: a.kind, due_at: a.due_at })),
    roster: getRoster(cls.id),
    cells: getGradebookCells(cls.id),
  });
});

teacherRouter.get('/classes/:classId/announcements', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  res.json({ announcements: listAnnouncementsByClass(cls.id) });
});

teacherRouter.post('/classes/:classId/announcements', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  const parsed = createAnnouncementSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { title, body, pinned } = parsed.data;
  res.status(201).json({ announcement: createAnnouncement(cls.id, title, body, pinned) });
});

function ownedAnnouncement(req: Request, announcementId: string) {
  const announcement = getAnnouncementById(announcementId);
  if (!announcement || !ownedClass(req, announcement.class_id)) return null;
  return announcement;
}

teacherRouter.patch('/announcements/:announcementId', (req, res) => {
  const announcement = ownedAnnouncement(req, req.params.announcementId);
  if (!announcement) {
    res.status(404).json({ error: 'Announcement not found' });
    return;
  }
  const parsed = updateAnnouncementSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json({ announcement: updateAnnouncement(announcement.id, parsed.data) });
});

teacherRouter.delete('/announcements/:announcementId', (req, res) => {
  const announcement = ownedAnnouncement(req, req.params.announcementId);
  if (!announcement) {
    res.status(404).json({ error: 'Announcement not found' });
    return;
  }
  deleteAnnouncement(announcement.id);
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
  const submissions = listSubmissionsForAssignment(assignment.id).map((s) => ({
    attemptId: s.id,
    studentId: s.student_id,
    studentName: s.studentName,
    text: s.submission_text,
    wordCount: countWords(s.submission_text ?? ''),
    submittedAt: s.completed_at,
    reviewedAt: s.reviewed_at,
    score: s.score,
    review: s.review_json ? JSON.parse(s.review_json) : null,
  }));
  res.json({ assignment, content, questions, submissions, flags: listFlagsForAssignment(assignment.id) });
});

// Marks a writing submission with the DELF grid: one band (0–3) per
// criterion, plus written feedback the student sees on the assignment.
teacherRouter.post('/attempts/:attemptId/review', (req, res) => {
  const attempt = getAttemptById(req.params.attemptId);
  const assignment = attempt ? getAssignmentById(attempt.assignment_id) : undefined;
  if (!attempt || !assignment || !ownedClass(req, assignment.class_id)) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }
  const content = getContentById(assignment.content_id);
  const body = content ? hydrateContentBody(content) : null;
  if (!body || body.kind !== 'writing' || !attempt.completed_at) {
    res.status(400).json({ error: 'Only submitted writing can be reviewed' });
    return;
  }
  const parsed = reviewAttemptSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const score = bandsToPercent(body.level, parsed.data.bands);
  res.json({ attempt: reviewAttempt(attempt.id, score, parsed.data) });
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
  const { dueAt, maxAttempts, acceptLate } = parsed.data;
  const assignment = createAssignment(cls.id, content.id, { dueAt, maxAttempts, acceptLate });
  res.status(201).json({ assignment });
});

// Assigns one piece of content to several of the teacher's classes in one go.
// A class that already has it is skipped rather than given a second copy.
teacherRouter.post('/assignments/bulk', (req, res) => {
  const parsed = bulkAssignSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const content = ownedContent(req, parsed.data.contentId);
  if (!content) {
    res.status(404).json({ error: 'Content not found' });
    return;
  }
  const classes = [...new Set(parsed.data.classIds)].map((id) => ownedClass(req, id));
  if (classes.some((c) => !c)) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  const { dueAt, maxAttempts, acceptLate } = parsed.data;
  const created: string[] = [];
  const skipped: string[] = [];
  db.transaction(() => {
    for (const cls of classes) {
      if (isContentAssignedToClass(cls!.id, content.id)) {
        skipped.push(cls!.id);
        continue;
      }
      createAssignment(cls!.id, content.id, { dueAt, maxAttempts, acceptLate });
      created.push(cls!.id);
    }
  })();
  res.status(201).json({ created, skipped });
});

// A rollover for a new term: same name pattern, fresh join code, no students.
// Assignments come across hidden and undated so the teacher sets the new
// timetable before students see anything.
teacherRouter.post('/classes/:classId/duplicate', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  const parsed = duplicateClassSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const copy = db.transaction(() => {
    const created = createClass(req.teacherId!, parsed.data.name);
    let copiedAssignments = 0;
    if (parsed.data.copyAssignments) {
      for (const a of listAssignmentsByClass(cls.id).reverse()) {
        createAssignment(created.id, a.content_id, {
          maxAttempts: a.max_attempts,
          acceptLate: !!a.accept_late,
          visible: false,
        });
        copiedAssignments += 1;
      }
    }
    let copiedAnnouncements = 0;
    if (parsed.data.copyAnnouncements) {
      for (const a of listAnnouncementsByClass(cls.id).reverse()) {
        createAnnouncement(created.id, a.title, a.body, !!a.pinned);
        copiedAnnouncements += 1;
      }
    }
    return { class: created, copiedAssignments, copiedAnnouncements };
  })();
  res.status(201).json(copy);
});

teacherRouter.get('/classes/:classId/attention', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  if (!cls) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }
  const students = buildStudentReports(getClassActivity(cls.id)).map(({ assignments: _a, byKind: _k, ...summary }) => summary);
  res.json({ students });
});

teacherRouter.get('/classes/:classId/students/:studentId', (req, res) => {
  const cls = ownedClass(req, req.params.classId);
  const student = cls ? buildStudentReports(getClassActivity(cls.id)).find((s) => s.id === req.params.studentId) : undefined;
  if (!student) {
    res.status(404).json({ error: 'Student not found in this class' });
    return;
  }
  res.json({ student });
});

function ownedStudentAssignment(req: Request, assignmentId: string, studentId: string) {
  const assignment = getAssignmentById(assignmentId);
  const cls = assignment ? ownedClass(req, assignment.class_id) : null;
  if (!assignment || !cls || !isEnrolled(studentId, cls.id)) return null;
  return assignment;
}

// Gives one student one more attempt. If the assignment locks at its due
// date and that has passed, the student also gets a week to do it.
teacherRouter.post('/assignments/:assignmentId/students/:studentId/retake', (req, res) => {
  const assignment = ownedStudentAssignment(req, req.params.assignmentId, req.params.studentId);
  if (!assignment) {
    res.status(404).json({ error: 'Student not found on this assignment' });
    return;
  }
  if (assignment.max_attempts === null) {
    res.status(400).json({ error: 'This assignment has unlimited attempts already' });
    return;
  }
  const current = getOverride(assignment.id, req.params.studentId);
  const effectiveDue = current?.due_at ?? assignment.due_at;
  const lockedByDate = !assignment.accept_late && !!effectiveDue && new Date(effectiveDue).getTime() < Date.now();
  const override = upsertOverride(assignment.id, req.params.studentId, {
    extraAttempts: (current?.extra_attempts ?? 0) + 1,
    ...(lockedByDate ? { dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } : {}),
  });
  res.json({ override });
});

teacherRouter.put('/assignments/:assignmentId/students/:studentId/override', (req, res) => {
  const assignment = ownedStudentAssignment(req, req.params.assignmentId, req.params.studentId);
  if (!assignment) {
    res.status(404).json({ error: 'Student not found on this assignment' });
    return;
  }
  const parsed = assignmentOverrideSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json({ override: upsertOverride(assignment.id, req.params.studentId, { dueAt: parsed.data.dueAt }) });
});

teacherRouter.delete('/assignments/:assignmentId/students/:studentId/override', (req, res) => {
  const assignment = ownedStudentAssignment(req, req.params.assignmentId, req.params.studentId);
  if (!assignment) {
    res.status(404).json({ error: 'Student not found on this assignment' });
    return;
  }
  deleteOverride(assignment.id, req.params.studentId);
  res.status(204).end();
});

teacherRouter.patch('/assignments/:assignmentId', (req, res) => {
  const assignment = getAssignmentById(req.params.assignmentId);
  if (!assignment || !ownedClass(req, assignment.class_id)) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  const parsed = updateAssignmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json({ assignment: updateAssignment(assignment.id, parsed.data) });
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

teacherRouter.post('/content/:contentId/duplicate', (req, res) => {
  const content = ownedContent(req, req.params.contentId);
  if (!content) {
    res.status(404).json({ error: 'Content not found' });
    return;
  }
  const parsed = duplicateContentSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const title = parsed.data.title ?? `${content.title.slice(0, 190)} (copy)`;
  res.status(201).json({ content: createContent(req.teacherId!, title, content.subtitle, hydrateContentBody(content)) });
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

function unownedReadingIds(req: Request, questions: { readingId?: string | null }[]): string[] {
  const ids = new Set(questions.map((q) => q.readingId).filter((id): id is string => !!id));
  return [...ids].filter((id) => ownedContent(req, id)?.kind !== 'reading');
}

teacherRouter.get('/bank', (req, res) => {
  res.json({ questions: listBankQuestions(req.teacherId!) });
});

teacherRouter.post('/bank', (req, res) => {
  const parsed = bankQuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (unownedReadingIds(req, [parsed.data]).length) {
    res.status(404).json({ error: 'Reading article not found' });
    return;
  }
  res.status(201).json({ question: createBankQuestion(req.teacherId!, parsed.data) });
});

teacherRouter.post('/bank/import', (req, res) => {
  const parsed = importBankSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (unownedReadingIds(req, parsed.data.questions).length) {
    res.status(404).json({ error: 'Reading article not found' });
    return;
  }
  res.status(201).json(importBankQuestions(req.teacherId!, parsed.data.questions));
});

teacherRouter.put('/bank/:questionId', (req, res) => {
  const existing = getBankQuestion(req.params.questionId);
  if (!existing || existing.teacherId !== req.teacherId) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }
  const parsed = bankQuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  if (unownedReadingIds(req, [parsed.data]).length) {
    res.status(404).json({ error: 'Reading article not found' });
    return;
  }
  res.json({ question: updateBankQuestion(existing.id, parsed.data) });
});

teacherRouter.post('/bank/delete', (req, res) => {
  const parsed = deleteBankSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json({ removed: deleteBankQuestions(req.teacherId!, parsed.data.ids) });
});
