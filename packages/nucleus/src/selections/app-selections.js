/* eslint no-underscore-dangle: 0 */
import eventmixin from './event-mixin';
import visual from '../components/AppSelections';

const cache = {};

const create = (app) => {
  let canGoForward = false;
  let canGoBack = false;
  let canClear = false;

  let modalObject;
  let mounted;
  let lyt;
  const api = {
    model: app,
    switchModal(object, path, accept = true) {
      if (object === modalObject) {
        return Promise.resolve();
      }
      if (modalObject) {
        modalObject.endSelections(accept);
        api.emit('modal-unset');
        modalObject._selections.emit('deactivated');
      }
      if (object && object !== null) { // TODO check model state
        modalObject = object;
        api.emit('modal', modalObject._selections);
        return modalObject.beginSelections(Array.isArray(path) ? path : [path]);
      }
      modalObject = null;
      api.emit('modal-unset');
      return Promise.resolve();
    },
    isModal(objectModel) {
      // TODO check model state
      return objectModel ? modalObject === objectModel : modalObject !== null;
    },
    abortModal(accept = true) {
      if (!modalObject) {
        return Promise.resolve();
      }
      // modalObject._selections.
      modalObject = null;
      api.emit('modal-unset');
      return app.abortModal(accept);
    },
    canGoForward() {
      return canGoForward;
    },
    canGoBack() {
      return canGoBack;
    },
    canClear() {
      return canClear;
    },
    layout() {
      return lyt;
    },
    forward() {
      this.switchModal();
      return app.forward();
    },
    back() {
      this.switchModal();
      return app.back();
    },
    clear() {
      this.switchModal();
      return app.clearAll();
    },
    clearField(field, state = '$') {
      return app.getField(field, state).then(f => f.clear());
    },
    mount(element) {
      if (mounted) {
        console.error('Already mounted');
        return;
      }
      mounted = visual({
        element,
        api,
      });
    },
    unmount() {
      if (mounted) {
        mounted();
      }
    },
  };

  eventmixin(api);

  const prom = app.getObject('CurrentSelectionB');
  const obj = new Promise((resolve) => {
    prom.then((sel) => {
      resolve(sel);
    }).catch(() => {
      app.createSessionObject({
        qInfo: {
          qId: 'CurrentSelectionB',
          qType: 'CurrentSelectionB',
        },
        qSelectionObjectDef: {},
        alternateStates: [{
          stateName: 'andal',
          qSelectionObjectDef: { qStateName: 'andal' },
        }, {
          stateName: 'forest',
          qSelectionObjectDef: { qStateName: 'forest' },
        }],
      }).then((sel) => {
        resolve(sel);
      });
    });
  });
  obj.then((model) => {
    const onChanged = () => model.getLayout().then((layout) => {
      // FIXME - if all currently selected fields are locked, no actions should be allowed
      canGoBack = layout.qSelectionObject && layout.qSelectionObject.qBackCount > 0;
      canGoForward = layout.qSelectionObject && layout.qSelectionObject.qForwardCount > 0;
      canClear = layout.qSelectionObject && layout.qSelectionObject.qSelections.length > 0;
      lyt = layout;
      api.emit('changed');
    });
    model.on('changed', onChanged);
    model.once('closed', () => {
      model.removeListener('changed', onChanged);
      app._selections = null; // eslint-disable-line no-param-reassign
      cache[app.id] = null;
    });
    onChanged();
  });

  return api;
};

export default function (app) {
  if (!cache[app.id]) {
    cache[app.id] = {
      selections: null,
    };
    Object.defineProperty(app, '_selections', {
      get() {
        cache[app.id].selections = cache[app.id].selections || create(app);
        return cache[app.id].selections;
      },
      set(v) {
        cache[app.id].selections = v;
      },
    });
  }
}
