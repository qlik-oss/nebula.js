/**
 * @jest-environment node
 */
const { diffDependencies, collectChanges, renderChangeset, changesetFile } = require('../renovate-changeset.cjs');

describe('renovate-changeset', () => {
  describe('diffDependencies', () => {
    test('reports a changed range of a runtime dependency', () => {
      expect(diffDependencies({ dependencies: { a: '^1.0.0' } }, { dependencies: { a: '^1.1.0' } })).toEqual([
        { field: 'dependencies', name: 'a', from: '^1.0.0', to: '^1.1.0' },
      ]);
    });

    test('covers peer and optional dependencies', () => {
      const changes = diffDependencies(
        { peerDependencies: { p: '^1.0.0' }, optionalDependencies: { o: '1.0.0' } },
        { peerDependencies: { p: '^2.0.0' }, optionalDependencies: { o: '1.0.1' } }
      );
      expect(changes.map(({ field, name }) => `${field}:${name}`)).toEqual([
        'peerDependencies:p',
        'optionalDependencies:o',
      ]);
    });

    test('ignores devDependencies', () => {
      expect(diffDependencies({ devDependencies: { a: '1.0.0' } }, { devDependencies: { a: '2.0.0' } })).toEqual([]);
    });

    test('ignores unchanged, added and removed dependencies', () => {
      expect(
        diffDependencies(
          { dependencies: { same: '1.0.0', removed: '1.0.0' } },
          { dependencies: { same: '1.0.0', added: '1.0.0' } }
        )
      ).toEqual([]);
    });

    test('ignores workspace ranges', () => {
      expect(diffDependencies({ dependencies: { a: 'workspace:*' } }, { dependencies: { a: 'workspace:^' } })).toEqual(
        []
      );
    });
  });

  describe('collectChanges', () => {
    test('keeps packages with updates, sorted by name', () => {
      const changes = collectChanges([
        { name: 'b', before: { dependencies: { x: '1.0.0' } }, after: { dependencies: { x: '1.0.1' } } },
        { name: 'c', before: { dependencies: { x: '1.0.0' } }, after: { dependencies: { x: '1.0.0' } } },
        { name: 'a', before: { dependencies: { y: '1.0.0' } }, after: { dependencies: { y: '2.0.0' } } },
      ]);
      expect(changes.map(({ name }) => name)).toEqual(['a', 'b']);
    });

    test('has nothing for a package that did not exist at the release', () => {
      expect(collectChanges([{ name: 'a', before: {}, after: { dependencies: { x: '1.0.0' } } }])).toEqual([]);
    });
  });

  describe('renderChangeset', () => {
    test('writes a patch for the package and lists its updates, a line for each dependency', () => {
      const content = renderChangeset({
        name: '@nebula.js/a',
        updates: [
          { field: 'dependencies', name: 'x', from: '^1.0.0', to: '^1.1.0' },
          { field: 'peerDependencies', name: 'x', from: '^1.0.0', to: '^1.1.0' },
          { field: 'dependencies', name: 'y', from: '2.0.0', to: '2.0.1' },
        ],
      });
      expect(content).toBe(
        [
          '---',
          "'@nebula.js/a': patch",
          '---',
          '',
          'Update dependencies',
          '',
          '- `x` from `^1.0.0` to `^1.1.0`',
          '- `y` from `2.0.0` to `2.0.1`',
          '',
        ].join('\n')
      );
    });
  });

  describe('changesetFile', () => {
    test('is a file for each package', () => {
      expect(changesetFile({ name: '@nebula.js/cli-build' })).toBe('dependency-updates-nebula.js-cli-build.md');
    });
  });
});
