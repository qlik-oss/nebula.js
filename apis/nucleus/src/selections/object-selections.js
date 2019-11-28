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

  /**
   * @interface
   * @alias ObjectSelections
   */
  const api = /** @lends ObjectSelections */ {
    // model,
    id: model.id,
    setLayout(lyt) {
      layout = lyt;
    },
    /**
     * @param {string[]} paths
     * @returns {Promise}
     */
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
    /**
     * @returns {Promise}
     */
    clear() {
      hasSelected = false;
      this.emit('cleared');
      return model.resetMadeSelections();
    },
    /**
     * @returns {Promise}
     */
    confirm() {
      hasSelected = false;
      isActive = false;
      this.emit('confirmed');
      this.emit('deactivated');
      return appAPI().switchModal(null, null, true);
    },
    /**
     * @returns {Promise}
     */
    cancel() {
      hasSelected = false;
      isActive = false;
      this.emit('canceled');
      this.emit('deactivated');
      return appAPI().switchModal(null, null, false, false);
    },
    /**
     * @param {object} s
     * @param {string} s.method
     * @param {any[]} s.params
     */
    select(s) {
      const b = this.begin([s.params[0]]);
      if (!appAPI().isModal()) {
        return;
      }
      hasSelected = true;
      b.then(() =>
        model[s.method](...s.params).then(qSuccess => {
          if (!qSuccess) {
            this.clear();
          }
        })
      );
    },
    /**
     * @returns {boolean}
     */
    canClear() {
      return hasSelected && layout.qSelectionInfo.qMadeSelections;
    },
    /**
     * @returns {boolean}
     */
    canConfirm() {
      return hasSelected && layout.qSelectionInfo.qMadeSelections;
    },
    /**
     * @returns {boolean}
     */
    canCancel() {
      if (layout && layout.qListObject && layout.qListObject.qDimensionInfo) {
        return !layout.qListObject.qDimensionInfo.qLocked;
      }
      return true;
    },
    /**
     * @returns {boolean}
     */
    isActive: () => isActive,
    /**
     * @returns {boolean}
     */
    isModal: () => appAPI().isModal(model),
    /**
     * @param {string[]} paths
     * @returns {Promise}
     */
    goModal: paths => appAPI().switchModal(model, paths, false),
    /**
     * @param {boolean} [accept=false]
     * @returns {Promise}
     */
    noModal: (accept = false) => appAPI().switchModal(null, null, accept),
    /**
     * @returns {Promise}
     */
    abortModal: () => appAPI().abortModal(true),
  };

  eventmixin(api);

  model._selections = api; // eslint-disable-line no-param-reassign

  return api;
}
