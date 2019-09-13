/* eslint no-underscore-dangle: 0 */
import eventmixin from './event-mixin';

const event = () => {
  let prevented = false;
  return {
    isPrevented: () => prevented,
    preventDefault: () => {
      prevented = true;
    },
  };
};

export default function(model, app) {
  if (model._selections) {
    return model._selections;
  }
  const appAPI = () => app._selections;
  let hasSelected = false;
  let isActive = false;
  let layout = {};
  const api = {
    // model,
    id: model.id,
    setLayout(lyt) {
      layout = lyt;
    },
    begin(paths) {
      const e = event();
      this.emit('activate', e);
      if (e.isPrevented()) {
        return Promise.resolve();
      }
      isActive = true;
      this.emit('activated');
      return appAPI().switchModal(model, paths, true);
    },
    clear() {
      hasSelected = false;
      this.emit('cleared');
      return model.resetMadeSelections();
    },
    confirm() {
      hasSelected = false;
      isActive = false;
      this.emit('confirmed');
      this.emit('deactivated');
      return appAPI().switchModal(null, null, true);
    },
    cancel() {
      hasSelected = false;
      isActive = false;
      this.emit('canceled');
      this.emit('deactivated');
      return appAPI().switchModal(null, null, false, false);
    },
    select(s) {
      this.begin([s.params[0]]);
      if (!appAPI().isModal()) {
        return;
      }
      hasSelected = true;
      model[s.method](...s.params).then(qSuccess => {
        if (!qSuccess) {
          this.clear();
        }
      });
    },
    canClear() {
      return hasSelected && layout.qSelectionInfo.qMadeSelections;
    },
    canConfirm() {
      return hasSelected && layout.qSelectionInfo.qMadeSelections;
    },
    canCancel() {
      return true;
    },
    isActive: () => isActive,
    isModal: () => appAPI().isModal(model),
    goModal: paths => appAPI().switchModal(model, paths, false),
    noModal: (accept = false) => appAPI().switchModal(null, null, accept),
    abortModal: () => appAPI().abortModal(true),
  };

  eventmixin(api);

  model._selections = api; // eslint-disable-line no-param-reassign

  return api;
}
