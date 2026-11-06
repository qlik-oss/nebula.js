#!/usr/bin/env node
/**
 * Writes a changeset for each package with dependency updates that landed since the last release.
 *
 * Renovate runs as a hosted app, so it cannot add a changeset to each of its pull requests. The
 * release workflow runs this before `changeset version` instead: it compares the dependencies of
 * the published packages at the last `v*` tag with the ones on the current branch and describes
 * the difference in `.changeset/dependency-updates-<package>.md`, one file for each package so
 * that the changelog of a package lists its own updates only, a line for each dependency from the
 * range of the last release to the current one. The Version Packages pull request carries them to
 * the changelogs and the version.
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
const CHANGESET_PREFIX = 'dependency-updates-';

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

const renderChangeset = ({ name, updates }) => {
  const lines = [...new Set(updates.map(({ name: dep, from, to }) => `- \`${dep}\` from \`${from}\` to \`${to}\``))];
  return `---\n'${name}': patch\n---\n\nUpdate dependencies\n\n${lines.join('\n')}\n`;
};

const changesetFile = ({ name }) => `${CHANGESET_PREFIX}${name.replace(/^@/, '').replace(/[^a-z0-9.]+/gi, '-')}.md`;

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
  const files = changes.map((change) => ({ file: changesetFile(change), content: renderChangeset(change) }));
  if (!dryRun) {
    const dir = path.join(cwd, '.changeset');
    fs.readdirSync(dir)
      .filter((file) => file.startsWith(CHANGESET_PREFIX))
      .forEach((file) => fs.rmSync(path.join(dir, file)));
    files.forEach(({ file, content }) => fs.writeFileSync(path.join(dir, file), content));
  }
  return { ref, changes, files, written: !dryRun && files.length > 0 };
};

module.exports = { diffDependencies, collectChanges, renderChangeset, changesetFile, run };

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
    result.files.forEach(({ file, content }) => process.stdout.write(`# .changeset/${file}\n${content}\n`));
    process.stdout.write(result.written ? `Wrote ${result.files.length} changesets\n` : 'Dry run, nothing written\n');
  }
}
