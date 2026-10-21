@echo off
cd /d "%~dp0.."
call npx prettier --write src/web/FlagshipHome.tsx src/web/ProductVisual.tsx src/web/flagship.css src/web/components.tsx src/shared/content.ts tests/validation.test.ts e2e/luxury.spec.ts e2e/flagship.spec.ts > flagship-format.log 2>&1
call npm run typecheck > flagship-typecheck.log 2>&1
echo %errorlevel% > flagship-typecheck.exit
call npm run lint > flagship-lint.log 2>&1
echo %errorlevel% > flagship-lint.exit
call npm run format:check > flagship-formatcheck.log 2>&1
echo %errorlevel% > flagship-formatcheck.exit
call npm run build > flagship-build.log 2>&1
echo %errorlevel% > flagship-build.exit
call npm test > flagship-unit.log 2>&1
echo %errorlevel% > flagship-unit.exit
call npm run test:e2e > flagship-e2e.log 2>&1
echo %errorlevel% > flagship-e2e.exit
echo finished > flagship-validation.done