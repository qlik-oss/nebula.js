import eventmixin from './event-mixin';

export default function (app) {
  let canGoForward = false;
  let canGoBack = false;
  let canClear = false;

  let modalObject;
  const api = {
    switchModal(object, path, accept = true) {
      if (object === modalObject) {
        return Promise.resolve();
      }
      if (modalObject) {
        modalObject.endSelections(accept);
        api.emit('modal-unset');
        modalObject.selections.emit('deactivated');
      }
      if (object && object !== null) { // TODO check model state
        modalObject = object;
        api.emit('modal', modalObject.selections);
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
      // modalObject.selections.
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
  };

  eventmixin(api);

  const prom = app.getObject('CurrentSelection');
  const obj = new Promise((resolve) => {
    prom.then((sel) => {
      resolve(sel);
    }).catch(() => {
      app.createSessionObject({
        qInfo: {
          qId: 'CurrentSelection',
          qType: 'CurrentSelection',
        },
        qSelectionObjectDef: {},
      }).then((sel) => {
        resolve(sel);
      });
    });
  });
  obj.then((model) => {
    const onChanged = () => model.getLayout().then((layout) => {
      canGoBack = layout.qSelectionObject && layout.qSelectionObject.qBackCount > 0;
      canGoForward = layout.qSelectionObject && layout.qSelectionObject.qForwardCount > 0;
      canClear = layout.qSelectionObject && layout.qSelectionObject.qSelections.length > 0;
      api.emit('changed');
    });
    model.on('changed', onChanged);
    model.once('closed', () => {
      model.removeListener('changed', onChanged);
    });
    onChanged();
  });

  return api;
}
