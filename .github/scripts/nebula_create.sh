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
  ./commands/cli/lib/index.js create mashup "$PROJECT_NAME" --install false --pkgm yarn
else
  echo "Create project based on Picasso template"
  ./commands/cli/lib/index.js create "$PROJECT_NAME" --picasso "$PICASSO_TEMPLATE" --install false --pkgm yarn
fi
touch "$PROJECT_NAME"/yarn.lock
if [ "$INSTALL" = "true" ]; then
  echo "Install generated project dependencies"
  YARN_ENABLE_HARDENED_MODE=0 YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn --cwd "$PROJECT_NAME" install
fi
echo "Linking packages"
cd "$PROJECT_NAME"
yarn link ../../apis/stardust
yarn link ../../commands/cli
yarn link ../../commands/serve
yarn link ../../commands/build
echo "Log node_modules/@nebula.js"
ls -la node_modules/@nebula.js
if [ "$BUILD" = "true" ]; then
  if [ "$MASHUP" = "true" ]; then
    NODE_OPTIONS=--preserve-symlinks yarn run build
  else
    yarn run build
  fi
fi
if [ "$TEST" = "true" ]; then
  echo "Installing Playwright browser for this generated project"
  if [ "${CI:-false}" = "true" ]; then
    yarn playwright install chromium --with-deps
  else
    yarn playwright install chromium
  fi
  yarn run test:e2e
fi