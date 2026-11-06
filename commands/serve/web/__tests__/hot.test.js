import provided from '../../lib/provided-modules';

jest.mock('@nebula.js/stardust', () => ({ embed: () => {}, useElement: () => {}, 'not-a-name': 1 }));

describe('hot', () => {
  let hot;
  beforeEach(async () => {
    hot = await import('../hot');
  });

  test('shares the modules that the build of serve leaves out of a visualization', () => {
    expect(Object.keys(hot.SHARED).sort()).toEqual([...provided].sort());
  });

  describe('shimSource', () => {
    test('has the named exports and the default export of the module', () => {
      const source = hot.shimSource('@nebula.js/stardust', { embed: 1, useElement: 2, default: 3 });
      expect(source).toContain('globalThis.nebulaShared["@nebula.js/stardust"]');
      expect(source).toContain('export const embed = shared["embed"];');
      expect(source).toContain('export const useElement = shared["useElement"];');
      expect(source).toContain('export default shared.default !== undefined ? shared.default : shared;');
      expect(source).not.toContain('export const default');
    });

    test('leaves out a name that is not an identifier', () => {
      expect(hot.shimSource('m', { 'not-a-name': 1, ok: 2 })).not.toContain('not-a-name');
    });
  });
});
