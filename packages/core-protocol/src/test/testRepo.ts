import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export function createTempRepoRoot(prefix: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(root, '.git'));
  return root;
}

export function cleanupTempRepoRoot(root: string): void {
  fs.rmSync(root, { recursive: true, force: true });
}
