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

echo "PNPM"
echo "Linking packages"
(cd apis/stardust && pnpm link --global)
(cd commands/cli && pnpm link --global)
(cd commands/build && pnpm link --global)
(cd commands/serve && pnpm link --global)
cd "$PROJECT_NAME"
pnpm i --filter "$PROJECT_NAME"
pnpm link "@nebula.js/stardust"
pnpm link "@nebula.js/cli"
pnpm link "@nebula.js/cli-build"
pnpm link "@nebula.js/cli-serve"
echo "Log node_modules/@nebula.js"
ls -la node_modules/@nebula.js
if [ "$BUILD" = "true" ]; then
  pnpm run build
fi
if [ "$TEST" = "true" ]; then
  pnpm run test:e2e
fi