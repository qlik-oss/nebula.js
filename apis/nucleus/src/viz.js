import glueCell from './components/glue';

import { get } from './object/observer';
import getPatches from './utils/patcher';

import eventMixin from './selections/event-mixin';

const noopi = () => {};

export default function viz({ model, context: nebulaContext, initialUserProps = {} } = {}) {
  let unmountCell = noopi;
  let mountedReference = null;
  let onMount = null;
  const mounted = new Promise(resolve => {
    onMount = resolve;
  });

  let userProps = {
    options: {},
    context: {
      theme: nebulaContext.theme,
      permissions: [],
    },
    ...initialUserProps,
  };

  let objectProps = {
    layout: null,
    sn: null,
    error: null,
  };

  const vizGlue = {
    userProps() {
      return userProps;
    },
    objectProps() {
      return objectProps;
    },
  };

  eventMixin(vizGlue);

  const update = () => {
    vizGlue.emit('changed');
  };

  const setUserProps = up => {
    userProps = {
      ...userProps,
      ...up,
      context: {
        // DO NOT MAKE A DEEP COPY OF THEME AS IT WOULD MESS UP THE INSTANCE
        ...(userProps || {}).context,
        ...(up || {}).context,
        theme: nebulaContext.theme,
      },
    };
    update();
  };

  const setObjectProps = p => {
    objectProps = {
      ...objectProps,
      ...p,
    };
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
      if (mountedReference) {
        throw new Error('Already mounted');
      }
      mountedReference = element;
      unmountCell = glueCell({
        nebulaContext,
        element,
        model,
        snContext: userProps.context,
        snOptions: userProps.options,
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
      if (mountedReference) {
        const content = mountedReference.querySelector('.nebulajs-sn');
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
