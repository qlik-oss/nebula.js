import EventEmitter from 'node-event-emitter';
import { color as d3color } from 'd3-color';

import setTheme from './set-theme';
import paletteResolverFn from './palette-resolver';
import styleResolverFn from './style-resolver';
import contrasterFn from './contraster/contraster';
import luminance from './contraster/luminance';
import Color from './utils/color/color';

export default function theme() {
  let resolvedThemeJSON;
  let styleResolverInstanceCache = {};

  let paletteResolver;

  let contraster;

  /**
   * Returns theme name
   *
   * @method
   * @name Theme#name
   * @returns {string} Current theme.
   * @example
   * theme.name();
   */

  /**
   * @class
   * @alias Theme
   */
  const externalAPI = /** @lends Theme# */ {
    /**
     * @returns {Theme~ScalePalette[]}
     */
    getDataColorScales() {
      return paletteResolver.dataScales();
    },
    /**
     * @returns {Theme~DataPalette[]}
     */
    getDataColorPalettes() {
      return paletteResolver.dataPalettes();
    },
    /**
     * @returns {Theme~ColorPickerPalette[]}
     */
    getDataColorPickerPalettes() {
      return paletteResolver.uiPalettes();
    },
    /**
     * @returns {Theme~DataColorSpecials}
     */
    getDataColorSpecials() {
      return paletteResolver.dataColors();
    },
    /**
     * Resolve a color object using the color picker palette from the provided JSON theme.
     * @param {object} c
     * @param {number=} c.index
     * @param {string=} c.color
     * @returns {string} The resolved color.
     *
     * @example
     * theme.getColorPickerColor({ index: 1 });
     * theme.getColorPickerColor({ color: 'red' });
     */
    getColorPickerColor(...a) {
      return paletteResolver.uiColor(...a);
    },

    /**
     * Get the best contrasting color against the specified `color`.
     * This is typically used to find a suitable text color for a label placed on an arbitrarily colored background.
     *
     * The returned colors are derived from the theme.
     * @param {string} color - A color to measure the contrast against
     * @returns {string} - The color that has the best contrast against the specified `color`.
     * @example
     * theme.getContrastingColorTo('#400');
     */
    getContrastingColorTo(color) {
      return contraster.getBestContrastColor(color);
    },

    /**
     * Get the value of a style attribute in the theme
     * by searching in the theme's JSON structure.
     * The search starts at the specified base path
     * and continues upwards until the value is found.
     * If possible it will get the attribute's value using the given path.
     * When attributes separated by dots are provided, such as 'hover.color',
     * they are required in the theme JSON file
     *
     * @param {string} basePath - Base path in the theme's JSON structure to start the search in (specified as a name path separated by dots).
     * @param {string} path - Expected path for the attribute (specified as a name path separated by dots).
     * @param {string} attribute - Name of the style attribute. (specified as a name attribute separated by dots).
     * @returns {string|undefined} The style value or undefined if not found
     *
     * @example
     * theme.getStyle('object', 'title.main', 'fontSize');
     * theme.getStyle('object', 'title', 'main.fontSize');
     * theme.getStyle('object', '', 'title.main.fontSize');
     * theme.getStyle('', '', 'fontSize');
     */
    getStyle(basePath, path, attribute) {
      if (!styleResolverInstanceCache[basePath]) {
        styleResolverInstanceCache[basePath] = styleResolverFn(basePath, resolvedThemeJSON);
      }

      return styleResolverInstanceCache[basePath].getStyle(path, attribute);
    },
    /**
     * Validates a color string using d3-color.
     * See https://www.npmjs.com/package/d3-color
     * Additionally supports the non-standard engine
     * format ARGB(0-255,0-255,0-255,0-255)
     * @param {string} specifier
     * @returns {string|undefined} The resolved color or undefined
     * @ignore
     *
     * @example
     * theme.validateColor("red"); // returns "rgba(255,0,0,1)"
     * theme.validateColor("#00ff00"); // returns "rgba(0,255,0,1)"
     * theme.validateColor("ARGB(102,255,50,100)"); // returns "rgba(255,50,100,0.4)"
     * theme.validateColor("FOO"); // returns undefined
     */
    validateColor(...args) {
      /* Added this to support the non-standard ARGB format from engine */
      const colorString = args[0];
      let matches;
      /* eslint-disable no-cond-assign */
      if (
        typeof colorString === 'string' &&
        (matches = /^ARGB\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(colorString))
      ) {
        // ARGB(255,255,255,255)
        const a = parseInt(matches[1], 10) / 255;
        const r = parseInt(matches[2], 10);
        const g = parseInt(matches[3], 10);
        const b = parseInt(matches[4], 10);
        return `rgba(${r},${g},${b},${a})`;
      }
      /* eslint-enable no-cond-assign */

      const c = d3color(...args);
      return c ? c.toString() : undefined;
    },
  };

  const internalAPI = {
    /**
     * @private
     * @param {object} t Raw JSON theme
     */
    setTheme(t, name) {
      resolvedThemeJSON = setTheme(t, styleResolverFn.resolveRawTheme);
      styleResolverInstanceCache = {};

      paletteResolver = paletteResolverFn(resolvedThemeJSON);

      // try to determine if the theme color is light or dark
      const textColor = externalAPI.getStyle('', '', 'color');
      const textColorLuminance = luminance(textColor);
      // if it appears dark, create an inverse that is light and vice versa
      const inverseTextColor = textColorLuminance < 0.2 ? '#ffffff' : '#333333';
      // instantiate a contraster that uses those two colors when determining the best contrast for an arbitrary color
      contraster = contrasterFn([textColor, inverseTextColor]);

      externalAPI.emit('changed');
      externalAPI.name = () => name;
    },
  };

  Object.keys(EventEmitter.prototype).forEach((key) => {
    externalAPI[key] = EventEmitter.prototype[key];
  });
  EventEmitter.init(externalAPI);

  internalAPI.setTheme({}, 'light');

  return {
    externalAPI,
    internalAPI,
  };
}

export { Color };
