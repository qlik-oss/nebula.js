import EventEmitter from 'node-event-emitter';

import setTheme from './set-theme';
import paletteResolverFn from './palette-resolver';
import styleResolverFn from './style-resolver';
import contrasterFn from './contraster/contraster';
import luminance from './contraster/luminance';

export default function theme() {
  let resolvedThemeJSON;
  let styleResolverInstanceCache = {};

  let paletteResolver;

  let contraster;

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
     * Get the value of a style attribute in the theme by searching in the theme's JSON structure.
     * The search starts at the specified base path and continues upwards until the value is found.
     * If possible it will get the attribute's value using the given path.
     *
     * @param {string} basePath - Base path in the theme's JSON structure to start the search in (specified as a name path separated by dots).
     * @param {string} path - Expected path for the attribute (specified as a name path separated by dots).
     * @param {string} attribute - Name of the style attribute.
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
