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
   * @entry
   * @alias nucleus
   * @param {EnigmaAppModel} app
   * @param {Configuration=} instanceConfig
   * @returns {Nebbie}
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
   * @param {Configuration} configuration
   * @returns {nucleus}
   */
  nucleus.configured = c => nuked(mergeConfigs(configuration, c));

  return nucleus;
}

export default nuked(DEFAULT_CONFIG);
