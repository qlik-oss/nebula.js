/* eslint no-underscore-dangle:0 */
import 'regenerator-runtime/runtime'; // Polyfill for using async/await

import appLocaleFn from './locale/app-locale';
import appThemeFn from './app-theme';

import bootNebulaApp from './components/NebulaApp';
import AppSelectionsPortal from './components/selections/AppSelections';

import create from './object/create-object';
import get from './object/get-object';
import { create as typesFn } from './sn/types';
import loggerFn from './utils/logger';

/**
 * @interface
 * @alias ThemeInfo
 * @property {string} key Theme identifier
 * @property {function} load A function that should return a Promise that resolve to a raw JSON theme
 */

/**
 * @typedef {object}
 * @alias Configuration
 */
const DEFAULT_CONFIG = {
  context: {
    theme: 'light',
    language: 'en-US',
    permissions: ['idle', 'interact', 'select', 'fetch'],
  },
  /**
   *
   */
  load: () => undefined,
  log: {
    level: 1,
  },
  /**
   * @type {TypeInfo[]}
   */
  types: [],

  /**
   * @type {ThemeInfo[]}
   */
  themes: [],
  /** */
  env: {},

  snapshot: {
    get: async id => {
      const res = await fetch(`/njs/snapshot/${id}`);
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    capture(payload) {
      return fetch(`/njs/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).then(res => res.json());
    },
  },
};

const mergeConfigs = (base, c) => ({
  context: {
    ...base.context,
    ...(c.context || {}),
  },
  load: c.load || base.load,
  snapshot: {
    ...(c.snapshot || base.snapshot),
  },
  types: [
    // TODO - filter to avoid duplicates
    ...(base.types || []),
    ...(c.types || []),
  ],
  themes: [
    //
    ...(base.themes || []),
    ...(c.themes || []),
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

function nuked(configuration = {}) {
  const logger = loggerFn(configuration.log);
  const locale = appLocaleFn(configuration.context.language);

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

    let currentContext = {
      ...configuration.context,
      translator: locale.translator,
    };

    const [root] = bootNebulaApp({
      app,
      context: currentContext,
    });

    const appTheme = appThemeFn({
      themes: configuration.themes,
      logger,
      root,
    });

    const publicAPIs = {
      env: {
        translator: locale.translator,
        nucleus,
      },
      theme: appTheme.externalAPI,
      translator: locale.translator,
      nebbie: null, // actual value is set further down
    };

    const corona = {
      app,
      root,
      logger,
      config: configuration,
      public: publicAPIs,
      context: currentContext,
      nebbie: null,
    };

    const types = typesFn({ corona });

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

    let currentThemePromise = appTheme.setTheme(configuration.context.theme);

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
      get: async (getCfg, vizConfig) => {
        await currentThemePromise;
        return get(getCfg, vizConfig, corona);
      },
      /**
       * @param {CreateObjectConfig} createCfg
       * @param {VizConfig=} vizConfig
       * @returns {Viz}
       */
      create: async (createCfg, vizConfig) => {
        await currentThemePromise;
        return create(createCfg, vizConfig, corona);
      },
      /**
       * @param {object} ctx
       * @param {string} ctx.theme
       * @param {string} ctx.language
       * @param {string[]} ctx.permissions
       */
      context: async ctx => {
        // filter valid values to avoid triggering unnecessary rerender
        let changes;
        ['theme', 'language', 'permissions'].forEach(key => {
          if (ctx[key] && ctx[key] !== currentContext[key]) {
            if (!changes) {
              changes = {};
            }
            changes[key] = ctx[key];
          }
        });
        if (!changes) {
          return;
        }
        currentContext = {
          ...currentContext,
          ...changes,
          translator: locale.translator,
        };

        corona.context = currentContext;

        if (changes.theme) {
          currentThemePromise = appTheme.setTheme(changes.theme);
          await currentThemePromise;
        }

        if (changes.language) {
          corona.public.translator.language(changes.language);
        }

        root.context(currentContext);
      },
      /**
       * @returns {AppSelections}
       */
      selections: async () => {
        if (!selectionsApi) {
          const appSelections = await root.getAppSelections();
          selectionsApi = /** @lends AppSelections */ {
            ...appSelections,
            /**
             * @param {HTMLElement} element
             */
            mount(element) {
              if (selectionsComponentReference) {
                logger.error('Already mounted');
                return;
              }
              selectionsComponentReference = AppSelectionsPortal({
                element,
                app,
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
      types,
    };

    corona.public.nebbie = api;

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
  nucleus.config = configuration;

  return nucleus;
}

export default nuked(DEFAULT_CONFIG);
