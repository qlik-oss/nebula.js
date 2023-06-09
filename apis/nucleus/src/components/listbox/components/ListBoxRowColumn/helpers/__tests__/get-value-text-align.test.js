import getValueTextAlign from '../get-value-text-align';

describe('getValueTextAlign', () => {
  let cell;

  beforeEach(() => {
    cell = { qNum: NaN };
  });

  describe('auto', () => {
    test('should return left with RTL', () => {
      const align = getValueTextAlign({ direction: 'rtl', cell, textAlign: { auto: true } });
      expect(align).toEqual('left');
    });

    test('should return left with LTR', () => {
      const align = getValueTextAlign({ direction: 'ltr', cell, textAlign: { auto: true } });
      expect(align).toEqual('right');
    });

    test('should return right with LTR and number type', () => {
      const align = getValueTextAlign({ direction: 'ltr', cell: { qNum: 1 }, textAlign: { auto: true } });
      expect(align).toEqual('right');
    });

    test('should return left with RTL and number type', () => {
      const align = getValueTextAlign({ direction: 'rtl', cell: { qNum: 1 }, textAlign: { auto: true } });
      expect(align).toEqual('left');
    });
  });

  describe('manual', () => {
    test('should return right with LTR', () => {
      const align = getValueTextAlign({ direction: 'ltr', cell, textAlign: { auto: false, align: 'right' } });
      expect(align).toEqual('right');
    });

    test('should return left with LTR', () => {
      const align = getValueTextAlign({ direction: 'ltr', cell, textAlign: { auto: false, align: 'left' } });
      expect(align).toEqual('left');
    });

    test('should return right with RTL', () => {
      const align = getValueTextAlign({ direction: 'rtl', cell, textAlign: { auto: false, align: 'right' } });
      expect(align).toEqual('right');
    });

    test('should return right with RTL', () => {
      const align = getValueTextAlign({ direction: 'rtl', cell, textAlign: { auto: false, align: 'right' } });
      expect(align).toEqual('right');
    });

    test('should return left with LTR', () => {
      const align = getValueTextAlign({
        direction: 'ltr',
        cell: { qNum: 1 },
        textAlign: { auto: false, align: 'left' },
      });
      expect(align).toEqual('left');
    });

    test('should return right with LTR', () => {
      const align = getValueTextAlign({
        direction: 'ltr',
        cell: { qNum: 1 },
        textAlign: { auto: false, align: 'right' },
      });
      expect(align).toEqual('right');
    });

    test('should return right with RTL', () => {
      const align = getValueTextAlign({
        direction: 'rtl',
        cell: { qNum: 1 },
        textAlign: { auto: false, align: 'left' },
      });
      expect(align).toEqual('left');
    });

    test('should return right with RTL', () => {
      const align = getValueTextAlign({
        direction: 'rtl',
        cell: { qNum: 1 },
        textAlign: { auto: false, align: 'right' },
      });
      expect(align).toEqual('right');
    });

    test('should return center', () => {
      const align = getValueTextAlign({
        direction: 'ltr',
        cell: { qNum: 1 },
        textAlign: { auto: false, align: 'center' },
      });
      expect(align).toEqual('center');
    });

    test('should return left when someone brings in nonsense', () => {
      const align = getValueTextAlign({
        direction: 'ltr',
        cell: { qNum: 1 },
        textAlign: { auto: false, align: 'nonsense' },
      });
      expect(align).toEqual('left');
    });
  });
});
