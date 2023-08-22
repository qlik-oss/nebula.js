/* eslint-disable no-underscore-dangle */
import EventEmitter from 'node-event-emitter';
import { convertTo as conversionConvertTo } from '@nebula.js/conversion';
import glueCell from './components/glue';
import getPatches from './utils/patcher';
import validatePlugins from './plugins/plugins';
import canSetProperties from './utils/can-set-properties';
import setProperties from './utils/set-properties';
import saveSoftProperties from './utils/save-soft-properties';

const noopi = () => {};

export default function viz({ model, halo, initialError, onDestroy = async () => {} } = {}) {
  let unmountCell = noopi;
  let cellRef = null;
  let mountedReference = null;
  let onMount = null;
  let onRender = null;
  const mounted = new Promise((resolve) => {
    onMount = resolve;
  });

  const rendered = new Promise((resolve) => {
    onRender = resolve;
  });

  const createOnInitialRender = (override) => () => {
    override && override();
    onRender();
  };

  let initialSnOptions = {};
  let initialSnPlugins = [];

  const emitter = new EventEmitter();

  const setSnOptions = async (opts) => {
    const override = opts.onInitialRender;
    if (mountedReference) {
      (async () => {
        await mounted;
        cellRef.current.setSnOptions({
          ...initialSnOptions,
          ...opts,
          ...{
            onInitialRender: createOnInitialRender(override),
          },
        });
      })();
    } else {
      // Handle setting options before mount
      initialSnOptions = {
        ...initialSnOptions,
        ...opts,
        ...{
          onInitialRender: createOnInitialRender(override),
        },
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
     * This visualizations Enigma model, a representation of the generic object.
     * @type {EngineAPI.IGenericObject}
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
     * Converts the visualization to a different registered type. Will update properties if permissions allow, else will patch.
     * Not all chart types are compatible, similar structures are required.
     * @since 1.1.0
     * @param {string} newType - Which registered type to convert to.
     * @param {boolean=} forceUpdate - Whether to apply the change through setProperties/applyPatches or not, defaults to true.
     * @returns {Promise<object>} Promise object that resolves to the full property tree of the converted visualization.
     * @example
     * const viz = await embed(app).render({
     *   element,
     *   id: 'abc'
     * });
     * await viz.convertTo('barChart');
     * const newProperties = await viz.convertTo('lineChart', false);
     */
    async convertTo(newType, forceUpdate = true) {
      if (forceUpdate) {
        const layout = await model.getLayout();
        if (canSetProperties(layout)) {
          const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType });
          await setProperties(model, propertyTree.qProperty);
          return propertyTree;
        }
        const oldProperties = await model.getEffectiveProperties();
        const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType, properties: oldProperties });
        const newProperties = propertyTree.qProperty;
        await saveSoftProperties(model, oldProperties, newProperties);
        return propertyTree;
      }
      const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType });
      return propertyTree;
    },
    /**
     * Converts the visualization to a different registered type using a patch. Only persists in session
     * @since 4.5.0
     * @param {string} newType - Which registered type to convert to.
     * @returns {Promise<object>} Promise object that resolves to the full property tree of the converted visualization.
     * @example
     * const viz = await embed(app).render({
     *   element,
     *   id: 'abc'
     * });
     * viz.convertTo('barChart');
     */
    async convertToByPatch(newType) {
      const oldProperties = await model.getEffectiveProperties();
      const propertyTree = await conversionConvertTo({ halo, model, cellRef, newType, properties: oldProperties });
      const newProperties = propertyTree.qProperty;
      await saveSoftProperties(model, oldProperties, newProperties);
      return propertyTree;
    },
    /**
     * Listens to custom events from inside the visualization. See useEmitter
     * @experimental
     * @param {string} eventName Event name to listen to
     * @param {Function} listener Callback function to invoke
     */
    addListener(eventName, listener) {
      emitter.addListener(eventName, listener);
    },
    /**
     * Removes a listener
     * @experimental
     * @param {string} eventName Event name to remove from
     * @param {Function} listener Callback function to remove
     */
    removeListener(eventName, listener) {
      emitter.removeListener(eventName, listener);
    },
    /**
     * Gets the specific api that a Viz exposes.
     * @returns {Promise<object>} object that contains the internal Viz api.
     */
    async getImperativeHandle() {
      await rendered;
      return cellRef.current.getImperativeHandle();
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
          emitter,
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
