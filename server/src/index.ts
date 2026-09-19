import { createServer } from 'node:https';
import { app } from './app.js';
import { config } from './config.js';
import { db } from './db/connection.js';
import { runMigrations } from './db/migrate.js';
import { listListenUrls, loadTlsMaterial } from './tls/bootstrap.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

runMigrations(db);

const tls = loadTlsMaterial();
const server = createServer({ key: tls.key, cert: tls.cert }, app);

server.listen(config.port, () => {
  console.log(`French Classroom Server listening on port ${config.port}`);
  if (tls.selfSigned) {
    console.log('Using an auto-generated self-signed certificate.');
    console.log('Visit one of these once in a browser and accept the security warning to trust it:');
  } else {
    console.log('Using the certificate configured via TLS_CERT_PATH/TLS_KEY_PATH.');
  }
  for (const url of listListenUrls(config.port)) {
    console.log(`  ${url}`);
  }
});

let shuttingDown = false;

// Let in-flight requests finish, then flush the WAL into the main database
// file and close it, so a restart or `systemctl stop` never leaves work only
// in the -wal sidecar (which a plain file copy for backup would miss).
function shutDown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down`);

  setTimeout(() => {
    console.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  server.close(() => {
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.close();
    process.exit(0);
  });
  server.closeIdleConnections();
}

process.on('SIGTERM', () => shutDown('SIGTERM'));
process.on('SIGINT', () => shutDown('SIGINT'));
