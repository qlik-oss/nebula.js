#!/usr/bin/env bash
set -e

PROJECT_NAME="$1"
PICASSO_TEMPLATE="${2:-none}"
MASHUP="${3:-false}"
INSTALL="${4:-false}"
BUILD="${5:-true}"
TEST="${6:-true}"
TYPESCRIPT="${7:-false}"
TEST_SPEC="${8:-false}"

if [ "$MASHUP" = "true" ]; then
  echo "Create mashup project"
  ./commands/cli/lib/index.js create mashup "$PROJECT_NAME" --install "$INSTALL" --pkgm yarn
elif [ "$TYPESCRIPT" = "true" ]; then
  echo "Create TypeScript project"
  ./commands/cli/lib/index.js create "$PROJECT_NAME" --typescript --install "$INSTALL" --pkgm yarn
else
  echo "Create project based on Picasso template"
  ./commands/cli/lib/index.js create "$PROJECT_NAME" --picasso "$PICASSO_TEMPLATE" --install "$INSTALL" --pkgm yarn
fi
touch "$PROJECT_NAME"/yarn.lock
echo "Yarn"
YARN_ENABLE_HARDENED_MODE=0 yarn
echo "Linking packages"
cd "$PROJECT_NAME"
yarn link ../../apis/stardust
yarn link ../../commands/cli
yarn link ../../commands/build
yarn link ../../commands/serve
echo "Log node_modules/@nebula.js"
ls -la node_modules/@nebula.js
if [ "$TEST_SPEC" = "true" ]; then
  echo "Running spec command..."
  yarn run spec
  echo "Verifying generated files..."
  if [ ! -f "generated/generated-default-properties.ts" ]; then
    echo "ERROR: generated-default-properties.ts was not created"
    exit 1
  fi
  # Find the schema file dynamically (name depends on package.json name)
  SCHEMA_FILE=$(find generated -name "*-properties.schema.json" | head -n 1)
  if [ -z "$SCHEMA_FILE" ]; then
    echo "ERROR: JSON schema file was not created"
    exit 1
  fi
  echo "✓ Spec command generated files successfully:"
  echo "  - generated-default-properties.ts"
  echo "  - $SCHEMA_FILE"
  # Verify schema structure
  if ! grep -q '"$id"' "$SCHEMA_FILE"; then
    echo "ERROR: Schema file missing \$id field"
    exit 1
  fi
  if ! grep -q '"definitions"' "$SCHEMA_FILE"; then
    echo "ERROR: Schema file missing definitions"
    exit 1
  fi
  echo "✓ Schema file structure validated"
  # Verify defaults file structure
  if ! grep -q "const.*Defaults.*:" "generated/generated-default-properties.ts"; then
    echo "ERROR: Defaults file has incorrect structure"
    exit 1
  fi
  echo "✓ Defaults file structure validated"
fi
if [ "$BUILD" = "true" ]; then
  yarn run build
fi
if [ "$TEST" = "true" ]; then
  yarn run test:e2e
fi