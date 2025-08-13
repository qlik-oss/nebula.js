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

cd "$PROJECT_NAME"
echo "***Rewriting package.json for pnpm workspace local linking***"
node <<'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const nebulaDeps = [
  '@nebula.js/cli',
  '@nebula.js/cli-build',
  '@nebula.js/cli-serve',
  '@nebula.js/cli-sense',
];
if (!pkg.devDependencies) pkg.devDependencies = {};
nebulaDeps.forEach(dep => {
  if (pkg.devDependencies[dep]) {
    pkg.devDependencies[dep] = 'workspace:*';
  }
});
pkg.peerDependencies['@nebula.js/stardust'] = 'workspace:*';
pkg.packageManager = 'pnpm@10.12.1';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
EOF
echo "***Package.json***"
cat package.json
echo "***PNPM install***"
pnpm install --filter "$PROJECT_NAME..."
echo "***Log node_modules/@nebula.js***"
ls -la node_modules/@nebula.js || true
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