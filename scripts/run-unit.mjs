import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
// Windows drive-letter casing must agree between Vite's module IDs and its
// worker entrypoint; otherwise the test runner can be instantiated twice.
let root = fileURLToPath(new URL('../', import.meta.url));
if (process.platform === 'win32') root = root.replace(/^[a-z]:/, drive => drive.toUpperCase());
const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--maxWorkers=1', ...process.argv.slice(2)], { cwd: root, stdio: 'inherit', env: process.env });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;