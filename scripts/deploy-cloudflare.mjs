// Runs inside Cloudflare Builds; no local Node.js installation is needed.
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const allowed = [
  'DATABASE_URL', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
  'AWS_ENDPOINT_URL_S3', 'AWS_REGION', 'NEON_AUTH_URL', 'NEON_AUTH_JWKS_URL',
  'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'TONA_NOTIFICATION_EMAIL',
  'NOTIFICATION_EMAIL', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_NOTIFICATION_TO', 'WHATSAPP_GRAPH_API_VERSION',
];
const secrets = Object.fromEntries(allowed.flatMap(key => process.env[key]?.trim() ? [[key, process.env[key].trim()]] : []));
if (!secrets.DATABASE_URL) {
  console.error('Add DATABASE_URL as a Secret in Cloudflare Builds variables before deploying.');
  process.exit(1);
}
try {
  if (!['postgres:', 'postgresql:'].includes(new URL(secrets.DATABASE_URL).protocol)) throw Error();
} catch {
  console.error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  process.exit(1);
}
const storageKeys = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_ENDPOINT_URL_S3', 'AWS_REGION'];
if (storageKeys.some(key => secrets[key]) && !storageKeys.every(key => secrets[key])) {
  console.error('Image storage needs all four AWS storage variables together.');
  process.exit(1);
}
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'tona-deployment-'));
try {
  const secretsFile = join(temporaryDirectory, 'secrets.json');
  writeFileSync(secretsFile, JSON.stringify(secrets), { mode: 0o600 });
  const result = spawnSync('npx', [
    '--yes', 'wrangler@4.154.0', 'deploy',
    '--config', '.output/server/wrangler.json', '--name', 'tona-coffee',
    '--secrets-file', secretsFile,
    ...(process.argv.includes('--dry-run') ? ['--dry-run'] : []),
  ], { stdio: 'inherit', env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
  if (result.error) throw new Error('Could not start Cloudflare deployment.');
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
