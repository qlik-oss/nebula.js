/* eslint no-underscore-dangle:0 */
import appLocaleFn from './locale/app-locale';
import appThemeFn from './app-theme';
import deviceTypeFn from './device-type';

import bootNebulaApp from './components/NebulaApp';
import AppSelectionsPortal from './components/selections/AppSelections';
import ListBoxPortal from './components/listbox/ListBoxInline';

import create from './object/create-session-object';
import get from './object/get-object';
import flagsFn from './flags/flags';
import { create as typesFn } from './sn/types';

/**
 * @interface Context
 * @property {boolean=} disableCellPadding
 * @property {boolean=} keyboardNavigation
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
  /** @type {string=} */
  deviceType: 'auto',
  constraints: {},
  keyboardNavigation: false,
  disableCellPadding: false,
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

/**
 * @interface Galaxy
 */

const mergeObj = (o1 = {}, o2 = {}) => ({
  ...o1,
  ...o2,
});
const mergeArray = (a1 = [], a2 = []) =>
  // Simple merge and deduplication
  [...a1, ...a2].filter((v, i, a) => a.indexOf(v) === i);
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
   * Initiates a new `Embed` instance using the specified enigma `app`.
   * @entry
   * @function embed
   * @param {EngineAPI.IApp} app
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
        /** @type {string} */
        deviceType: deviceTypeFn(configuration.context.deviceType),
        /** @type {object} */
        anything: configuration.anything,
      },
      theme: appTheme.externalAPI,
      translator: locale.translator,
      nebbie: null, // actual value is set further down
    };

    const halo = {
      app,
      root,
      config: configuration,
      public: publicAPIs,
      context: currentContext,
      types: null,
    };

    const types = typesFn({ halo });

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
     */
    const api = /** @lends Embed# */ {
      /**
       * Renders a visualization into an HTMLElement.
       * @param {CreateConfig | GetConfig} cfg - The render configuration.
       * @returns {Promise<Viz>} A controller to the rendered visualization.
       * @example
       * // render from existing object
       * n.render({
       *   element: el,
       *   id: 'abcdef'
       * });
       * @example
       * // render on the fly
       * n.render({
       *   element: el,
       *   type: 'barchart',
       *   fields: ['Product', { qLibraryId: 'u378hn', type: 'measure' }]
       * });
       */
      render: async (cfg) => {
        await currentThemePromise;
        if (cfg.id) {
          return get(cfg, halo);
        }
        return create(cfg, halo);
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
        ['theme', 'language', 'constraints', 'keyboardNavigation'].forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(ctx, key) && ctx[key] !== currentContext[key]) {
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

        halo.context = currentContext;

        if (changes.theme) {
          currentThemePromise = appTheme.setTheme(changes.theme);
          await currentThemePromise;
        }

        if (changes.language) {
          halo.public.translator.language(changes.language);
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
             * Mounts the app selection UI into the provided HTMLElement.
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
             * Unmounts the app selection UI from the DOM.
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
      /**
       * Gets the listbox instance of the specified field
       * @param {string|LibraryField} fieldIdentifier Fieldname as a string or a Library dimension
       * @returns {Promise<FieldInstance>}
       * @since 1.1.0
       * @example
       * const fieldInstance = await n.field("MyField");
       * fieldInstance.mount(element, { title: "Hello Field"});
       */
      field: async (fieldIdentifier) => {
        const fieldName = typeof fieldIdentifier === 'string' ? fieldIdentifier : fieldIdentifier.qLibraryId;
        if (!fieldName) {
          throw new Error(`Field identifier must be provided`);
        }

        /**
         * @typedef { 'ltr' | 'rtl' } Direction
         */

        /**
         * @typedef { 'vertical' | 'horizontal' } ListLayout
         */

        /**
         * @typedef { 'none' | 'value' | 'percent' | 'relative' } FrequencyMode
         */

        /**
         * @typedef {function(function)} ReceiverFunction A callback function which receives another function as input.
         */

        /**
         * @typedef {object} c SwitchButtonConfig
         * @param {string} c.option The option to be toggled. Currently supporting: 'checkboxes', 'search', 'toolbar', 'rangeSelect', 'dense'.
         * @param {boolean=} [c.invert=false] Invert the switch button's value when applied on the option.
         * @param {boolean=} [c.startOn=false] Start the switch turned on (note that this will not change the initial value of the option).
         * @param {string} [c.label] A label for the switch.
         * @param {string} [c.helperText] A helper text label for the switch.
         * @param {object} [c.iconOn] CSS styling for the switch's on state (applied on span::after).
         * @param {object} [c.iconOff] CSS styling for the switch's off state (applied on span::before).
         * @param {function} [c.onChange] A function for defining a custom callback or for setting multiple properties using the provided setOptions function.
         * @example
         * const switchButtonConfig = {
         *   option: 'dense',
         *   invert: false,
         *   label: 'Dense mode',
         *   helperText: 'Render fields denser.',
         *   startOn: false,
         *   iconOff: {
         *     backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 16 16"><path fill="${encodeURIComponent(
         *       'rgb(0 0 0 / 0.30)'
         *     )}" d="M12.5,0 C14.4,0 16,1.6 16,3.5 C16,5.4 14.4,7 12.5,7 C11.8,7 11.2,6.8 10.6,6.4 L9.8,7.2 C9.9,7.5 10,7.7 10,8 C10,9.1 9.1,10 8,10 C7.7,10 7.5,9.9 7.2,9.8 L6.4,10.6 C6.8,11.2 7,11.8 7,12.5 C7,14.4 5.4,16 3.5,16 C1.6,16 0,14.4 0,12.5 C0,10.6 1.6,9 3.5,9 C4.2,9 4.8,9.2 5.4,9.6 L6.2,8.8 C6.1,8.5 6,8.3 6,8 C6,6.9 6.9,6 8,6 C8.3,6 8.5,6.1 8.8,6.2 L9.6,5.4 C9.2,4.8 9,4.2 9,3.5 C9,1.6 10.6,0 12.5,0 Z M4.9,13.9 C5.3,13.5 5.5,13 5.5,12.5 C5.5,12 5.3,11.5 4.9,11.1 C4.5,10.7 4,10.5 3.5,10.5 C3,10.5 2.5,10.7 2.1,11.1 C1.7,11.5 1.5,12 1.5,12.5 C1.5,13 1.7,13.5 2.1,13.9 C2.5,14.3 3,14.5 3.5,14.5 C4,14.5 4.5,14.3 4.9,13.9 Z M13.9,4.9 C14.3,4.5 14.5,4 14.5,3.5 C14.5,3 14.3,2.5 13.9,2.1 C13.5,1.7 13,1.5 12.5,1.5 C12,1.5 11.5,1.7 11.1,2.1 C10.7,2.5 10.5,3 10.5,3.5 C10.5,4 10.7,4.5 11.1,4.9 C11.5,5.3 12,5.5 12.5,5.5 C13,5.5 13.5,5.3 13.9,4.9 Z"/></svg>')`,
         *     right: 3,
         *     transform: 'rotate(90deg) scale(0.7)',
         *   },
         *   iconOn: {
         *     backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 16 16"><path fill="${encodeURIComponent(
         *       '#FFFFFF'
         *     )}" d="M12.5,0 C14.4,0 16,1.6 16,3.5 C16,5.4 14.4,7 12.5,7 C11.8,7 11.2,6.8 10.6,6.4 L9.8,7.2 C9.9,7.5 10,7.7 10,8 C10,9.1 9.1,10 8,10 C7.7,10 7.5,9.9 7.2,9.8 L6.4,10.6 C6.8,11.2 7,11.8 7,12.5 C7,14.4 5.4,16 3.5,16 C1.6,16 0,14.4 0,12.5 C0,10.6 1.6,9 3.5,9 C4.2,9 4.8,9.2 5.4,9.6 L6.2,8.8 C6.1,8.5 6,8.3 6,8 C6,6.9 6.9,6 8,6 C8.3,6 8.5,6.1 8.8,6.2 L9.6,5.4 C9.2,4.8 9,4.2 9,3.5 C9,1.6 10.6,0 12.5,0 Z M4.9,13.9 C5.3,13.5 5.5,13 5.5,12.5 C5.5,12 5.3,11.5 4.9,11.1 C4.5,10.7 4,10.5 3.5,10.5 C3,10.5 2.5,10.7 2.1,11.1 C1.7,11.5 1.5,12 1.5,12.5 C1.5,13 1.7,13.5 2.1,13.9 C2.5,14.3 3,14.5 3.5,14.5 C4,14.5 4.5,14.3 4.9,13.9 Z M13.9,4.9 C14.3,4.5 14.5,4 14.5,3.5 C14.5,3 14.3,2.5 13.9,2.1 C13.5,1.7 13,1.5 12.5,1.5 C12,1.5 11.5,1.7 11.1,2.1 C10.7,2.5 10.5,3 10.5,3.5 C10.5,4 10.7,4.5 11.1,4.9 C11.5,5.3 12,5.5 12.5,5.5 C13,5.5 13.5,5.3 13.9,4.9 Z"/></svg>')`,
         *     left: 3,
         *     transform: 'rotate(90deg) scale(0.7)',
         *   },
         *   onChange: (on, { setOptions }) => {
         *     setOptions({ checkboxes: !on, search: on }); // manual option changes (will be applied in addition to `dense`).
         *   },
         * };
         * ```
         */

        /**
         * @class
         * @alias FieldInstance
         * @since 1.1.0
         */
        const fieldSels = {
          fieldName,
          /**
           * Mounts the field as a listbox into the provided HTMLElement.
           * @param {HTMLElement} element
           * @param {object=} options Settings for the embedded listbox
           * @param {string=} options.title Custom title, defaults to fieldname
           * @param {Direction=} [options.direction=ltr] Direction setting ltr|rtl.
           * @param {ListLayout=} [options.listLayout=vertical] Layout direction vertical|horizontal
           * @param {FrequencyMode=} [options.frequencyMode=none] Show frequency none|value|percent|relative
           * @param {boolean=} [options.search=true] Show the search bar
           * @param {boolean=} [options.toolbar=true] Show the toolbar
           * @param {boolean=} [options.checkboxes=false] Show values as checkboxes instead of as fields
           * @param {SwitchButtonConfig=} [options.switchButton=undefined] Show a switch button which can toggle boolean Listbox options.
           * @param {boolean=} [options.rangeSelect=true] Enable range selection
           * @param {boolean=} [options.dense=false] Reduces padding and text size
           * @param {boolean=} [options.stateName="$"] Sets the state to make selections in
           * @param {object=} [options.properties={}] Properties object to extend default properties with
           * @param {object} [options.sessionModel] Use a custom sessionModel.
           * @param {object} [options.selectionsApi] Use a custom selectionsApi to customize how values are selected.
           * @param {ReceiverFunction} [options.update] A function which receives an update function which upon call will trigger a data fetch.
           * @since 1.1.0
           * @instance
           * @example
           * fieldInstance.mount(element);
           */
          mount(element, options = {}) {
            if (!element) {
              throw new Error(`Element for ${fieldName} not provided`);
            }
            if (this._instance) {
              throw new Error(`Field ${fieldName} already mounted`);
            }
            this._instance = ListBoxPortal({
              element,
              app,
              fieldIdentifier,
              options,
              stateName: options.stateName || '$',
            });
            root.add(this._instance);
          },
          /**
           * Unmounts the field listbox from the DOM.
           * @since 1.1.0
           * @instance
           * @example
           * listbox.unmount();
           */
          unmount() {
            if (this._instance) {
              root.remove(this._instance);
              this._instance = null;
            }
          },
        };
        return fieldSels;
      },
      /**
       * Gets a list of registered visualization types and versions
       * @function
       * @returns {Array<Object>} types
       * @example
       * const types = n.getRegisteredTypes();
       * // Contains
       * //[
       * // {
       * //   name: "barchart"
       * //   versions:[undefined, "1.2.0"]
       * // }
       * //]
       */
      getRegisteredTypes: types.getList,
      __DO_NOT_USE__: {
        types,
      },
    };

    halo.public.nebbie = api;
    halo.types = types;

    return api;
  }

  /**
   * Creates a new `embed` scope bound to the specified `configuration`.
   *
   * The configuration is merged with all previous scopes.
   * @memberof embed
   * @param {Configuration} configuration - The configuration object
   * @returns {embed}
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
   *  context: {
   *    theme: 'dark'
   *  }
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
 * @typedef {any} ThemeJSON
 */

/**
 * @interface ThemeInfo
 * @property {string} id Theme identifier
 * @property {function(): Promise<ThemeJSON>} load A function that should return a Promise that resolves to a raw JSON theme.
 */

export default nuked(DEFAULT_CONFIG);
