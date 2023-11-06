/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-cond-assign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/**
 * Module which defines a color object
 * @exports objects.views/charts/representation/color
 * @expose module:objects.views/charts/representation/color~Color
 */
import CSSColors from './css-colors';

// color formats
const rgb = /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i;
const rgba = /^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),(\d(\.\d+)?)\)$/i;
const hex = /^#([A-f0-9]{2})([A-f0-9]{2})([A-f0-9]{2})$/i;
const hexShort = /^#([A-f0-9])([A-f0-9])([A-f0-9])$/i;
const hsl = /^hsl\(\s*(\d+(\.\d+)?)\s*,\s*(\d+(\.\d+)?%?)\s*,\s*(\d+(\.\d+)?%?)\s*\)$/i;
const hsla = /^hsla\(\s*(\d+(\.\d+)?)\s*,\s*(\d+(\.\d+)?%?)\s*,\s*(\d+(\.\d+)?%?)\s*,(\d(\.\d+)?)\)$/i;
const { floor } = Math;
const { round } = Math;

/**
 * @class
 * @classdesc Class which provides color transformation functionality
 * @description This is a constructor.
 * @param {object} - Parameters to create a color from different notations
 * @example
 * // a few ways of instantiating a red color
 * var red;
 * red = new Color(255, 0, 0, 1); // rgba as parameters
 * red = new Color('#ff0000'); // hex
 * red = new Color('rgb(255,0,0)');//rgb as string
 * red = new Color('hsl(0, 100, 50)');// hsl as string
 * red = new Color(16711680);// uint
 */
export default class Color {
  constructor(...args) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1;
    let h;
    let s;
    let lcs;
    let l;
    let v;
    let c;
    let h_;
    let x;
    let rgb_;
    let m;
    let matches;
    let colorString;

    this._invalid = false;

