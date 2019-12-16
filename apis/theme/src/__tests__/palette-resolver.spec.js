import paletteResolverFn from '../palette-resolver';

describe('palette-resolver', () => {
  it('dataScales()', () => {
    expect(
      paletteResolverFn({
        scales: [
          {
            propertyValue: 'p',
            name: 'name',
            translation: 't',
            type: 'type',
            scale: 'scale',
          },
        ],
      }).dataScales()
    ).to.eql([
      {
        key: 'p',
        name: 'name',
        translation: 't',
        type: 'type',
        colors: 'scale',
        scheme: true,
      },
    ]);
  });

  it('dataPalettes()', () => {
    expect(
      paletteResolverFn({
        palettes: {
          data: [
            {
              propertyValue: 'p',
              name: 'name',
              translation: 't',
              type: 'type',
              scale: 'scale',
            },
          ],
        },
      }).dataPalettes()
    ).to.eql([
      {
        key: 'p',
        name: 'name',
        translation: 't',
        type: 'type',
        colors: 'scale',
      },
    ]);
  });

  it('uiPalettes()', () => {
    expect(
      paletteResolverFn({
        palettes: {
          ui: [
            {
              name: 'name',
              translation: 't',
              colors: 'colors',
            },
          ],
        },
      }).uiPalettes()
    ).to.eql([
      {
        key: 'ui',
        name: 'name',
        translation: 't',
        type: 'row',
        colors: 'colors',
      },
    ]);
  });

  it('dataColors()', () => {
    expect(
      paletteResolverFn({
        dataColors: {
          primaryColor: 'primary',
          nullColor: 'null',
          othersColor: 'others',
        },
      }).dataColors()
    ).to.eql({
      primary: 'primary',
      nil: 'null',
      others: 'others',
    });
  });

  describe('uiColor', () => {
    let p;
    let uiPalettes;
    beforeEach(() => {
      p = paletteResolverFn();
      uiPalettes = sinon.stub(p, 'uiPalettes');
    });
    afterEach(() => {
      uiPalettes.restore();
    });

    it('should return color when index < 0 or undefined', () => {
      expect(p.uiColor({ color: 'red' })).to.equal('red');
      expect(p.uiColor({ color: 'red', index: -1 })).to.equal('red');
      expect(uiPalettes.callCount).to.equal(0);
    });

    it('should return color when ui palette is falsy', () => {
      uiPalettes.returns([]);
      expect(p.uiColor({ color: 'red', index: 0 })).to.equal('red');
      expect(uiPalettes.callCount).to.equal(1);
    });

    it('should return color when index is out of bounds', () => {
      uiPalettes.returns([{ colors: ['a', 'b', 'c'] }]);
      expect(p.uiColor({ color: 'red', index: 3 })).to.equal('red');

      expect(uiPalettes.callCount).to.equal(1);
      // should keep cached palette
      p.uiColor({ color: 'red', index: 3 });
      expect(uiPalettes.callCount).to.equal(1);
    });

    it('should return index from palette when index is within bounds', () => {
      uiPalettes.returns([{ colors: ['a', 'b', 'c'] }]);
      expect(p.uiColor({ color: 'red', index: 1 })).to.equal('b');
    });
  });
});
