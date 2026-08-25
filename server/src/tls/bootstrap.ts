import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { join } from 'node:path';
import selfsigned from 'selfsigned';
import { config } from '../config.js';

export interface TlsMaterial {
  cert: string;
  key: string;
  selfSigned: boolean;
}

function detectLanIps(): string[] {
  const ips: string[] = [];
  for (const iface of Object.values(networkInterfaces())) {
    for (const addr of iface ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) ips.push(addr.address);
    }
  }
  return ips;
}

function generateSelfSigned(): TlsMaterial {
  const certsDir = join(config.dataDir, 'certs');
  const certPath = join(certsDir, 'cert.pem');
  const keyPath = join(certsDir, 'key.pem');

  if (existsSync(certPath) && existsSync(keyPath)) {
    return { cert: readFileSync(certPath, 'utf8'), key: readFileSync(keyPath, 'utf8'), selfSigned: true };
  }

  mkdirSync(certsDir, { recursive: true });
  const altNames = [
    { type: 2, value: 'localhost' },
    { type: 7, ip: '127.0.0.1' },
    ...detectLanIps().map((ip) => ({ type: 7, ip })),
  ];
  const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
    days: 825,
    keySize: 2048,
    extensions: [{ name: 'subjectAltName', altNames }],
  });

  writeFileSync(certPath, pems.cert, { mode: 0o644 });
  writeFileSync(keyPath, pems.private, { mode: 0o600 });
  return { cert: pems.cert, key: pems.private, selfSigned: true };
}

export function loadTlsMaterial(): TlsMaterial {
  if (config.tlsCertPath && config.tlsKeyPath) {
    return {
      cert: readFileSync(config.tlsCertPath, 'utf8'),
      key: readFileSync(config.tlsKeyPath, 'utf8'),
      selfSigned: false,
    };
  }
  return generateSelfSigned();
}

export function listListenUrls(port: number): string[] {
  return ['localhost', ...detectLanIps()].map((host) => `https://${host}:${port}`);
}