    if (args[0] instanceof Color) {
      r = args[0]._r;
      g = args[0]._g;
      b = args[0]._b;
      a = args[0]._a;
      this._invalid = args[0]._invalid;
    } else if (args.length < 3) {
      if (typeof args[0] === 'string') {
        colorString = args[0];

        if ((matches = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(colorString))) {
          r = parseInt(matches[1], 10);
          g = parseInt(matches[2], 10);
          b = parseInt(matches[3], 10);
        } else if (
          (matches = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d(\.\d+)?)\s*\)$/i.exec(colorString))
        ) {
          // rgba(1, 2, 3, 0.4)
          r = parseInt(matches[1], 10);
          g = parseInt(matches[2], 10);
          b = parseInt(matches[3], 10);
          a = parseFloat(matches[4]);
        } else if (
          (matches = /^ARGB\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(colorString))
        ) {
          // ARGB(255,255,255,255)
          a = parseInt(matches[1], 10) / 255;
          r = parseInt(matches[2], 10);
          g = parseInt(matches[3], 10);
          b = parseInt(matches[4], 10);
        } else if ((matches = /^#([A-f0-9]{2})([A-f0-9]{2})([A-f0-9]{2})$/i.exec(colorString))) {
          // #aBc123
          r = parseInt(matches[1], 16);
          g = parseInt(matches[2], 16);
          b = parseInt(matches[3], 16);
          a = 1;
        } else if ((matches = /^#([A-f0-9])([A-f0-9])([A-f0-9])$/i.exec(colorString))) {
          // #a5F
          r = parseInt(matches[1] + matches[1], 16);
          g = parseInt(matches[2] + matches[2], 16);
          b = parseInt(matches[3] + matches[3], 16);
          a = 1;
        } else if (
          (matches = /^hsl\(\s*(\d+(\.\d+)?)\s*,\s*(\d+(\.\d+)?%?)\s*,\s*(\d+(\.\d+)?%?)\s*\)$/i.exec(colorString))
        ) {
          // hsl(1, 2, 3)
          h = parseFloat(matches[1]);
          s = parseFloat(matches[3]);
          l = parseFloat(matches[5]);

          h %= 360;
          s /= 100;
          l /= 100;

          h = h < 0 ? 0 : h > 360 ? 360 : h;
          s = s < 0 ? 0 : s > 1 ? 1 : s;
          l = l < 0 ? 0 : l > 1 ? 1 : l;

          c = l <= 0.5 ? 2 * l * s : (2 - 2 * l) * s;
          h_ = h / 60;
          x = c * (1 - Math.abs((h_ % 2) - 1));

          rgb_ = [];

          h_ = Math.floor(h_);
          switch (h_) {
            case 0:
              rgb_ = [c, x, 0];
              break;
            case 1:
              rgb_ = [x, c, 0];
              break;
            case 2:
              rgb_ = [0, c, x];
              break;
            case 3:
              rgb_ = [0, x, c];
              break;
            case 4:
              rgb_ = [x, 0, c];
              break;
            case 5:
              rgb_ = [c, 0, x];
              break;
            default:
              rgb_ = [0, 0, 0];
          }

          m = l - 0.5 * c;

          r = rgb_[0] + m;
          g = rgb_[1] + m;
          b = rgb_[2] + m;

          r = round(255 * r);
          g = round(255 * g);
          b = round(255 * b);
          a = 1.0;
        } else if (
          (matches = /^hsla\(\s*(\d+(\.\d+)?)\s*,\s*(\d+(\.\d+)?%?)\s*,\s*(\d+(\.\d+)?%?)\s*,(\d(\.\d+)?)\)$/i.exec(
            colorString
          ))
        ) {
          // hsla(1,2,3,0.4)
          h = parseFloat(matches[1]);
          s = parseFloat(matches[3]);
          l = parseFloat(matches[5]);
          a = parseFloat(matches[7]);

          h %= 360;
          s /= 100;
          l /= 100;

          h = h < 0 ? 0 : h > 360 ? 360 : h;
          s = s < 0 ? 0 : s > 1 ? 1 : s;
          l = l < 0 ? 0 : l > 1 ? 1 : l;

          c = l <= 0.5 ? 2 * l * s : (2 - 2 * l) * s;
          h_ = h / 60;
          x = c * (1 - Math.abs((h_ % 2) - 1));

          rgb_ = [];

          h_ = Math.floor(h_);
          switch (h_) {
            case 0:
              rgb_ = [c, x, 0];
              break;
            case 1:
              rgb_ = [x, c, 0];
              break;
            case 2:
              rgb_ = [0, c, x];
              break;
            case 3:
              rgb_ = [0, x, c];
              break;
            case 4:
              rgb_ = [x, 0, c];
              break;
            case 5:
              rgb_ = [c, 0, x];
              break;
            default:
              rgb_ = [0, 0, 0];
          }

          m = l - 0.5 * c;

          r = rgb_[0] + m;
          g = rgb_[1] + m;
          b = rgb_[2] + m;

          r = round(255 * r);
          g = round(255 * g);
          b = round(255 * b);
        } else if (
          (matches = /^hsv\(\s*(\d+(\.\d+)?)\s*,\s*(\d+(\.\d+)?%?)\s*,\s*(\d+(\.\d+)?%?)\s*\)$/i.exec(colorString))
        ) {
          // hsv(1, 2, 3) {
          h = parseFloat(matches[1]);
          s = parseFloat(matches[3]);
          v = parseFloat(matches[5]);

          h %= 360;
          s /= 100;
          v /= 100;

          h = h < 0 ? 0 : h > 360 ? 360 : h;
          s = s < 0 ? 0 : s > 1 ? 1 : s;
          v = v < 0 ? 0 : v > 1 ? 1 : v;

          c = v * s;
          h_ = h / 60;
          x = c * (1 - Math.abs((h_ % 2) - 1));

          rgb_ = [];

          h_ = Math.floor(h_);
          switch (h_) {
            case 0:
              rgb_ = [c, x, 0];
              break;
            case 1:
              rgb_ = [x, c, 0];
              break;
            case 2:
              rgb_ = [0, c, x];
              break;
            case 3:
              rgb_ = [0, x, c];
              break;
            case 4:
              rgb_ = [x, 0, c];
              break;
            case 5:
              rgb_ = [c, 0, x];
              break;
            default:
              rgb_ = [0, 0, 0];
          }

          m = v - c;

          r = rgb_[0] + m;
          g = rgb_[1] + m;
          b = rgb_[2] + m;

          r = round(255 * r);
          g = round(255 * g);
          b = round(255 * b);
          a = 1.0;
        } else if (CSSColors[colorString.toLowerCase()]) {
          lcs = colorString.toLowerCase();
          r = CSSColors[lcs].r;
          g = CSSColors[lcs].g;
          b = CSSColors[lcs].b;
          a = typeof CSSColors[lcs].a === 'number' ? CSSColors[lcs].a : 1.0;
        } else {
          this._invalid = true;
        }
      } else if (typeof args[0] === 'number' && args[0] >= 0 && args[1] === 'argb') {
        a = (0xff000000 & args[0]) >>> 24;
        a /= 255;
        r = (0xff0000 & args[0]) >> 16;
        g = (0x00ff00 & args[0]) >> 8;
        b = 0x0000ff & args[0];
      } else if (typeof args[0] === 'number' && args[0] >= 0) {
        r = (0xff0000 & args[0]) >> 16;
        g = (0x00ff00 & args[0]) >> 8;
        b = 0x0000ff & args[0];
      } else {
        this._invalid = true;
      }
    } else if (args.length >= 3) {
      r = args[0];
      g = args[1];
      b = args[2];
      a = arguments.length >= 4 ? args[3] : 1;
    } else {
      this._invalid = true;
    }

