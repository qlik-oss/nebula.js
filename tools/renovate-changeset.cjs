#!/usr/bin/env node
/**
 * Writes one changeset for the dependency updates that landed since the last release.
 *
 * Renovate runs as a hosted app, so it cannot add a changeset to each of its pull requests. The
 * release workflow runs this before `changeset version` instead: it compares the dependencies of
 * the published packages at the last `v*` tag with the ones on the current branch and describes
 * the difference in `.changeset/dependency-updates.md`, so the Version Packages pull request
 * carries the update to the changelog and the version.
 *
 * Only `dependencies`, `peerDependencies` and `optionalDependencies` are compared, since those
 * are what the consumers of a package install. `devDependencies` are not part of a release.
 *
 * Usage: node tools/renovate-changeset.cjs [--since <ref>] [--dry-run]
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'];
const CHANGESET_FILE = 'dependency-updates.md';

const isRegistryRange = (range) => typeof range === 'string' && !/^(workspace|file|link|portal):/.test(range);

/**
 * The ranges of the dependencies that exist on both sides and differ, internal packages excluded.
 */
const diffDependencies = (before = {}, after = {}) =>
  FIELDS.flatMap((field) =>
    Object.entries(after[field] || {})
      .filter(([name, to]) => {
        const from = (before[field] || {})[name];
        return from !== undefined && from !== to && isRegistryRange(from) && isRegistryRange(to);
      })
      .map(([name, to]) => ({ field, name, from: before[field][name], to }))
  );

/**
 * @param {{ name: string, before: object, after: object }[]} manifests
 * @returns {{ name: string, updates: { field: string, name: string, from: string, to: string }[] }[]}
 */
const collectChanges = (manifests) =>
  manifests
    .map(({ name, before, after }) => ({ name, updates: diffDependencies(before, after) }))
    .filter(({ updates }) => updates.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

const renderChangeset = (changes) => {
  const frontmatter = changes.map(({ name }) => `'${name}': patch`).join('\n');
  const body = changes
    .map(({ name, updates }) => {
      const lines = updates.map(({ name: dep, from, to }) => `  - \`${dep}\` from \`${from}\` to \`${to}\``);
      return `- \`${name}\`\n${lines.join('\n')}`;
    })
    .join('\n');
  return `---\n${frontmatter}\n---\n\nUpdate dependencies\n\n${body}\n`;
};

const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const lastRelease = (cwd) => git(cwd, ['describe', '--tags', '--match', 'v*', '--abbrev=0']).trim();

const publishedPackages = (cwd) =>
  git(cwd, ['ls-files', 'package.json', '*/package.json'])
    .split('\n')
    .filter(Boolean)
    .filter((file) => !file.includes('/templates/') && !file.startsWith('.github/'))
    .map((file) => ({ file, manifest: JSON.parse(fs.readFileSync(path.join(cwd, file), 'utf8')) }))
    .filter(({ manifest }) => manifest.name && manifest.version && !manifest.private);

const readAtRef = (cwd, ref, file) => {
  try {
    return JSON.parse(git(cwd, ['show', `${ref}:${file}`]));
  } catch (e) {
    return {}; // the package did not exist at that release
  }
};

const run = ({ cwd = process.cwd(), since, dryRun = false } = {}) => {
  const ref = since || lastRelease(cwd);
  const changes = collectChanges(
    publishedPackages(cwd).map(({ file, manifest }) => ({
      name: manifest.name,
      before: readAtRef(cwd, ref, file),
      after: manifest,
    }))
  );
  if (changes.length === 0) {
    return { ref, changes, written: false };
  }
  const content = renderChangeset(changes);
  if (!dryRun) {
    fs.writeFileSync(path.join(cwd, '.changeset', CHANGESET_FILE), content);
  }
  return { ref, changes, content, written: !dryRun };
};

module.exports = { diffDependencies, collectChanges, renderChangeset, run };

if (require.main === module) {
  const args = process.argv.slice(2);
  const sinceIndex = args.indexOf('--since');
  const result = run({
    since: sinceIndex >= 0 ? args[sinceIndex + 1] : undefined,
    dryRun: args.includes('--dry-run'),
  });
  if (result.changes.length === 0) {
    process.stdout.write(`No dependency updates since ${result.ref}\n`);
  } else {
    process.stdout.write(`${result.content}\n`);
    process.stdout.write(result.written ? `Wrote .changeset/${CHANGESET_FILE}\n` : 'Dry run, nothing written\n');
  }
}
