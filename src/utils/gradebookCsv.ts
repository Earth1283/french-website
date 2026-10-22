import type { GradebookResponse } from '../types/classroom';

const FORMULA_TRIGGER = /^[=+\-@\t\r]/;

export function escapeCsvCell(value: string): string {
  const neutralised = FORMULA_TRIGGER.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(neutralised) ? `"${neutralised.replace(/"/g, '""')}"` : neutralised;
}

function cellText(cell: GradebookResponse['cells'][number] | undefined): string {
  if (!cell || !cell.completed) return '';
  return cell.score === null ? 'Submitted' : String(Math.round(cell.score));
}

export function buildGradebookCsv(gradebook: GradebookResponse): string {
  const header = ['Student', 'Email', ...gradebook.assignments.map((a) => a.title), 'Average'];
  const cellsByStudentAndAssignment = new Map(
    gradebook.cells.map((cell) => [`${cell.studentId}:${cell.assignmentId}`, cell])
  );

  const rows = gradebook.roster.map((student) => [
    student.name,
    student.email,
    ...gradebook.assignments.map((a) => cellText(cellsByStudentAndAssignment.get(`${student.id}:${a.id}`))),
    student.completedAssignments > 0 ? String(Math.round(student.averageScore)) : '',
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
}
