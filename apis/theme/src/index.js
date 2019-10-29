import extend from 'extend';
import EventEmitter from 'node-event-emitter';

import styleResolverFn from './style-resolver';
import paletteResolverFn from './paletter-resolver';
import contrasterFn, { luminance } from './contraster';

import baseRawJSON from './themes/base.json';
import lightRawJSON from './themes/light.json';
import darkRawJSON from './themes/dark.json';

export default function theme() {
  let rawThemeJSON;
  let resolvedThemeJSON;
  let styleResolverInstanceCache = {};

  let paletteResolver;

  let contraster;

  /**
   * @interface
   * @alias Theme
   */
  const externalAPI = /** @lends Theme */ {
    /**
     * @returns {scalePalette[]}
     */
    getDataColorScales() {
      return paletteResolver.dataScales();
    },
    /**
     * @returns {dataPalette[]}
     */
    getDataColorPalettes() {
      return paletteResolver.dataPalettes();
    },
    /**
     * @returns {colorPickerPalette[]}
     */
    getDataColorPickerPalettes(...a) {
      return paletteResolver.uiPalettes(...a);
    },
    /**
     * @returns {dataColorSpecials}
     */
    getDataColorSpecials() {
      return paletteResolver.dataColors();
    },
    /**
     * Resolve a color object using the color picker palette from the provided JSON theme
     * @param {object} c
     * @param {number=} c.index
     * @param {string=} c.color
     * @returns {string}
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
     * @param {string} color
     * @returns {string}
     * @example
     * theme.getContrastingColorTo('#400');
     */
    getContrastingColorTo(color) {
      return contraster.getBestContrastColor(color);
    },

    /**
     * Get the value of a style attribute in the theme by searching in the theme's json structure.
     * The search starts at the specified base path and continue upwards until the value is found.
     * If possible it will get the attribute's value using the given path.
     *
     * @param {string} basePath - Base path in the theme's json structure to start the search in (specified as a name path separated by dots)
     * @param {string} path - Expected path for the attribute (specified as a name path separated by dots)
     * @param {string} attribute - Name of the style attribute
     * @returns {string} The style value
     *
     * @example
     * theme.getStyle('object', 'title.main', 'fontSize'));
     * theme.getStyle('', '', 'fontSize'));
     */
    getStyle(basePath, path, attribute) {
      if (!styleResolverInstanceCache[basePath]) {
        styleResolverInstanceCache[basePath] = styleResolverFn(basePath, resolvedThemeJSON);
      }
      return styleResolverInstanceCache[basePath].getStyle(path, attribute, false);
    },
  };

  const internalAPI = {
    /**
     * @private
     * @param {object} t Raw JSON theme
     */
    setTheme(t) {
      const colorRawJSON = t.type === 'dark' ? darkRawJSON : lightRawJSON;
      const root = extend(true, {}, baseRawJSON, colorRawJSON);
      // avoid merging known array objects as it could cause issues if they are of different types (pyramid vs class) or length
      rawThemeJSON = extend(true, {}, root, { scales: null, palettes: { data: null, ui: null } }, t);
      if (!rawThemeJSON.palettes.data) {
        rawThemeJSON.palettes.data = root.palettes.data;
      }
      if (!rawThemeJSON.palettes.ui) {
        rawThemeJSON.palettes.ui = root.palettes.ui;
      }
      if (!rawThemeJSON.scales) {
        rawThemeJSON.scales = root.scales;
      }
      styleResolverInstanceCache = {};

      resolvedThemeJSON = styleResolverFn.resolveRawTheme(rawThemeJSON);
      paletteResolver = paletteResolverFn(resolvedThemeJSON);

      // try to determine if the theme color is light or dark
      const textColor = externalAPI.getStyle('', '', 'color');
      const textColorLuminance = luminance(textColor);
      // if it appears dark, create an inverse that is light and vice versa
      const inverseTextColor = textColorLuminance < 0.2 ? '#ffffff' : '#333333';
      // instantiate a contraster that uses those two colors when determining the best contrast for an arbitrary color
      contraster = contrasterFn([textColor, inverseTextColor]);

      externalAPI.emit('changed');
    },
  };

  Object.keys(EventEmitter.prototype).forEach(key => {
    externalAPI[key] = EventEmitter.prototype[key];
  });
  EventEmitter.init(externalAPI);

  internalAPI.setTheme({});

  return {
    externalAPI,
    internalAPI,
  };
}
