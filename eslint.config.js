import js from '@eslint/js';
import ts from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';

export default ts.config(
  { ignores: ['dist/**', 'worker-build/**', 'node_modules/**', '.wrangler/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  { files: ['scripts/**/*.mjs'], languageOptions: { globals: { document: 'readonly', console: 'readonly', process: 'readonly', fetch: 'readonly', Request: 'readonly', Response: 'readonly', setTimeout: 'readonly', URL: 'readonly', AbortSignal: 'readonly' } } },
  { files: ['src/web/**/*.{ts,tsx}'], plugins: { 'react-hooks': hooks }, rules: hooks.configs.recommended.rules },
);