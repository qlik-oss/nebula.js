import glueCell from './components/glue';

import { get } from './object/observer';
import getPatches from './utils/patcher';

const noopi = () => {};

export default function viz({ model, context: nebulaContext } = {}) {
  let unmountCell = noopi;
  let cellRef = null;
  let mountedReference = null;
  let onMount = null;
  const mounted = new Promise(resolve => {
    onMount = resolve;
  });

  let initialSnContext = {
    theme: nebulaContext.theme,
  };
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
      initialSnOptions = {
        ...initialSnOptions,
        ...opts,
      };
    }
  };

  const setSnContext = async ctx => {
    if (mountedReference) {
      (async () => {
        await mounted;
        cellRef.current.setSnContext({
          ...initialSnContext,
          ...ctx,
          theme: nebulaContext.theme,
        });
      })();
    } else {
      initialSnContext = {
        ...initialSnContext,
        ...ctx,
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
        nebulaContext,
        element,
        model,
        initialSnContext,
        initialSnOptions,
        onMount,
      });
      return mounted;
    },
    /**
     *
     */
    close() {
      // TODO - destroy session object (if created as such)
      model.emit('closed');
      unmountCell();
      unmountCell = noopi;
    },
    setTemporaryProperties(props) {
      return get(model, 'effectiveProperties').then(current => {
        const patches = getPatches('/', props, current);
        if (patches.length) {
          return model.applyPatches(patches, true);
        }
        return undefined;
      });
    },
    options(opts) {
      setSnOptions(opts);
      return api;
    },
    context(ctx) {
      setSnContext(ctx);
      return api;
    },
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

  return [api, mounted];
}
