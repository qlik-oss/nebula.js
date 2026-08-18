#!/usr/bin/env bash
set -e

PROJECT_NAME="$1"
PICASSO_TEMPLATE="${2:-none}"
MASHUP="${3:-false}"
INSTALL="${4:-false}"
BUILD="${5:-true}"
TEST="${6:-true}"

NEBULA_ROOT="$(pwd)"

if [ "$MASHUP" = "true" ]; then
  echo "Create mashup project"
  ./commands/cli/lib/index.js create mashup "$PROJECT_NAME" --install false --pkgm pnpm
else
  echo "Create project based on Picasso template"
  ./commands/cli/lib/index.js create "$PROJECT_NAME" --picasso "$PICASSO_TEMPLATE" --install false --pkgm pnpm
fi

cd "$PROJECT_NAME"
pnpm config set --location project ignore-scripts true

if [ "$INSTALL" = "true" ]; then
  echo "Install generated project dependencies"
  pnpm install
fi

echo "Installing packages from tarballs (simulates npm install)"
# Pack this branch's packages as tarballs so the generated project uses them
# the way real users would (no workspace symlinks, tests the 'files' field,
# prevents monorepo transitive issues like Babel 8 from stardust).
pnpm --dir "$NEBULA_ROOT/apis/stardust" pack --out "$PWD/nebula-stardust.tgz"
pnpm --dir "$NEBULA_ROOT/commands/cli" pack --out "$PWD/nebula-cli.tgz"
pnpm --dir "$NEBULA_ROOT/commands/serve" pack --out "$PWD/nebula-serve.tgz"
pnpm --dir "$NEBULA_ROOT/commands/build" pack --out "$PWD/nebula-build.tgz"

pnpm add ./nebula-stardust.tgz ./nebula-cli.tgz ./nebula-serve.tgz ./nebula-build.tgz
pnpm add buffer@6.0.3

echo "Log node_modules/@nebula.js"
ls -la node_modules/@nebula.js

if [ "$BUILD" = "true" ]; then
  PARCEL_AUTOINSTALL=false pnpm run build
fi

if [ "$TEST" = "true" ]; then
  echo "Installing Playwright browser for this generated project"
  if [ "${CI:-false}" = "true" ]; then
    pnpm exec playwright install chromium --with-deps
  else
    pnpm exec playwright install chromium
  fi
  pnpm run test:e2e
fi
