import cell from './boot';

const noopi = Promise.resolve({
  setProps() {},
  unmount() {},
});

export default function ({
  model,
  config,
  initialUserProps = {},
} = {}) {
  let c = noopi;

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

  let queueShow = false;

  const show = (element) => {
    if (!objectProps.layout) {
      queueShow = element;
      return;
    }
    c = cell({
      element,
      model,
    }, {
      userProps,
      objectProps,
    }, config);
  };

  const update = () => {
    if (queueShow && objectProps.layout) {
      show(queueShow);
      queueShow = false;
    }
    c.then(x => x.setProps({
      objectProps,
      userProps,
    }));
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
    show(element) {
      // TODO - handle multiple calls to show with different elements
      show(element);
    },
    close() {
      c.then(x => x.unmount());
      c = noopi;
    },
    setProperties() {
      // TODO - apply soft patch on existing properties
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
      return c.then((x) => {
        if (x.reference) {
          const content = x.reference.querySelector('.nucleus-content__body');
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
      });
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
