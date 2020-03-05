import glueCell from './components/glue';

import getPatches from './utils/patcher';

const noopi = () => {};

export default function viz({ model, corona, initialError, onDestroy = async () => {} } = {}) {
  let unmountCell = noopi;
  let cellRef = null;
  let mountedReference = null;
  let onMount = null;
  const mounted = new Promise(resolve => {
    onMount = resolve;
  });

  let initialSnOptions = {};

  const setSnOptions = async opts => {
    if (mountedReference) {
      (async () => {
        await mounted;
        cellRef.current.setSnOptions({
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

  /**
   * @interface
   * @alias Viz
   */
  const api = /** @lends Viz */ {
    /**
     * @type {EnigmaObjectModel}
     */
    model,
    // app,
    /**
     * @param {HTMLElement} element
     * @returns {Promise}
     */
    mount(element) {
      if (mountedReference) {
        throw new Error('Already mounted');
      }
      mountedReference = element;
      [unmountCell, cellRef] = glueCell({
        corona,
        element,
        model,
        initialSnOptions,
        initialError,
        onMount,
      });
      return mounted;
    },
    /**
     *
     */
    async destroy() {
      // TODO - destroy session object (if created as such)
      await onDestroy();
      unmountCell();
      unmountCell = noopi;
    },
    async setTemporaryProperties(props) {
      const current = await model.getEffectiveProperties();
      const patches = getPatches('/', props, current);
      if (patches.length) {
        return model.applyPatches(patches, true);
      }
      return undefined;
    },
    options(opts) {
      setSnOptions(opts);
      // return api;
    },
    exportImage() {
      // TODO - check if exportable
      return cellRef.current.exportImage();
    },

    // DEBUG MODE ?
    // TODO - decide if this method is useful as part of public API
    takeSnapshot() {
      return cellRef.current.takeSnapshot();
    },

    // QVisualization API
    // close() {},
    // exportData() {},
    // exportImg() {},
    // exportPdf() {},
    // setOptions() {}, // applied soft patch
    // resize() {},
    // show() {},
    // toggleDataView() {},
  };

  return api;
}
