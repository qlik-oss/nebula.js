import cell from './components/boot';

import { get } from './object/observer';
import getPatches from './utils/patcher';

import eventMixin from './selections/event-mixin';

const noopi = () => {};

export default function ({
  model,
  context,
  initialUserProps = {},
} = {}) {
  let reference = noopi;
  let elementReference = null;

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

  let queueShow = false;

  const mount = (element) => {
    if (!objectProps.layout) {
      queueShow = element;
      return;
    }
    elementReference = element;
    reference = cell({
      element,
      model,
      api: cellApi,
      nebulaContext: context,
    });
  };

  const update = () => {
    if (queueShow && objectProps.layout) {
      mount(queueShow);
      queueShow = false;
    }
    cellApi.emit('changed');
  };

  const setUserProps = (up) => {
    userProps = {
      ...userProps,
      ...up,
    };
    update();
  };

  const setObjectProps = (p) => {
    objectProps = {
      ...objectProps,
      ...p,
    };
    update();
  };

  const api = {
    model,
    // app,
    mount(element) {
      // TODO - remount if already mounted
      mount(element);
    },
    close() {
      // TODO - destroy session object (if created as such)
      model.emit('closed');
      reference();
      reference = noopi;
    },
    setTemporaryProperties(props) {
      return get(model, 'effectiveProperties').then((current) => {
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
              return objectProps.sn.component.setSnapshotData(snapshot);
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
