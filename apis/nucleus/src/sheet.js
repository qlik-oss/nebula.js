/* eslint-disable no-underscore-dangle */
import glueSheet from './components/sheetGlue';
import validatePlugins from './plugins/plugins';
import getPatches from './utils/patcher';

const noopi = () => {};

export default function sheet({ model, halo, initialError, onDestroy = async () => {} } = {}) {
  let unmountSheet = noopi;
  let sheetRef = null;
  let mountedReference = null;
  let onMount = null;
  const mounted = new Promise((resolve) => {
    onMount = resolve;
  });

  let initialSnOptions = {};
  let initialSnPlugins = [];

  const setSnOptions = async (opts) => {
    if (mountedReference) {
      (async () => {
        await mounted;
        sheetRef.current.setSnOptions({
          ...initialSnOptions,
          ...opts,
        });
      })();
    } else {
      // Handle setting options before mount
      initialSnOptions = {
        ...initialSnOptions,
        ...opts,
      };
    }
  };

  const setSnPlugins = async (plugins) => {
    validatePlugins(plugins);
    if (mountedReference) {
      (async () => {
        await mounted;
        sheetRef.current.setSnPlugins(plugins);
      })();
    } else {
      // Handle setting plugins before mount
      initialSnPlugins = plugins;
    }
  };

  /**
   * @class
   * @alias Sheet
   * @classdesc A controller to further modify a visualization after it has been rendered.
   * @experimental
   * @since 3.1.0
   * @example
   * const sheet = await embed(app).render({
   *   element,
   *   id: "jD5Gd"
   * });
   * sheet.destroy();
   */
  const api = /** @lends Sheet# */ {
    /**
     * The id of this sheets's generic object.
     * @type {string}
     */
    id: model.id,
    /**
     * This sheets Enigma model, a representation of the generic object.
     * @type {string}
     */
    model,
    /**
     * Destroys the sheet and removes it from the the DOM.
     * @example
     * const sheet = await embed(app).render({
     *   element,
     *   id: "jD5Gd"
     * });
     * sheet.destroy();
     */
    async destroy() {
      await onDestroy();
      unmountSheet();
      unmountSheet = noopi;
    },
    // ===== unexposed experimental API - use at own risk ======
    __DO_NOT_USE__: {
      mount(element) {
        if (mountedReference) {
          throw new Error('Already mounted');
        }
        mountedReference = element;
        [unmountSheet, sheetRef] = glueSheet({
          halo,
          element,
          model,
          initialSnOptions,
          initialSnPlugins,
          initialError,
          onMount,
        });
        return mounted;
      },
      async applyProperties(props) {
        const current = await model.getEffectiveProperties();
        const patches = getPatches('/', props, current);
        if (patches.length) {
          return model.applyPatches(patches, true);
        }
        return undefined;
      },
      options(opts) {
        setSnOptions(opts);
      },
      plugins(plugins) {
        setSnPlugins(plugins);
      },
      exportImage() {
        throw new Error('Not implemented');
      },
      takeSnapshot() {
        throw new Error('Not implemented');
      },
      getModel() {
        return model;
      },
    },
  };

  return api;
}
