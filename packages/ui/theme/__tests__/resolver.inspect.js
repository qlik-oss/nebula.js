import resolver from '../resolver';

describe('resolver', () => {
  describe('creator', () => {
    test('should flatten theme', () => {
      const r = resolver({
        foo: {
          bar: 'red',
        },
      });
      expect(r.references()).toEqual({
        'foo.bar': 'red',
      });
    });

    test('should resolve theme variables', () => {
      const r = resolver({
        shadow: {
          colorful: '2px $palette.bright.primary',
        },
        palette: {
          bright: {
            primary: '$palette.light',
          },
          light: 'ocean',
        },
      });
      expect(r.references()).toEqual({
        'shadow.colorful': '2px ocean',
        'palette.bright.primary': 'ocean',
        'palette.light': 'ocean',
      });
    });

    test('should throw when reference is cyclical', () => {
      const fn = () =>
        resolver({
          foo: {
            bar: '4px $foo.bar',
          },
        });
      expect(fn).toThrow('Cyclical reference for "$foo.bar"');
    });
  });

  describe('resolver', () => {
    test('should resolve variable references', () => {
      const r = resolver({
        typography: {
          fontFamily: 'Arial',
        },
      });
      expect(
        r.resolve({
          font: '16px $typography.fontFamily',
        })
      ).toEqual({
        font: '16px Arial',
      });
    });

    test('should resolve value references', () => {
      const r = resolver({
        typography: {
          fontFamily: 'Arial',
        },
      });
      expect(r.get('16px $typography.fontFamily')).toBe('16px Arial');
    });
  });
});