    if (Number.isNaN(+r + g + b + a)) {
      this._invalid = true;
    }

    this._r = floor(r);
    this._g = floor(g);
    this._b = floor(b);
    this._a = a;

    // object to cache string representations in various color spaces
    this._spaces = {};
  }

  isInvalid() {
    return this._invalid;
  }

  /**
   * Sets alpha value of color
   * @param {number} a - Alpha value of the color
   */
  setAlpha(a) {
    this._a = a;
    this._spaces = {};
  }

  /**
   * Gets the alpha value of this color
   * @returns {number}
   */
  getAlpha() {
    return this._a;
  }

  /**
   * Returns an rgb string representation of this color.
   * @return {string} An rgb string representation of this color
   */
  toRGB() {
    if (!this._spaces.rgb) {
      this._spaces.rgb = Color.toRGB(this);
    }
    return this._spaces.rgb;
  }

  /**
   * Returns an rgba string representation of this color.
   * @return {string} An rgba string representation of this color.
   */
  toRGBA() {
    if (!this._spaces.rgba) {
      this._spaces.rgba = Color.toRGBA(this);
    }
    return this._spaces.rgba;
  }

  toString() {
    if (!this._spaces.rgb) {
      this._spaces.rgb = Color.toRGB(this);
    }
    return this._spaces.rgb;
  }

  /**
   * Returns a hex string representation of this color.
   * @return {string}
   */
  toHex() {
    if (!this._spaces.hex) {
      this._spaces.hex = Color.toHex(this);
    }
    return this._spaces.hex;
  }

  /**
   * Returns a hsl string representation of this color using "bi-hexcone" model for lightness
   * @param {boolean} luma - Whether to use luma calculation
   * @return {string} In format hsl(0,0,0)
   */
  toHSL(luma) {
    if (!this._spaces.hsl) {
      this._spaces.hsl = Color.toHSL(this, luma);
    }
    return this._spaces.hsl;
  }

  /**
   * Returns a hsla string representation of this color using "bi-hexcone" model for lightness
   * @param {boolean} luma - Whether to use luma calculation
   * @return {string} In format hsla(0,0,0,0)
   */
  toHSLA(luma) {
    if (!this._spaces.hsla) {
      this._spaces.hsla = Color.toHSLA(this, luma);
    }
    return this._spaces.hsla;
  }

  /**
   * Return the color components in hsv space using "hexcone" model for value (lightness)
   * @param {Color|string} c
   * @returns {object} The color components in hsv space {h:0-360, s:0-100, v:0-100}
   */
  toHSV() {
    const hsvComp = this.toHSVComponents();
    return `hsv(${hsvComp.h},${hsvComp.s},${hsvComp.v})`;
  }

  /**
   * Return the color components in hsv space using "hexcone" model for value (lightness)
   * @param {Color|string} c
   * @returns {object} The color components in hsv space {h:0-360, s:0-100, v:0-100}
   */
  toHSVComponents() {
    if (!this._spaces.hsvComp) {
      this._spaces.hsvComp = Color.toHSVComponents(this);
    }
    return this._spaces.hsvComp;
  }

  /**
   * Returns a uint representation of this color
   * @return {number}
   */
  toNumber() {
    if (!this._spaces.num) {
      this._spaces.num = Color.toNumber(this);
    }
    return this._spaces.num;
  }

  /**
   * Checks if this color is perceived as dark.
   * @return {string} True if the luminance is below 160, false otherwise.
   */
  isDark() {
    return this.isInvalid() || this.getLuminance() < 125; // luminace calc option #2
    // return this.getLuminance() < 160; //luminace calc option #3
  }

  /**
   * Calculates the perceived luminance of the color.
   * @return {number} A value in the range 0-255 where a low value is considered dark and vice versa.
   */
  getLuminance() {
    // alpha channel is not considered
    if (typeof this._lumi === 'undefined') {
      // calculate luminance
      // this._lumi = 0.2126 * this._r + 0.7152 * this._g + 0.0722 * this._b; // option 1
      this._lumi = 0.299 * this._r + 0.587 * this._g + 0.114 * this._b; // option 2
      // this._lumi = Math.sqrt( 0.241 * this._r * this._r + 0.691 * this._g * this._g + 0.068 * this._b * this._b ); // option 3
    }

    return this._lumi;
  }

  /**
   * Shifts the color towards a lighter or darker shade
   * @param {number} value - A value in the range -100-100 to shift the color with along the HSL lightness.
   * @return {string} The shifted color as hsla string.
   */
  shiftLuminance(value) {
    const chsla = this.toHSLA();
    const matches = /^hsla\(\s*(\d+(\.\d+)?)\s*,\s*(\d+(\.\d+)?%?)\s*,\s*(\d+(\.\d+)?%?)\s*,(\d(\.\d+)?)\)$/i.exec(
      chsla
    );

    const h = parseFloat(matches[1]);
    const s = parseFloat(matches[3]);
    let l = parseFloat(matches[5]);
    const a = parseFloat(matches[7]);
    // l *= 1 + value / 100;
    // l = Math.max( 0, l % 100 );
    l += value;
    l = Math.max(0, Math.min(l, 100));

    // if( value > 0 ){
    // s = s*0.2; //removing saturation to avoid the border from being too light
    // }

    return `hsla(${h},${s},${l},${a})`;
  }

  /**
   * Compares two colors.
   * @param {Color} c The color to compare with.
   * @return {boolean} True if the rgba channels are the same, false otherwise
   */
  isEqual(c) {
    if (c instanceof Color) {
      return this._r === c._r && this._g === c._g && this._b === c._b && this._a === c._a;
    }

    c = new Color(c);
    return this._r === c._r && this._g === c._g && this._b === c._b && this._a === c._a;
  }

  /**
   * Linearly interpolates each channel of two colors.
   * @param {Color} c2 The other color.
   * @param {number} t The interpolation value in the range (0-1).
   * @return {string} The blend as an rgb string.
   */
  blend(c2, t) {
    const r = floor(this._r + (c2._r - this._r) * t);
    const g = floor(this._g + (c2._g - this._g) * t);
    const b = floor(this._b + (c2._b - this._b) * t);
    const a = floor(this._a + (c2._a - this._a) * t);

    return `rgba(${[r, g, b, a].join(',')})`;
  }

  createShiftedColor(v) {
    if (v === undefined || Number.isNaN(+v)) {
      v = 1;
    }
    const lumi = this.getLuminance();
    const greenMultiplier = this._g < 126 ? 1 : 1 + this._g / 512;
    const hsla_string = this.shiftLuminance(
      (lumi * greenMultiplier < 220 ? 0.8 + 4 * (1 / (lumi + 1)) : -(0.8 + 1 * (lumi / 255))) * 20 * v
    );

    return new Color(hsla_string);
  }

  /**
   * Returns an rgb string representation of this color
   * @param {Color|string} c
   * @returns {string} An rgb string with channel values within range 0-255.
   */
  static toRGB(c) {
    if (c instanceof Color) {
      return `rgb(${[c._r, c._g, c._b].join(',')})`;
    }

    if (typeof c === 'string') {
      c = Color.toNumber(c);
    }

    const r = (c & 0xff0000) >> 16;
    const g = (c & 0x00ff00) >> 8;
    const b = c & 0x0000ff;

    return `rgb(${r},${g},${b})`;
  }

  /**
   *
   * @param c
   * @param a
   * @returns {string} The color rgb format.
   */
  static toRGBA(c, a) {
    if (c instanceof Color) {
      return `rgba(${[c._r, c._g, c._b, typeof a !== 'undefined' ? a : c._a].join(',')})`;
    }

    if (typeof c === 'string') {
      c = Color.toNumber(c);
    }

    const r = (c & 0xff0000) >> 16;
    const g = (c & 0x00ff00) >> 8;
    const b = c & 0x0000ff;

    return `rgba(${r},${g},${b},${typeof a !== 'undefined' ? a : c._a})`;
  }

  /**
   *
   * @param {Color|string} c
   * @returns {string} The color in hexadecimal space.
   */
  static toHex(c) {
    let r;
    let g;
    let b;
    if (c instanceof Color) {
      r = c._r.toString(16);
      g = c._g.toString(16);
      b = c._b.toString(16);
      if (r.length === 1) {
        r = `0${r}`;
      }
      if (g.length === 1) {
        g = `0${g}`;
      }
      if (b.length === 1) {
        b = `0${b}`;
      }
      return `#${[r, g, b].join('')}`;
    }

    if (typeof c === 'string') {
      c = Color.toNumber(c);
    }

    r = ((c & 0xff0000) >> 16).toString(16);
    g = ((c & 0x00ff00) >> 8).toString(16);
    b = (c & 0x0000ff).toString(16);

    if (r.length === 1) {
      r = `0${r}`;
    }
    if (g.length === 1) {
      g = `0${g}`;
    }
    if (b.length === 1) {
      b = `0${b}`;
    }

    return `#${r}${g}${b}`;
  }

  /**
   * Return the color in hsl space using "bi-hexcone" model for lightness
   * @param {Color|string} c
   * @param {boolean} luma - Whether to use luma calculation
   * @returns {string} The color in hsl space.
   */
  static toHSL(c, luma) {
    let h = 0;
    let s;
    let l;
    let ch;
    if (typeof c === 'string') {
      c = new Color(c);
    }

    // red, green, blue, hue, saturation, lightness/luma, max, min, chroma
    const r = c._r / 255;
    const g = c._g / 255;
    const b = c._b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (luma) {
      // Y'709 http://en.wikipedia.org/wiki/Rec._709
      // Y′709 = 0.21R + 0.72G + 0.07B
      l = 0.21 * r + 0.72 * g + 0.07 * b;
    } else {
      l = (max + min) / 2;
    }

    if (max === min) {
      // greyscale
      s = 0;
      h = 0;
    } else {
      ch = max - min;
      s = l > 0.5 ? ch / (2 - max - min) : ch / (max + min);
      switch (max) {
        case r:
          h = (g - b) / ch + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / ch + 2;
          break;
        case b:
          h = (r - g) / ch + 4;
          break;
        default:
          break;
      }
      h /= 6;
    }

    return `hsl(${h * 360},${s * 100},${l * 100})`;
  }

  /**
   * Return the color in hsla space using "bi-hexcone" model for lightness
   * @param {Color|string} c
   * @param {boolean} luma - Whether to use luma calculation
   * @returns {string} The color in hsla space.
   */
  static toHSLA(c, luma) {
    let h = 0;
    let s;
    let l;
    let ch;
    if (typeof c === 'string') {
      c = new Color(c);
    }

    // red, green, blue, hue, saturation, lightness/luma, max, min, chroma
    const r = c._r / 255;
    const g = c._g / 255;
    const b = c._b / 255;
    const a = c._a;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (luma) {
      // Y'709 http://en.wikipedia.org/wiki/Rec._709
      // Y′709 = 0.21R + 0.72G + 0.07B
      l = 0.21 * r + 0.72 * g + 0.07 * b;
    } else {
      l = (max + min) / 2;
    }

    if (max === min) {
      // greyscale
      s = 0;
      h = 0;
    } else {
      ch = max - min;
      s = l > 0.5 ? ch / (2 - max - min) : ch / (max + min);
      switch (max) {
        case r:
          h = (g - b) / ch + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / ch + 2;
          break;
        case b:
          h = (r - g) / ch + 4;
          break;
        default:
          break;
      }
      h /= 6;
    }

    return `hsla(${h * 360},${s * 100},${l * 100},${a})`;
  }

  /**
   * Return the color components in hsv space using "hexcone" model for value (lightness)
   * @param {Color|string} c
   * @returns {object} The color components in hsv space {h:0-360, s:0-100, v:0-100}
   */
  static toHSVComponents(c) {
    let h = 0;
    let s;
    let ch;
    if (typeof c === 'string') {
      c = new Color(c);
    }

    // red, green, blue, hue, saturation, value/luma, max, min, chroma
    const r = c._r / 255;
    const g = c._g / 255;
    const b = c._b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    const v = max;

    if (max === min) {
      // greyscale
      s = 0;
      h = 0;
    } else {
      ch = max - min;
      s = ch === 0 ? 0 : ch / v;
      switch (max) {
        case r:
          h = (g - b) / ch + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / ch + 2;
          break;
        case b:
          h = (r - g) / ch + 4;
          break;
        default:
          break;
      }
      h /= 6;
    }

    return { h: (h * 360) % 360, s: s * 100, v: v * 100 };
  }

  /**
   * Returns an number representation of the color
   * @param {Color|string} c
   * @returns {Number} Unsigned integer in the range 0-16 777 216
   */
  static toNumber(...args) {
    if (args.length === 1 && args[0] instanceof Color) {
      return (args[0]._r << 16) + (args[0]._g << 8) + args[0]._b;
    }

    let r = 0;
    let g = 0;
    let b = 0;
    let matches;
    let colorString;

    if (args.length === 1) {
      if (typeof args[0] === 'string') {
        colorString = args[0];

        if ((matches = /^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/i.exec(colorString))) {
          r = parseInt(matches[1], 10);
          g = parseInt(matches[2], 10);
          b = parseInt(matches[3], 10);
        } else if ((matches = /^#([A-f0-9]{2})([A-f0-9]{2})([A-f0-9]{2})$/i.exec(colorString))) {
          r = parseInt(matches[1], 16);
          g = parseInt(matches[2], 16);
          b = parseInt(matches[3], 16);
        } else if ((matches = /^#([A-f0-9])([A-f0-9])([A-f0-9])$/i.exec(colorString))) {
          r = parseInt(matches[1] + matches[1], 16);
          g = parseInt(matches[2] + matches[2], 16);
          b = parseInt(matches[3] + matches[3], 16);
        }
      }
    }
    return (r << 16) + (g << 8) + b;
  }

  static blend(c1, c2, t) {
    c1 = Color.toNumber(c1);
    c2 = Color.toNumber(c2);

    const r1 = (c1 & 0xff0000) >> 16;
    const g1 = (c1 & 0x00ff00) >> 8;
    const b1 = c1 & 0x0000ff;
    const r2 = (c2 & 0xff0000) >> 16;
    const g2 = (c2 & 0x00ff00) >> 8;
    const b2 = c2 & 0x0000ff;
    const r = r1 + (r2 - r1) * t;
    const g = g1 + (g2 - g1) * t;
    const b = b1 + (b2 - b1) * t;

    return (r << 16) + (g << 8) + b;
  }

  static getBlend(c1, c2, t) {
    const r = c1._r + (c2._r - c1._r) * t;
    const g = c1._g + (c2._g - c1._g) * t;
    const b = c1._b + (c2._b - c1._b) * t;
    const a = c1._a + (c2._a - c1._a) * t;

    return new Color(r, g, b, a);
  }

  static isCSSColor(color) {
    if (arguments.length > 1 || typeof color !== 'string') {
      return false;
    }
    return (
      rgb.test(color) ||
      rgba.test(color) ||
      hex.test(color) ||
      hexShort.test(color) ||
      hsl.test(color) ||
      hsla.test(color) ||
      CSSColors[color.toLowerCase()]
    );
  }

  static getBestContrast(color, cl, cd) {
    const lum = color.getLuminance();
    return Math.abs(lum - cl.getLuminance()) > Math.abs(lum - cd.getLuminance()) ? cl : cd;
  }

  static getContrast(color1, color2) {
    if (!color1 || !color2) {
      return undefined;
    }

    const l1 = color1.getLuminance() / 100;
    const l2 = color2.getLuminance() / 100;

    if (l1 > l2) {
      return (l1 + 0.05) / (l2 + 0.05);
    }

    return (l2 + 0.05) / (l1 + 0.05);
  }

  static isDark(...args) {
    const C = new Color(...args);
    return C.isDark(...args);
  }

  static useDarkLabel(areaColor, bgIsDark) {
    return areaColor._a > 0.5 ? !areaColor.isDark() : !bgIsDark;
  }
}
