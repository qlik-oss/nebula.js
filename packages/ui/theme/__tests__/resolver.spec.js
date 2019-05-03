import resolver from '../resolver';

describe('resolver', () => {
  describe('creator', () => {
    it('should flatten theme', () => {
      const r = resolver({
        foo: {
          bar: 'red',
        },
      });
      expect(r.references()).to.eql({
        'foo.bar': 'red',
      });
    });

    it('should resolve theme variables', () => {
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
      expect(r.references()).to.eql({
        'shadow.colorful': '2px ocean',
        'palette.bright.primary': 'ocean',
        'palette.light': 'ocean',
      });
    });

    it('should throw when reference is cyclical', () => {
      const fn = () => resolver({
        foo: {
          bar: '4px $foo.bar',
        },
      });
      expect(fn).to.throw('Cyclical reference for "$foo.bar"');
    });
  });

  describe('resolver', () => {
    it('should resolve variable references', () => {
      const r = resolver({
        typography: {
          fontFamily: 'Arial',
        },
      });
      expect(r.resolve({
        font: '16px $typography.fontFamily',
      })).to.eql({
        font: '16px Arial',
      });
    });

    it('should resolve value references', () => {
      const r = resolver({
        typography: {
          fontFamily: 'Arial',
        },
      });
      expect(r.get('16px $typography.fontFamily')).to.eql('16px Arial');
    });
  });
});
