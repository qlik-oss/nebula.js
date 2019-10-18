/* eslint no-underscore-dangle:0 */
import 'regenerator-runtime/runtime'; // Polyfill for using async/await

import themeFn from '@nebula.js/theme';

import localeFn from './locale';

import { createAppSelectionAPI } from './selections';

import App from './components/NebulaApp';
import AppSelectionsPortal from './components/selections/AppSelections';

import create from './object/create-object';
import get from './object/get-object';
import { create as typesFn } from './sn/types';
import loggerFn from './utils/logger';

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
    level: 1,
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
  log: {
    ...(base.log || {}),
    ...(c.log || {}),
  },
});

function nuked(configuration = {}, prev = {}) {
  const logger = loggerFn(configuration.log);
  const locale = localeFn(configuration.locale);

  const config = {
    env: {
      Promise,
      translator: locale.translator(),
      nucleus, // eslint-disable-line no-use-before-define
    },
    load: configuration.load,
  };

  const types = typesFn({ logger, config, parent: prev.types });

  configuration.types.forEach(t =>
    types.register(
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
  function nucleus(app, instanceConfig) {
    if (instanceConfig) {
      return nucleus.configured(instanceConfig)(app);
    }

    createAppSelectionAPI(app);

    const root = App({
      app,
      translator: locale.translator(),
      theme: configuration.theme,
      direction: configuration.direction,
    });

    const theme = themeFn();

    const context = {
      nebbie: null,
      app,
      config,
      logger,
      types,
      root,
      theme: theme.externalAPI,
    };

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
        theme.internalAPI.setTheme({
          type: t,
        });
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
