import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const secret = randomBytes(32).toString('hex');
await writeFile('.dev.vars', `ENVIRONMENT=development\nLOCAL_TEST_MODE=true\nPAYMENT_PROVIDER=mock\nSEND_CONFIRMATIONS=true\nADMIN_BOOTSTRAP_SECRET=${secret}\nPUBLIC_SITE_URL=http://localhost:8787\n`);
await writeFile('.test-bootstrap-secret', secret);
console.log('Generated private local-only bootstrap secret and development configuration. No remote secrets changed.');