#!/usr/bin/env bash
# Packs the packages of this branch as tarballs into the current directory and makes pnpm use them for every
# @nebula.js package, also when another package asks for one by version. The version of the packages on the
# branch of a release (x.y.z-alpha.n) is not published until the release is merged, so the registry has no
# answer to the dependencies and peer dependencies between the packages.
#
# Usage: source .github/scripts/pack_nebula.sh   (from the project, with NEBULA_ROOT set)

NEBULA_PACKAGES=(
  apis/stardust
  commands/cli
  commands/create
  commands/sense
  commands/serve
  commands/build
)

for package in "${NEBULA_PACKAGES[@]}"; do
  pnpm --dir "$NEBULA_ROOT/$package" pack --pack-destination "$PWD"
done

{
  echo "overrides:"
  for package in "${NEBULA_PACKAGES[@]}"; do
    name=$(node -p "require('$NEBULA_ROOT/$package/package.json').name")
    tarball=$(ls "./$(echo "${name#@}" | tr / -)"-[0-9]*.tgz)
    echo "  '$name': file:$tarball"
  done
} >> pnpm-workspace.yaml
