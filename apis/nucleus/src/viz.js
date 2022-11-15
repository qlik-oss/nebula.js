/* eslint-disable no-underscore-dangle */
import { convertTo as conversionConvertTo } from '@nebula.js/conversion';
import glueCell from './components/glue';
import getPatches from './utils/patcher';
import validatePlugins from './plugins/plugins';

const noopi = () => {};

export default function viz({ model, halo, initialError, onDestroy = async () => {} } = {}) {
  let unmountCell = noopi;
  let cellRef = null;
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

  const setSnPlugins = async (plugins) => {
    validatePlugins(plugins);
    if (mountedReference) {
      (async () => {
        await mounted;
        cellRef.current.setSnPlugins(plugins);
      })();
    } else {
      // Handle setting plugins before mount
      initialSnPlugins = plugins;
    }
  };

  /**
   * @class
   * @alias Viz
   * @classdesc A controller to further modify a visualization after it has been rendered.
   * @example
   * const viz = await embed(app).render({
   *   element,
   *   type: 'barchart'
   * });
   * viz.destroy();
   */
  const api = /** @lends Viz# */ {
    /**
     * The id of this visualization's generic object.
     * @type {string}
     */
    id: model.id,
    /**
     * This visualization's Enigma model, a representation of the generic object.
     * @type {string}
     */
    model,
    /**
     * Destroys the visualization and removes it from the the DOM.
     * @example
     * const viz = await embed(app).render({
     *   element,
     *   id: 'abc'
     * });
     * viz.destroy();
     */
    async destroy() {
      await onDestroy();
      unmountCell();
      unmountCell = noopi;
    },
    /**
     * Converts the visualization to a different registered type
     * @since 1.1.0
     * @param {string} newType - Which registered type to convert to.
     * @param {boolean=} forceUpdate - Whether to run setProperties or not, defaults to true.
     * @returns {Promise<object>} Promise object that resolves to the full property tree of the converted visualization.
     * @example
     * const viz = await embed(app).render({
     *   element,
     *   id: 'abc'
     * });
     * viz.convertTo('barChart');
     */
    async convertTo(newType, forceUpdate = true) {
      const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType });
      if (forceUpdate) {
        if (model.__snInterceptor) {
          await model.__snInterceptor.setProperties.call(model, propertyTree.qProperty);
        } else {
          await model.setProperties(propertyTree.qProperty);
        }
      }
      return propertyTree;
    },
    // ===== unexposed experimental API - use at own risk ======
    __DO_NOT_USE__: {
      mount(element) {
        if (mountedReference) {
          throw new Error('Already mounted');
        }
        mountedReference = element;
        [unmountCell, cellRef] = glueCell({
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
        return cellRef.current.exportImage();
      },
      takeSnapshot() {
        return cellRef.current.takeSnapshot();
      },
      getModel() {
        return model;
      },
    },

    // old QVisualization API
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
