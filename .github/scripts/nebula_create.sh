#!/usr/bin/env bash
set -e

PROJECT_NAME="$1"
PICASSO_TEMPLATE="${2:-none}"
MASHUP="${3:-false}"
INSTALL="${4:-false}"
BUILD="${5:-true}"
TEST="${6:-true}"

if [ "$MASHUP" = "true" ]; then
  echo "Create mashup project"
  ./commands/cli/lib/index.js create mashup "$PROJECT_NAME" --install "$INSTALL" --pkgm pnpm
else
  echo "Create project based on Picasso template"
  ./commands/cli/lib/index.js create "$PROJECT_NAME" --picasso "$PICASSO_TEMPLATE" --install "$INSTALL" --pkgm pnpm
fi

# Install all dependencies from the monorepo root (ensure generated/* is in pnpm-workspace.yaml)
echo "***PNPM install (from monorepo root)***"
pnpm install --no-lockfile
cd "$PROJECT_NAME"
echo "***Log node_modules/@nebula.js***"
ls -la node_modules/@nebula.js || true
echo "***Log node_modules/.bin***"
ls -la node_modules/.bin/nebula || true
echo "***Package.json***"
cat package.json
if [ "$BUILD" = "true" ]; then
  echo "***BUILD***"
  pnpm run build
fi
echo "***Package.json***"
cat package.json
if [ "$TEST" = "true" ]; then
  echo "***TEST***"
  pnpm run test:e2e
fi