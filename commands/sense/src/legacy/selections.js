/* eslint no-param-reassign: 0 */
import EventEmitter from 'node-event-emitter';

export default (scope) => {
  const mixin = (obj) => {
    Object.keys(EventEmitter.prototype).forEach((key) => {
      obj[key] = EventEmitter.prototype[key];
    });
    EventEmitter.init(obj);
    return obj;
  };

  // TODO one and only one

  const selectionAPI = {
    begin() {
      scope.selectionsApi.activated();
      scope.backendApi.beginSelections();
      selectionAPI.emit('activated');
    },
    clear() {
      scope.backendApi.model.resetMadeSelections();
    },
    confirm() {
      scope.selectionsApi.confirm();
    },
    cancel() {
      scope.selectionsApi.cancel();
    },
    select(s) {
      if (!scope.selectionsApi.active) {
        scope.backendApi.beginSelections();
      }
      scope.backendApi.model[s.method](...s.params).then((qSuccess) => {
        if (!qSuccess) {
          scope.selectionsApi.selectionsMade = false;
          this.clear();
        }
      });
      scope.selectionsApi.selectionsMade = s.method !== 'resetMadeSelections';
    },
    isActive() {
      return scope.selectionsApi.active;
    },
    refreshToolbar() {
      scope.selectionsApi.refreshToolbar();
    },
  };

  mixin(selectionAPI);

  scope.selectionsApi.confirm = () => {
    scope.backendApi.endSelections(true).then(() => {
      scope.selectionsApi.deactivated();
      selectionAPI.emit('deactivated');
    });
  };

  scope.selectionsApi.clear = () => {
    scope.backendApi.clearSelections();
    scope.selectionsApi.selectionsMade = false;
    selectionAPI.emit('cleared');
  };

  scope.selectionsApi.cancel = () => {
    scope.backendApi.endSelections(false);
    scope.selectionsApi.deactivated();
    selectionAPI.emit('canceled');
  };

  return selectionAPI;
};
