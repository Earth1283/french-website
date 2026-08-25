import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const DATA_DIR = resolve(process.env.DATA_DIR || 'data');
mkdirSync(DATA_DIR, { recursive: true });

function loadOrCreateJwtSecret(): string {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv) return fromEnv;

  const secretPath = resolve(DATA_DIR, 'secret.key');
  if (existsSync(secretPath)) {
    return readFileSync(secretPath, 'utf8').trim();
  }

  const generated = randomBytes(32).toString('hex');
  writeFileSync(secretPath, generated, { mode: 0o600 });
  return generated;
}

export const config = {
  port: Number(process.env.PORT) || 8443,
  dbPath: resolve(process.env.DB_PATH || resolve(DATA_DIR, 'classroom.sqlite3')),
  corsOrigin: process.env.CORS_ORIGIN?.trim() || '*',
  jwtSecret: loadOrCreateJwtSecret(),
  tlsCertPath: process.env.TLS_CERT_PATH?.trim() || null,
  tlsKeyPath: process.env.TLS_KEY_PATH?.trim() || null,
  teacherSignupCode: process.env.TEACHER_SIGNUP_CODE?.trim() || null,
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 10,
  dataDir: DATA_DIR,
};

// Make sure the directory for the configured DB file exists even if DB_PATH
// points somewhere other than the default data/ dir.
mkdirSync(dirname(config.dbPath), { recursive: true });
