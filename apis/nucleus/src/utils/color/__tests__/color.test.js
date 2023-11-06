/* eslint-disable no-underscore-dangle */
import Color from '../color';

describe('Color', () => {
  const r = 100; // same as rgb(100, 128, 200)
  const g = 128;
  const b = 200;
  const a = 0.5;
  const rgbString = `rgb(${[r, g, b].join(',')})`;

  // same as rgb(100, 128, 200)
  const hash = '#6480c8';

  // same  as #AABBCC / rgb(170, 187, 204)
  const shorthash = '#ABC';

  // same as rgb(100, 128, 200)
  const hsl = 'hsl(223.2 , 47.6 , 58.8)';

  const unsing = 6586568;

  test('Color generators', () => {
    let c;

    c = new Color(r, g, b);
    expect([c._r, c._g, c._b, c._a]).toEqual([r, g, b, 1]);

    c = new Color(r, g, b, a);
    expect([c._r, c._g, c._b, c._a]).toEqual([r, g, b, a]);

    c = new Color(unsing);
    expect([c._r, c._g, c._b, c._a]).toEqual([r, g, b, 1]);

    c = new Color(`rgb(${r},${g},${b})`);
    expect([c._r, c._g, c._b, c._a]).toEqual([r, g, b, 1]);

    c = new Color(`rgba(${r},${g},${b},${a})`);
    expect([c._r, c._g, c._b, c._a]).toEqual([r, g, b, a]);

    c = new Color(`ARGB(${102},${r},${g},${b})`);
    expect([c._r, c._g, c._b, c._a]).toEqual([r, g, b, 0.4]);

    c = new Color(hash);
    expect([c._r, c._g, c._b, c._a]).toEqual([r, g, b, 1]);

    c = new Color(shorthash);
    expect([c._r, c._g, c._b, c._a]).toEqual([170, 187, 204, 1]);

    c = new Color(hsl);
    expect([c._r, c._g, c._b, c._a]).toEqual([r, g, b, 1]);
  });

  test('Color to string conversion', () => {
    const c = new Color(r, g, b);
    expect(c.toRGB()).toEqual(rgbString);
    expect(c.toHex()).toEqual(hash);
    expect(c.toNumber()).toEqual(unsing);
  });

  test('Color interpolation', () => {
    const c1 = new Color(100, 200, 100);
    const c2 = new Color(200, 100, 0);
    const shouldBlendTo0 = new Color(100, 200, 100);
    const shouldBlendTo05 = new Color(150, 150, 50);
    const shouldBlendTo075 = new Color(175, 125, 25);
    const shouldBlendTo1 = new Color(200, 100, 0);
    let blended;

    blended = Color.getBlend(c1, c2, 0);
    expect([blended._r, blended._g, blended._b]).toEqual([shouldBlendTo0._r, shouldBlendTo0._g, shouldBlendTo0._b]);

    blended = Color.getBlend(c1, c2, 0.5);
    expect([blended._r, blended._g, blended._b]).toEqual([shouldBlendTo05._r, shouldBlendTo05._g, shouldBlendTo05._b]);

    blended = Color.getBlend(c1, c2, 0.75);
    expect([blended._r, blended._g, blended._b]).toEqual([
      shouldBlendTo075._r,
      shouldBlendTo075._g,
      shouldBlendTo075._b,
    ]);

    blended = Color.getBlend(c1, c2, 1);
    expect([blended._r, blended._g, blended._b]).toEqual([shouldBlendTo1._r, shouldBlendTo1._g, shouldBlendTo1._b]);
  });

  test('from HSV to RGB and back', () => {
    // Note: due to rounding the convertion back will not always be exact
    let colorString = 'hsv(0,0,0)';

    let c1 = new Color(colorString);
    expect(c1.toHSV()).toEqual(colorString);
    expect(c1.toHex()).toEqual('#000000');

    colorString = 'hsv(0,0,100)';
    c1 = new Color(colorString);
    expect(c1.toHSV()).toEqual(colorString);
    expect(c1.toHex()).toEqual('#ffffff');

    colorString = 'hsv(0,100,100)';
    c1 = new Color(colorString);
    expect(c1.toHSV()).toEqual(colorString);
    expect(c1.toHex()).toEqual('#ff0000');

    colorString = 'hsv(120,100,100)';
    c1 = new Color(colorString);
    expect(c1.toHSV()).toEqual(colorString);
    expect(c1.toHex()).toEqual('#00ff00');

    colorString = 'hsv(300,100,100)';
    c1 = new Color(colorString);
    expect(c1.toHSV()).toEqual(colorString);
    expect(c1.toHex()).toEqual('#ff00ff');

    colorString = 'hsv(180,100,50)';
    c1 = new Color(colorString);
    expect(c1.toHex()).toEqual('#008080');
  });

  describe('Color equality', () => {
    const rgb = new Color(100, 128, 200);
    const rgba = new Color(100, 128, 200, 0.4);

    test('with Color', () => {
      expect(rgb.isEqual(new Color(100, 128, 200))).toEqual(true);
      expect(rgb.isEqual(new Color(100, 128, 200, 1))).toEqual(true);
      expect(rgb.isEqual(new Color('rgb(100,128,200)'))).toEqual(true);
      expect(rgb.isEqual(new Color('rgba(100,128,200,1)'))).toEqual(true);
      expect(rgb.isEqual(new Color('#6480c8'))).toEqual(true);
      expect(rgb.isEqual(new Color('hsl(223.2 , 47.6 , 58.8)'))).toEqual(true);
      expect(rgb.isEqual(new Color(6586568))).toEqual(true);
      expect(rgb.isEqual(new Color(101, 129, 201))).toEqual(false);
      expect(rgb.isEqual(new Color('rgb(101,129,201)'))).toEqual(false);
      expect(rgb.isEqual(new Color(100, 128, 200, 0.4))).toEqual(false);
      expect(rgb.isEqual(new Color('rgba(100,128,200,0.4)'))).toEqual(false);
      expect(rgba.isEqual(new Color(100, 128, 200, 0.4))).toEqual(true);
      expect(rgba.isEqual(new Color('rgba(100,128,200,0.4)'))).toEqual(true);
      expect(rgba.isEqual(new Color('hsla(223.2,47.6,58.8,0.4)'))).toEqual(true);
      expect(rgba.isEqual(new Color(100, 128, 200, 0.6))).toEqual(false);
      expect(rgba.isEqual(new Color('rgba(100,128,200,0.6)'))).toEqual(false);
      expect(rgba.isEqual(new Color(100, 128, 200))).toEqual(false);
      expect(rgba.isEqual(new Color('rgb(100,128,200)'))).toEqual(false);
      expect(rgba.isEqual(new Color('#6480c8'))).toEqual(false);
      expect(rgba.isEqual(new Color('hsl(223.2 , 47.6 , 58.8)'))).toEqual(false);
      expect(rgba.isEqual(new Color(6586568))).toEqual(false);
    });

    test('with string', () => {
      expect(rgb.isEqual('rgb(100,128,200)')).toEqual(true);
      expect(rgb.isEqual('rgba(100,128,200,1)')).toEqual(true);
      expect(rgb.isEqual('ARGB(255,100,128,200)')).toEqual(true);
      expect(rgb.isEqual('#6480c8')).toEqual(true);
      expect(rgb.isEqual('hsl(223.2 , 47.6 , 58.8)')).toEqual(true);
      expect(rgb.isEqual('rgb(101,129,201)')).toEqual(false);
      expect(rgb.isEqual('rgba(100,128,200,0.4)')).toEqual(false);
      expect(rgba.isEqual('rgba(100,128,200,0.4)')).toEqual(true);
      expect(rgba.isEqual('ARGB(102,100,128,200)')).toEqual(true);
      expect(rgba.isEqual('hsla(223.2,47.6,58.8,0.4)')).toEqual(true);
      expect(rgba.isEqual('rgba(100,128,200,0.6)')).toEqual(false);
      expect(rgba.isEqual('rgb(100,128,200)')).toEqual(false);
      expect(rgba.isEqual('#6480c8')).toEqual(false);
      expect(rgba.isEqual('hsl(223.2 , 47.6 , 58.8)')).toEqual(false);
    });

    test('with number', () => {
      expect(rgb.isEqual(6586568)).toEqual(true);
      expect(rgba.isEqual(6586568)).toEqual(false);
    });

    test('with invalid value', () => {
      expect(rgb.isEqual(null)).toEqual(false);
      expect(rgb.isEqual(undefined)).toEqual(false);
      expect(rgb.isEqual('')).toEqual(false);
    });
  });

  describe('utility functions', () => {
    describe('isDark', () => {
      test('#000', () => {
        expect(Color.isDark('#000')).toEqual(true);
      });
      test('black', () => {
        expect(Color.isDark('black')).toEqual(true);
      });
      test('blue', () => {
        expect(Color.isDark('blue')).toEqual(true);
      });
      test('white', () => {
        expect(Color.isDark('white')).toEqual(false);
      });
      test('hsl(0,0,48)', () => {
        expect(Color.isDark('hsl(0,0,48)')).toEqual(true);
      });
      test('hsl(0,0,50)', () => {
        expect(Color.isDark('hsl(0,0,50)')).toEqual(false);
      });
    });
  });
});
