import { getColor, getShadows, getFullBoxShadow } from '../shadow-utils';

describe('shadow-utils', () => {
  describe('getColor', () => {
    test('should return undefined if shadow is falsy', () => {
      expect(getColor(undefined)).toEqual(undefined);
      expect(getColor('')).toEqual(undefined);
    });

    test('should return undefined if shadow is a predefined string', () => {
      expect(getColor('none')).toEqual(undefined);
      expect(getColor('inset')).toEqual(undefined);
      expect(getColor('initial')).toEqual(undefined);
      expect(getColor('inherit')).toEqual(undefined);
    });

    test('should return undefined if shadow has no color part', () => {
      expect(getColor('1px 2px')).toEqual(undefined);
    });

    test('should return correct color if shadow has valid color part', () => {
      expect(getColor('1px 2px red')).toEqual('red');
      expect(getColor('1px 2px #fff')).toEqual('#fff');
      expect(getColor('1px 2px rgb(255, 0, 0)')).toEqual('rgb(255, 0, 0)');
      expect(getColor('1px 2px rgba(255, 0, 0, 0.5)')).toEqual('rgba(255, 0, 0, 0.5)');
      expect(getColor('1px 2px hsl(255, 0, 0)')).toEqual('hsl(255, 0, 0)');
      expect(getColor('1px 2px hwb(255, 0, 0)')).toEqual('hwb(255, 0, 0)');
      expect(getColor('1px 2px cmyk(255, 0, 0)')).toEqual('cmyk(255, 0, 0)');
    });

    test('should return correct color if shadow has valid color part and inset after color', () => {
      expect(getColor('1px 2px red inset')).toEqual('red');
      expect(getColor('1px 2px #fff inset')).toEqual('#fff');
      expect(getColor('1px 2px rgb(255, 0, 0) inset')).toEqual('rgb(255, 0, 0)');
      expect(getColor('1px 2px rgba(255, 0, 0, 0.5) inset')).toEqual('rgba(255, 0, 0, 0.5)');
      expect(getColor('1px 2px hsl(255, 0, 0) inset')).toEqual('hsl(255, 0, 0)');
      expect(getColor('1px 2px hwb(255, 0, 0) inset')).toEqual('hwb(255, 0, 0)');
      expect(getColor('1px 2px cmyk(255, 0, 0) inset')).toEqual('cmyk(255, 0, 0)');
    });

    test('should return correct color if shadow has valid color part and inset before color', () => {
      expect(getColor('1px 2px inset red')).toEqual('red');
      expect(getColor('1px 2px inset #fff')).toEqual('#fff');
      expect(getColor('1px 2px inset rgb(255, 0, 0)')).toEqual('rgb(255, 0, 0)');
      expect(getColor('1px 2px inset rgba(255, 0, 0, 0.5)')).toEqual('rgba(255, 0, 0, 0.5)');
      expect(getColor('1px 2px inset hsl(255, 0, 0)')).toEqual('hsl(255, 0, 0)');
      expect(getColor('1px 2px inset hwb(255, 0, 0)')).toEqual('hwb(255, 0, 0)');
      expect(getColor('1px 2px inset cmyk(255, 0, 0)')).toEqual('cmyk(255, 0, 0)');
    });
  });

  describe('getShadows', () => {
    test('should return correct single shadow if shadow is a single shadow', () => {
      expect(getShadows('5px 10px red')).toEqual(['5px 10px red']);
      expect(getShadows('5px 10px 18px #fff')).toEqual(['5px 10px 18px #fff']);
      expect(getShadows('5px 10px 18px 20px rgb(0,0,255)')).toEqual(['5px 10px 18px 20px rgb(0,0,255)']);
    });

    test('should return and array of single shadows if shadow is a multiple shadow', () => {
      expect(getShadows('5px 5px rgb(0,0,255), 10px 10px red, 15px 15px green')).toEqual([
        '5px 5px rgb(0,0,255)',
        '10px 10px red',
        '15px 15px green',
      ]);
      expect(getShadows('10px 10px red, 5px 5px rgb(0,0,255), 15px 15px green')).toEqual([
        '10px 10px red',
        '5px 5px rgb(0,0,255)',
        '15px 15px green',
      ]);
    });
  });

  describe('getFullBoxShadow', () => {
    test('should return correct result if shadow is a predefined string', () => {
      expect(getFullBoxShadow('none', '', 'red')).toEqual('none');
      expect(getFullBoxShadow('initial', '', 'red')).toEqual('initial');
      expect(getFullBoxShadow('inherit', '', 'red')).toEqual('inherit');
    });

    test('should return correct result if shadow is an empty shadow', () => {
      expect(getFullBoxShadow('', '', 'red')).toEqual('');
    });

    test('should return correct result if shadow is a multiple shadow', () => {
      expect(getFullBoxShadow('5px 5px rgb(0,0,255), 10px 10px red, 15px 15px green', '', 'red')).toEqual(
        '5px 5px rgb(0,0,255), 10px 10px red, 15px 15px green'
      );
    });

    describe('boxShadowColor is a valid color', () => {
      test('should return correct result if shadow includes color', () => {
        expect(getFullBoxShadow('5px 5px rgb(0,0,255)', '', 'red')).toEqual('5px 5px red');
        expect(getFullBoxShadow('5px 5px green', '', 'red')).toEqual('5px 5px red');
        expect(getFullBoxShadow('5px 5px #fff', '', 'red')).toEqual('5px 5px red');
      });

      test('should return correct result if shadow does not include color', () => {
        expect(getFullBoxShadow('5px 5px', '', 'red')).toEqual('5px 5px red');
        expect(getFullBoxShadow('5px 5px 10px', '', 'red')).toEqual('5px 5px 10px red');
      });
    });

    describe('boxShadowColor is undefined', () => {
      test('should return correct result if theme shadow is falsy', () => {
        expect(getFullBoxShadow('5px 5px rgb(0,0,255)', '', undefined)).toEqual('5px 5px rgb(0,0,255)');
      });

      test('should return correct result if theme shadow is a single shadow with color', () => {
        expect(getFullBoxShadow('5px 5px rgb(0,0,255)', '10px 10px green', undefined)).toEqual('5px 5px green');
      });

      test('should return correct result if theme shadow is a multiple shadows', () => {
        expect(getFullBoxShadow('5px 5px rgb(0,0,255)', '10px 10px red, 20px 20px green', undefined)).toEqual(
          '5px 5px rgb(0,0,255)'
        );
        expect(getFullBoxShadow('5px 5px', '10px 10px red, 20px 20px green', undefined)).toEqual('5px 5px');
      });
    });
  });
});
