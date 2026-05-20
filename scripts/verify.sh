#!/usr/bin/env bash
set -e

echo ":: TypeScript (tsc -b)…"
npx tsc -b

echo ":: Tests + coverage…"
npx vitest run --coverage

echo ":: Lint…"
npx eslint .

echo ":: Build…"
npx vite build

echo "✓ All checks passed"