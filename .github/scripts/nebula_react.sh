#!/usr/bin/env bash
set -e

# Builds and runs the React based chart in test/ci/react-chart against this
# branch's packages, installed from tarballs the way real users would.
PROJECT_FOLDER="$1"

NEBULA_ROOT="$(pwd)"

mkdir -p "$PROJECT_FOLDER"
cp -R "$NEBULA_ROOT/test/ci/react-chart/." "$PROJECT_FOLDER"
cd "$PROJECT_FOLDER"
pnpm config set --location project ignore-scripts true

source "$NEBULA_ROOT/.github/scripts/pack_nebula.sh"

pnpm install
pnpm add ./nebula.js-stardust-*.tgz ./nebula.js-cli-[0-9]*.tgz ./nebula.js-cli-serve-*.tgz ./nebula.js-cli-build-*.tgz
pnpm add buffer@6.0.3

PARCEL_AUTOINSTALL=false pnpm run build
test -s dist/react-chart.js

if [ "${CI:-false}" = "true" ]; then
  pnpm exec playwright install chromium --with-deps
else
  pnpm exec playwright install chromium
fi
pnpm run test:e2e
