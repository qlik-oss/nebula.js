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
  ./commands/cli/lib/index.js create mashup "$PROJECT_NAME" --install "$INSTALL" --pkgm yarn
else
  echo "Create project based on Picasso template"
  ./commands/cli/lib/index.js create "$PROJECT_NAME" --picasso "$PICASSO_TEMPLATE" --install "$INSTALL" --pkgm yarn
fi

echo "Yarn"
yarn
echo "Linking packages"
(cd apis/stardust && yarn link)
(cd commands/cli && yarn link)
(cd commands/build && yarn link)
(cd commands/serve && yarn link)
cd "$PROJECT_NAME"
yarn link "@nebula.js/stardust"
yarn link "@nebula.js/cli"
yarn link "@nebula.js/cli-build"
yarn link "@nebula.js/cli-serve"
echo "Log node_modules/@nebula.js"
ls -la node_modules/@nebula.js
if [ "$BUILD" = "true" ]; then
  yarn run build
fi
if [ "$TEST" = "true" ]; then
  yarn run test:e2e
fi