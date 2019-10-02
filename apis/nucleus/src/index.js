/* eslint no-underscore-dangle:0 */
import localeFn from './locale';

import { createAppSelectionAPI } from './selections';

import App from './components/NebulaApp';
import AppSelectionsPortal from './components/selections/AppSelections';

import create from './object/create-object';
import get from './object/get-object';
import { create as types } from './sn/types';
import logger from './utils/logger';

/**
 * @typedef {object}
 * @alias Configuration
 */
const DEFAULT_CONFIG = {
  theme: 'light',
  /**
   *
   */
  load: () => undefined,
  locale: {
    language: 'en-US',
  },
  log: {
    level: 4,
  },
  /**
   * @type {TypeInfo[]}
   */
  types: [],
  /** */
  env: {},
};

const mergeConfigs = (base, c) => ({
  direction: c.direction || base.direction,
  theme: c.theme || base.theme,
  load: c.load || base.load,
  locale: {
    language: (c.locale ? c.locale.language : '') || base.locale.language,
  },
  types: [
    // TODO - filter to avoid duplicates
    ...(base.types || []),
    ...(c.types || []),
  ],
  env: {
    ...(base.env || {}),
    ...(c.env || {}),
  },
});

function nuked(configuration = {}) {
  /**
   * Initiates a new `nebbie` instance using the specified `app`.
   * @entry
   * @alias nucleus
   * @param {EnigmaAppModel} app
   * @param {Configuration=} instanceConfig
   * @returns {Nebbie}
   * @example
   * import nucleus from '@nebula.js/nucleus'
   * const nebbie = nucleus(app);
   */
  function nucleus(app, instanceConfig = {}) {
    const currentConfig = mergeConfigs(configuration, instanceConfig);
    const lgr = logger(currentConfig.log);
    const locale = localeFn(currentConfig.locale);

    const config = {
      env: {
        Promise,
        translator: locale.translator(),
      },
      load: currentConfig.load,
    };

    createAppSelectionAPI(app);

    const root = App({
      app,
      translator: locale.translator(),
      theme: currentConfig.theme,
      direction: currentConfig.direction,
    });

    const context = {
      nebbie: null,
      app,
      config,
      logger: lgr,
      types: types({ logger: lgr, config }),
      root,
    };

    currentConfig.types.forEach(t =>
      context.types.register(
        {
          name: t.name,
          version: t.version,
        },
        {
          meta: t.meta,
          load: t.load,
        }
      )
    );

    let selectionsApi = null;
    let selectionsComponentReference = null;

    /**
     * @interface
     * @alias Nebbie
     */
    const api = /** @lends Nebbie */ {
      /**
       * @param {GetObjectConfig} getCfg
       * @param {VizConfig=} vizConfig
       * @returns {Viz}
       */
      get: (getCfg, vizConfig) => get(getCfg, vizConfig, context),
      /**
       * @param {CreateObjectConfig} createCfg
       * @param {VizConfig=} vizConfig
       * @returns {Viz}
       */
      create: (createCfg, vizConfig) => create(createCfg, vizConfig, context),
      theme(t) {
        root.theme(t);
        return api;
      },
      /**
       * @param {'ltr'|'rtl'} d
       */
      direction(d) {
        root.direction(d);
      },
      /**
       * @returns {AppSelections}
       */
      selections: () => {
        if (!selectionsApi) {
          selectionsApi = /** @lends AppSelections */ {
            ...app._selections, // eslint-disable-line no-underscore-dangle
            /**
             * @param {HTMLElement} element
             */
            mount(element) {
              if (selectionsComponentReference) {
                console.error('Already mounted');
                return;
              }
              selectionsComponentReference = AppSelectionsPortal({
                element,
                api: app._selections,
              });
              root.add(selectionsComponentReference);
            },
            /**
             *
             */
            unmount() {
              if (selectionsComponentReference) {
                root.remove(selectionsComponentReference);
                selectionsComponentReference = null;
              }
            },
          };
        }
        return selectionsApi;
      },
      types: context.types,
    };

    context.nebbie = api;

    return api;
  }

  /**
   * Creates a new `nucleus` instance using the specified configuration.
   *
   * The configuration is merged with all previous instances.
   * @param {Configuration} configuration
   * @returns {nucleus}
   * @example
   * import nucleus from '@nebula.js/nucleus';
   * // create a 'master' config which registers all types
   * const m = nucleus.configured({
   *   types: [{
   *     name: 'mekko',
   *     version: '1.0.0',
   *   }],
   * });
   *
   * // create an alternate config with dark theme
   * // and inherit the config from the previous
   * const d = m.configured({
   *  theme: 'dark'
   * });
   *
   * m(app).create({ type: 'mekko' }); // will render the object with default theme
   * d(app).create({ type: 'mekko' }); // will render the object with 'dark' theme
   * nucleus(app).create({ type: 'mekko' }); // will throw error since 'mekko' is not a register type on the default instance
   */
  nucleus.configured = c => nuked(mergeConfigs(configuration, c));

  return nucleus;
}

export default nuked(DEFAULT_CONFIG);
