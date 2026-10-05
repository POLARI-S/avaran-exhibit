#!/usr/bin/env node
// Pre-commit safety net: refuses a commit if it stages anything that this project's
// own README says must never reach the public repo — even via `git add -f`, which
// silently defeats .gitignore. Belt-and-suspenders on top of .gitignore, not a
// replacement for it. Installed per clone with: git config core.hooksPath .githooks
// (.githooks/pre-commit runs this script).
import { execSync } from 'node:child_process';

const FORBIDDEN = [
  /^source-assets\//,
  /^qa\//,
  /(^|\/)\.env(\..*)?$/,
  /(^|\/).*secret.*/i,
  /(^|\/).*-private\./i,
];

const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const blocked = staged.filter(path => FORBIDDEN.some(pattern => pattern.test(path)));

if (blocked.length) {
  console.error('\nCommit blocked — these staged paths match a forbidden pattern:\n');
  for (const path of blocked) console.error(`  ${path}`);
  console.error(
    '\nThese are excluded from the public repo per README.md ("excluded from source-control' +
    '\ntracking and public delivery" / "never part of the public site"). If this is wrong,' +
    '\nedit the FORBIDDEN list in scripts/pre-commit-guard.js — do not bypass with --no-verify' +
    '\nunless you are certain.\n'
  );
  process.exit(1);
}
