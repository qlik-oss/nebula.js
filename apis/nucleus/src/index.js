/* eslint no-underscore-dangle:0 */
import appLocaleFn from './locale/app-locale';
import appThemeFn from './app-theme';

import bootNebulaApp from './components/NebulaApp';
import AppSelectionsPortal from './components/selections/AppSelections';

import create from './object/create-session-object';
import get from './object/get-object';
import flagsFn from './flags/flags';
import { create as typesFn } from './sn/types';

/**
 * @interface Context
 * @property {object=} constraints
 * @property {boolean=} constraints.active
 * @property {boolean=} constraints.passive
 * @property {boolean=} constraints.select
 */
const DEFAULT_CONTEXT = /** @lends Context */ {
  /** @type {string=} */
  theme: 'light',
  /** @type {string=} */
  language: 'en-US',
  constraints: {},
};

/**
 * @interface SnapshotConfiguration
 * @private
 */
const DEFAULT_SNAPSHOT_CONFIG = /** @lends SnapshotConfiguration */ {
  /**
   * @param {string} id
   * @returns {Promise<SnapshotLayout>}
   */
  get: async (id) => {
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
    }).then((res) => res.json());
  },
};

/**
 * @interface Configuration
 */
const DEFAULT_CONFIG = /** @lends Configuration */ {
  /**
   * @type {Context=}
   */
  context: DEFAULT_CONTEXT,
  load: () => undefined,
  /**
   * @type {(TypeInfo[])=}
   */
  types: [],

  /**
   * @type {(ThemeInfo[])=}
   */
  themes: [],

  /** @type {object=} */
  anything: {},

  /**
   * @type {SnapshotConfiguration=}
   * @private
   */
  snapshot: DEFAULT_SNAPSHOT_CONFIG,
};

const mergeObj = (o1 = {}, o2 = {}) => {
  return {
    ...o1,
    ...o2,
  };
};
const mergeArray = (a1 = [], a2 = []) => {
  // Simple merge and deduplication
  return [...a1, ...a2].filter((v, i, a) => a.indexOf(v) === i);
};

const mergeConfigs = (base, c) => ({
  context: mergeObj(base.context, c.context),
  load: c.load || base.load,
  snapshot: {
    ...(c.snapshot || base.snapshot),
  },
  types: mergeArray(base.types, c.types),
  themes: mergeArray(base.themes, c.themes),
  flags: mergeObj(base.flags, c.flags),
  anything: mergeObj(base.anything, c.anything),
});

function nuked(configuration = {}) {
  const locale = appLocaleFn(configuration.context.language);

  /**
   * Initiates a new embed instance using the specified `app`.
   * @entry
   * @function embed
   * @param {enigma.Doc} app
   * @param {Configuration=} instanceConfig
   * @returns {Embed}
   * @example
   * import { embed } from '@nebula.js/stardust'
   * const n = embed(app);
   * n.render({ id: 'abc' });
   */
  function embed(app, instanceConfig) {
    if (instanceConfig) {
      return embed.createConfiguration(instanceConfig)(app);
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
      root,
    });

    const publicAPIs = {
      galaxy: /** @lends Galaxy */ {
        /** @type {Translator} */
        translator: locale.translator,
        // TODO - validate flags input
        /** @type {Flags} */
        flags: flagsFn(configuration.flags),
        /** @type {object} */
        anything: configuration.anything,
      },
      theme: appTheme.externalAPI,
      translator: locale.translator,
      nebbie: null, // actual value is set further down
    };

    const corona = {
      app,
      root,
      config: configuration,
      public: publicAPIs,
      context: currentContext,
      nebbie: null,
    };

    const types = typesFn({ corona });

    configuration.types.forEach((t) =>
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
     * @class
     * @alias Embed
     * @hideconstructor
     */
    const api = /** @lends Embed# */ {
      /**
       * Renders a visualization into an HTMLElement.
       * @param {CreateConfig | GetConfig} cfg - The render configuration.
       * @returns {Promise<SupernovaController>} A controller to the rendered visualization
       * @example
       * // render from existing object
       * n.render({
       *   element: el,
       *   id: 'abcdef'
       * });
       * @example
       * // render on the fly
       * n.render({
       *   type: 'barchart',
       *   fields: ['Product', { qLibraryId: 'u378hn', type: 'measure' }]
       * });
       */
      render: async (cfg) => {
        await currentThemePromise;
        if (cfg.id) {
          return get(cfg, corona);
        }
        return create(cfg, corona);
      },
      /**
       * Updates the current context of this embed instance.
       * Use this when you want to change some part of the current context, like theme.
       * @param {Context} ctx - The context to update.
       * @returns {Promise<undefined>}
       * @example
       * // change theme
       * n.context({ theme: 'dark'});
       * @example
       * // limit constraints
       * n.context({ constraints: { active: true } });
       */
      context: async (ctx) => {
        // filter valid values to avoid triggering unnecessary rerender
        let changes;
        ['theme', 'language', 'constraints'].forEach((key) => {
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
       * Gets the app selections of this instance.
       * @returns {Promise<AppSelections>}
       * @example
       * const selections = await n.selections();
       * selections.mount(element);
       */
      selections: async () => {
        if (!selectionsApi) {
          // const appSelections = await root.getAppSelections(); // Don't expose this for now
          selectionsApi = /** @lends AppSelections# */ {
            /**
             * Mounts the app selection UI into the provided HTMLElement
             * @param {HTMLElement} element
             * @example
             * selections.mount(element);
             */
            mount(element) {
              if (selectionsComponentReference) {
                if (__NEBULA_DEV__) {
                  console.error('Already mounted'); // eslint-disable-line no-console
                }
                return;
              }
              selectionsComponentReference = AppSelectionsPortal({
                element,
                app,
              });
              root.add(selectionsComponentReference);
            },
            /**
             * Unmounts the app selection UI from the DOM
             * @example
             * selections.unmount();
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
   * Creates a new `embed` scope bound to the specified `configuration`.
   *
   * The configuration is merged with all previous scopes.
   * @memberof embed
   * @param {Configuration} configuration - The configuration object
   * @returns {Embed}
   * @example
   * import { embed } from '@nebula.js/stardust';
   * // create a 'master' config which registers all types
   * const m = embed.createConfiguration({
   *   types: [{
   *     name: 'mekko',
   *     version: '1.0.0',
   *     load: () => Promise.resolve(mekko)
   *   }],
   * });
   *
   * // create an alternate config with dark theme
   * // and inherit the config from the previous
   * const d = m.createConfiguration({
   *  theme: 'dark'
   * });
   *
   * m(app).render({ type: 'mekko' }); // will render the object with default theme
   * d(app).render({ type: 'mekko' }); // will render the object with 'dark' theme
   * embed(app).render({ type: 'mekko' }); // will throw error since 'mekko' is not a register type on the default instance
   */
  embed.createConfiguration = (c) => nuked(mergeConfigs(configuration, c));
  embed.config = configuration;

  return embed;
}

/**
 * @interface ThemeInfo
 * @property {string} id Theme identifier
 * @property {function(): Promise<ThemeJSON>} load A function that should return a Promise that resolve to a raw JSON theme
 */

export default nuked(DEFAULT_CONFIG);
