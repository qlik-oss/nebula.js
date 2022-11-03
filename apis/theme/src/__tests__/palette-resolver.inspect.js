import paletteResolverFn from '../palette-resolver';

describe('palette-resolver', () => {
  test('dataScales()', () => {
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
    ).toEqual([
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

  test('dataPalettes()', () => {
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
    ).toEqual([
      {
        key: 'p',
        name: 'name',
        translation: 't',
        type: 'type',
        colors: 'scale',
      },
    ]);
  });

  test('uiPalettes()', () => {
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
    ).toEqual([
      {
        key: 'ui',
        name: 'name',
        translation: 't',
        type: 'row',
        colors: 'colors',
      },
    ]);
  });

  test('dataColors()', () => {
    expect(
      paletteResolverFn({
        dataColors: {
          primaryColor: 'primary',
          nullColor: 'null',
          othersColor: 'others',
        },
      }).dataColors()
    ).toEqual({
      primary: 'primary',
      nil: 'null',
      others: 'others',
    });
  });

  describe('uiColor', () => {
    let p;
    let uiPalettesMock;

    beforeEach(() => {
      uiPalettesMock = jest.fn();
      p = paletteResolverFn();
      jest.spyOn(p, 'uiPalettes').mockImplementation(uiPalettesMock);
    });
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    test('should return color when index < 0 or undefined', () => {
      expect(p.uiColor({ color: 'red' })).toBe('red');
      expect(p.uiColor({ color: 'red', index: -1 })).toBe('red');
      expect(uiPalettesMock).toHaveBeenCalledTimes(0);
    });

    test('should return color when ui palette is falsy', () => {
      uiPalettesMock.mockReturnValue([]);
      expect(p.uiColor({ color: 'red', index: 0 })).toEqual('red');
      expect(uiPalettesMock).toHaveBeenCalledTimes(1);
    });

    test('should return color when index is out of bounds', () => {
      uiPalettesMock.mockReturnValue([{ colors: ['a', 'b', 'c'] }]);
      expect(p.uiColor({ color: 'red', index: 3 })).toEqual('red');

      expect(uiPalettesMock).toHaveBeenCalledTimes(1);
      // should keep cached palette
      p.uiColor({ color: 'red', index: 3 });
      expect(uiPalettesMock).toHaveBeenCalledTimes(1);
    });

    test('should return index from palette when index is within bounds', () => {
      uiPalettesMock.mockReturnValue([{ colors: ['a', 'b', 'c'] }]);
      expect(p.uiColor({ color: 'red', index: 1 })).toBe('b');
    });
  });
});
