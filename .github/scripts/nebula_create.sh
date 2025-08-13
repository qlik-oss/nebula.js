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
echo "***Rewriting package.json for pnpm file: protocol local linking***"
node <<'EOF'
const fs = require('fs');
const path = require('path');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const nebulaDeps = {
  '@nebula.js/cli': '../../commands/cli',
  '@nebula.js/cli-build': '../../commands/build',
  '@nebula.js/cli-serve': '../../commands/serve',
  '@nebula.js/cli-sense': '../../commands/sense',
};
if (!pkg.devDependencies) pkg.devDependencies = {};
Object.entries(nebulaDeps).forEach(([dep, relPath]) => {
  if (pkg.devDependencies[dep]) {
    pkg.devDependencies[dep] = `file:${relPath}`;
  }
});
// Peer dependency for stardust
if (pkg.peerDependencies && pkg.peerDependencies['@nebula.js/stardust']) {
  pkg.peerDependencies['@nebula.js/stardust'] = 'file:../../apis/stardust';
}
pkg.packageManager = 'pnpm@10.12.1';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
EOF
echo "***Package.json***"
cat package.json
echo "***PNPM install***"
pnpm install
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