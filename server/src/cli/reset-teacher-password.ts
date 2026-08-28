import { hashPassword } from '../auth/hash.js';
import { db } from '../db/connection.js';
import { runMigrations } from '../db/migrate.js';
import { getTeacherByEmail, updateTeacherPassword } from '../db/queries/teachers.js';

const [, , email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error('Usage: npm run reset-teacher-password -- <email> <new-password>');
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

runMigrations(db);

const teacher = getTeacherByEmail(email.trim().toLowerCase());
if (!teacher) {
  console.error(`No teacher account found with email ${email}`);
  process.exit(1);
}

updateTeacherPassword(teacher.id, hashPassword(newPassword));
console.log(`Password updated for ${teacher.name} <${teacher.email}>. They'll need to log in again everywhere.`);
