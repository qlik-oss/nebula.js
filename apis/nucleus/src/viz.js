import cell from './components/boot';

import { get } from './object/observer';
import getPatches from './utils/patcher';

import eventMixin from './selections/event-mixin';

const noopi = () => {};

export default function({ model, context, initialUserProps = {} } = {}) {
  let reference = noopi;
  let elementReference = null;

  let supernovaReady;
  let layoutReady;
  let mounted;

  const whenLayoutReady = new Promise(resolve => {
    layoutReady = resolve;
  });
  const whenSupernovaReady = new Promise(resolve => {
    supernovaReady = resolve;
  });
  const whenMounted = new Promise(resolve => {
    mounted = resolve;
  });

  let userProps = {
    options: {},
    context: {
      permissions: [],
    },
    ...initialUserProps,
  };

  let objectProps = {
    layout: null,
    sn: null,
    error: null,
  };

  const cellApi = {
    userProps() {
      return userProps;
    },
    objectProps() {
      return objectProps;
    },
  };

  eventMixin(cellApi);

  const update = () => {
    cellApi.emit('changed');
  };

  const setUserProps = up => {
    userProps = {
      ...userProps,
      ...up,
    };
    update();
  };

  const setObjectProps = p => {
    objectProps = {
      ...objectProps,
      ...p,
    };
    if (objectProps.layout) {
      layoutReady();
    }
    if (objectProps.sn) {
      supernovaReady();
    }
    update();
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
      if (elementReference) {
        throw new Error('Already mounted');
      }
      elementReference = element;
      return Promise.all([whenLayoutReady, whenSupernovaReady]).then(() => {
        reference = cell({
          element,
          model,
          api: cellApi,
          nebulaContext: context,
          onInitial: mounted,
        });
        return whenMounted;
      });
    },
    /**
     *
     */
    close() {
      // TODO - destroy session object (if created as such)
      model.emit('closed');
      reference();
      reference = noopi;
    },
    setTemporaryProperties(props) {
      return get(model, 'effectiveProperties').then(current => {
        const patches = getPatches('/', props, current);
        if (patches.length) {
          return model.applyPatches(patches, true);
        }
        return Promise.resolve();
      });
    },
    options(opts) {
      setUserProps({
        options: opts,
      });
      return api;
    },
    context(ctx) {
      setUserProps({
        context: ctx,
      });
      return api;
    },
    takeSnapshot() {
      if (elementReference) {
        const content = elementReference.querySelector('.nebulajs-sn');
        if (content) {
          const rect = content.getBoundingClientRect();
          if (objectProps.sn) {
            const snapshot = {
              ...objectProps.layout,
              snapshotData: {
                object: {
                  size: {
                    w: rect.width,
                    h: rect.height,
                  },
                },
              },
            };

            if (typeof objectProps.sn.component.setSnapshotData === 'function') {
              return Promise.resolve(objectProps.sn.component.setSnapshotData(snapshot)).then(v => v || snapshot);
            }
            return Promise.resolve(snapshot);
          }
          return Promise.reject(new Error('No content'));
        }
      }
      return Promise.reject(new Error('Not mounted yet'));
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

  return {
    setObjectProps,
    api,
  };
}
