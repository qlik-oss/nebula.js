/* eslint no-underscore-dangle:0 */
import React from 'react';
import appLocaleFn from './locale/app-locale';
import appThemeFn from './app-theme';
import deviceTypeFn from './device-type';

import bootNebulaApp from './components/NebulaApp';
import AppSelectionsPortal from './components/selections/AppSelections';
import ListBoxPortal, { getOptions as getListboxPortalOptions } from './components/listbox/ListBoxPortal';
import ListBoxPopoverWrapper, {
  getOptions as getListboxPopoverOptions,
} from './components/listbox/ListBoxPopoverWrapper';

import create from './object/create-session-object';
import get from './object/get-generic-object';
import flagsFn from './flags/flags';
import { create as typesFn } from './sn/types';
import uid from './object/uid';
import eventmixin from './selections/event-mixin';

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
 * @property {LoadType=} load Fallback load function for missing types
 * @property {Context=} context Settings for the rendering instance
 * @property {Array<TypeInfo>=} types Visualization types to register
 * @property {Array<ThemeInfo>=} themes Themes to register
 * @property {object=} anything
 * @example
 * import { embed } from '@nebula.js/stardust'
 * n = embed(app, {
 *   context: {
 *     keyboardNavigation: true,
 *     theme: 'purple',
 *   },
 *   load: ({ name, version }) => {
 *     if (name === 'linechart') {
 *       return Promise.resolve(line);
 *     }
 *   },
 *   types: [
 *     {
 *       name: 'bar',
 *       load: () => Promise.resolve(bar),
 *     },
 *   ],
 *   themes: [
 *     {
 *       id: 'purple',
 *       load: () => Promise.resolve(purpleThemeJson),
 *     },
 *   ],
 * });
 */

const DEFAULT_CONFIG = {
  context: {},
  load: () => undefined,
  types: [],
  themes: [],
  anything: {},
  snapshot: DEFAULT_SNAPSHOT_CONFIG,
};

/**
 * @interface Context
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

DEFAULT_CONFIG.context = DEFAULT_CONTEXT;

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

/**
 * @ignore
 * @typedef {function(promise)} PromiseFunction A callback function which receives a request promise as the first argument.
 */

/**
 * @ignore
 * @typedef {function(function)} ReceiverFunction A callback function which receives another function as input.
 */

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
    currentContext.themeApi = appTheme.externalAPI;

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
     * @ignore
     * @typedef { 'fieldPopoverClose' } EmbedEventTypes
     */

    /**
     * Event listener function on instance
     *
     * @ignore
     * @method
     * @name Embed#on
     * @param {EmbedEventTypes} eventType event type that function needs to listen
     * @param {Function} callback a callback function to run when event emits
     * @example
     * api.on('someEvent', () => {...});
     */

    /**
     * @class
     * @alias Embed
     */
    const api = /** @lends Embed# */ {
      /**
       * Renders a visualization or sheet into an HTMLElement.
       * Support for sense sheets is experimental.
       * @param {CreateConfig | GetConfig} cfg - The render configuration.
       * @returns {Promise<Viz|Sheet>} A controller to the rendered visualization or sheet.
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
       * @param {string|LibraryField|QInfo} fieldIdentifier Fieldname as a string, a Library dimension or an object id
       * @returns {Promise<FieldInstance>}
       * @since 1.1.0
       * @example
       * const fieldInstance = await n.field("MyField");
       * fieldInstance.mount(element, { title: "Hello Field"});
       */
      field: async (fieldIdentifier) => {
        let qId;
        const fieldName = typeof fieldIdentifier === 'string' ? fieldIdentifier : fieldIdentifier.qLibraryId;
        if (fieldIdentifier.qId) {
          qId = fieldIdentifier.qId;
        } else if (!fieldName) {
          throw new Error(`Field identifier or object id must be provided`);
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
         * @typedef { boolean | 'toggle' | 'inSelection' } SearchMode
         */

        /**
         * @typedef { 'selectionActivated' | 'selectionDeactivated' } FieldEventTypes
         */

        /**
         * Event listener function on instance
         *
         * @method
         * @name FieldInstance#on
         * @param {FieldEventTypes} eventType event type that function needs to listen
         * @param {Function} callback a callback function to run when event emits
         * @example
         * const handleSomeEvent () => {...};
         * fieldInstance.on('someEvent', handleSomeEvent);
         * ...
         * fieldInstance.removeListener('someEvent', handleSomeEvent);
         */

        /**
         * Remove listener on instance
         *
         * @method
         * @name FieldInstance#removeListener
         * @param {FieldEventTypes} eventType event type
         * @param {Function} callback handler
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
           * @param {string=} options.title Custom title, defaults to fieldname (not applicable for existing objects)
           * @param {Direction=} [options.direction=ltr] Direction setting ltr|rtl.
           * @param {ListLayout=} [options.listLayout=vertical] Layout direction vertical|horizontal (not applicable for existing objects)
           * @param {FrequencyMode=} [options.frequencyMode=none] Show frequency none|value|percent|relative
           * @param {boolean=} [options.histogram=false] Show histogram bar (not applicable for existing objects)
           * @param {SearchMode=} [options.search=true] Show the search bar permanently, using the toggle button or when in selection: false|true|toggle|inSelection
           * @param {boolean=} [options.toolbar=true] Show the toolbar
           * @param {boolean=} [options.checkboxes=false] Show values as checkboxes instead of as fields (not applicable for existing objects)
           * @param {boolean=} [options.dense=false] Reduces padding and text size (not applicable for existing objects)
           * @param {string=} [options.stateName="$"] Sets the state to make selections in (not applicable for existing objects)
           * @param {object=} [options.properties={}] Properties object to extend default properties with
           *
           * @since 1.1.0
           * @instance
           * @example
           * fieldInstance.mount(element);
           */
          mount(element, options = {}) {
            if (!element) {
              throw new Error(`Element for ${fieldName || qId} not provided`);
            }
            if (this._instance) {
              throw new Error(`Field or object ${fieldName || qId} already mounted`);
            }
            const onSelectionActivated = () => fieldSels.emit('selectionActivated');
            const onSelectionDeactivated = () => fieldSels.emit('selectionDeactivated');
            this._instance = ListBoxPortal({
              element,
              app,
              fieldIdentifier,
              qId,
              options: getListboxPortalOptions({
                onSelectionActivated,
                onSelectionDeactivated,
                ...options,
              }),
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
        eventmixin(fieldSels);
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
        popover(anchorElement, fieldIdentifier, options) {
          if (api._popoverInstance) {
            root.remove(api._popoverInstance);
            api._popoverInstance = null;
          }
          const onPopoverClose = () => api.emit('fieldPopoverClose');
          const opts = getListboxPopoverOptions({ onPopoverClose, ...options });
          api._popoverInstance = React.createElement(ListBoxPopoverWrapper, {
            element: anchorElement,
            key: uid(),
            app,
            fieldIdentifier,
            options: opts,
            stateName: options.stateName || '$',
          });
          root.add(api._popoverInstance);
        },
      },
    };

    halo.public.nebbie = api;
    halo.types = types;

    eventmixin(api);
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

/**
 * @interface QInfo
 * @property {string} qId Generic object id
 */

export default nuked(DEFAULT_CONFIG);
