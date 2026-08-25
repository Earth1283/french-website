import { createServer } from 'node:https';
import { app } from './app.js';
import { config } from './config.js';
import { db } from './db/connection.js';
import { runMigrations } from './db/migrate.js';
import { listListenUrls, loadTlsMaterial } from './tls/bootstrap.js';

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
