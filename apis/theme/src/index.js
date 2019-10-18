import extend from 'extend';
import EventEmitter from 'node-event-emitter';

import styleResolverFn from './style-resolver';
import paletteResolverFn from './paletter-resolver';

import baseRawJSON from './themes/base.json';
import lightRawJSON from './themes/light.json';
import darkRawJSON from './themes/dark.json';

export default function theme() {
  let rawThemeJSON;
  let resolvedThemeJSON;
  let styleResolverInstanceCache = {};

  let paletteResolver;

  /**
   * @interface
   * @alias Theme
   */
  const externalAPI = /** @lends Theme */ {
    palettes(...a) {
      return paletteResolver.palettes(...a);
    },
    dataScales(...a) {
      return paletteResolver.dataScales(...a);
    },
    dataPalettes(...a) {
      return paletteResolver.dataPalettes(...a);
    },
    uiPalettes(...a) {
      return paletteResolver.uiPalettes(...a);
    },
    dataColors(...a) {
      return paletteResolver.dataColors(...a);
    },
    /**
     * Resolve a color object using the UI palette from the provided JSON theme
     * @param {object} c
     * @param {number=} c.index
     * @param {string=} c.color
     * @returns {string}
     *
     * @example
     * theme.uiColor({ index: 1, color: 'red' });
     */
    uiColor(...a) {
      return paletteResolver.uiColor(...a);
    },
    /**
     * Get the value of a style attribute in the theme by searching in the theme's json structure.
     * The search starts at the specified base path and continue upwards until the value is found.
     * If possible it will get the attribute's value using the given path.
     *
     * @param {string} basePath - Base path in the theme's json structure to start the search in (specified as a name path separated by dots)
     * @param {string} path - Expected path for the attribute (specified as a name path separated by dots)
     * @param {string} attribute - Name of the style attribute
     * @return {string} The style value
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
     * @param {object} t Raw JSON theme
     */
    setTheme(t) {
      const colorRawJSON = t.type === 'dark' ? darkRawJSON : lightRawJSON;
      rawThemeJSON = extend(true, {}, baseRawJSON, colorRawJSON, t);
      styleResolverInstanceCache = {};

      resolvedThemeJSON = styleResolverFn.resolveRawTheme(rawThemeJSON);
      paletteResolver = paletteResolverFn(resolvedThemeJSON);

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
