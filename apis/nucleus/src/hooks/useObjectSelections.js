/* eslint no-underscore-dangle: 0 */
import { useEffect } from 'react';
import { useObjectSelectionsStore } from '../stores/selectionsStore';
import useAppSelections from './useAppSelections';
import eventmixin from '../selections/event-mixin';
import useLayout from './useLayout';

const event = () => {
  let prevented = false;
  return {
    isPrevented: () => prevented,
    preventDefault: () => {
      prevented = true;
    },
  };
};

function createObjectSelections({ appSelections, model }) {
  let layout;
  let isActive = false;
  let hasSelected = false;

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
     * @returns {Promise<undefined>}
     */
    begin(paths) {
      const e = event();
      // TODO - event as parameter?
      this.emit('activate', e);
      if (e.isPrevented()) {
        return Promise.resolve();
      }
      isActive = true;
      this.emit('activated');
      return appSelections.switchModal(model, paths, true);
    },
    /**
     * @returns {Promise<undefined>}
     */
    clear() {
      hasSelected = false;
      this.emit('cleared');
      if (layout.qListObject) {
        return model.clearSelections('/qListObjectDef');
      }
      return model.resetMadeSelections();
    },
    /**
     * @returns {Promise<undefined>}
     */
    confirm() {
      hasSelected = false;
      isActive = false;
      this.emit('confirmed');
      this.emit('deactivated');
      return appSelections.switchModal(null, null, true);
    },
    /**
     * @returns {Promise<undefined>}
     */
    cancel() {
      hasSelected = false;
      isActive = false;
      this.emit('canceled'); // FIXME - spelling?
      this.emit('deactivated');
      return appSelections.switchModal(null, null, false, false);
    },
    /**
     * @param {object} s
     * @param {string} s.method
     * @param {any[]} s.params
     * @returns {Promise<boolean>}
     */
    select(s) {
      const b = this.begin([s.params[0]]);
      if (!appSelections.isModal()) {
        return Promise.resolve(false);
      }
      hasSelected = true;
      return b.then(() =>
        model[s.method](...s.params).then(qSuccess => {
          if (!qSuccess) {
            this.clear();
            return false;
          }
          return true;
        })
      );
    },
    /**
     * @returns {boolean}
     */
    canClear() {
      if (layout && layout.qListObject && layout.qListObject.qDimensionInfo) {
        return !layout.qListObject.qDimensionInfo.qLocked;
      }
      return hasSelected || (layout && layout.qSelectionInfo.qMadeSelections);
    },
    /**
     * @returns {boolean}
     */
    canConfirm() {
      if (layout && layout.qListObject && layout.qListObject.qDimensionInfo) {
        return !layout.qListObject.qDimensionInfo.qLocked;
      }
      return hasSelected || (layout && layout.qSelectionInfo.qMadeSelections);
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
    isModal: () => appSelections.isModal(model),
    /**
     * @param {string[]} paths
     * @returns {Promise<undefined>}
     */
    goModal: paths => appSelections.switchModal(model, paths, false),
    /**
     * @param {boolean} [accept=false]
     * @returns {Promise<undefined>}
     */
    noModal: (accept = false) => appSelections.switchModal(null, null, accept),
    /**
     * @returns {Promise<undefined>}
     */
    abortModal: () => appSelections.abortModal(true),
  };

  eventmixin(api);

  return api;
}

export default function useObjectSelections(app, model) {
  const [appSelections] = useAppSelections(app);
  const [layout] = useLayout(model);
  const key = model ? model.id : null;
  const [objectSelectionsStore] = useObjectSelectionsStore();
  let objectSelections = objectSelectionsStore.get(key);

  useEffect(() => {
    if (!appSelections || !model || objectSelections) return;

    objectSelections = createObjectSelections({ appSelections, model });
    objectSelectionsStore.set(key, objectSelections);
  }, [appSelections, model]);

  useEffect(() => {
    if (!objectSelections) return;
    objectSelections.setLayout(layout);
  }, [objectSelections, layout]);

  return [objectSelections];
}
