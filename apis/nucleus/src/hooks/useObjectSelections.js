/* eslint no-underscore-dangle: 0 */
import { useEffect } from 'react';
import { useObjectSelectionsStore, useAppModalStore } from '../stores/selections-store';
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

function createHandler({ elements, handleClickOutside }) {
  const handler = (evt) => {
    const targetStillExists = document.contains(evt.target);
    if (!targetStillExists) {
      return;
    }

    // Resolve elements and filter out containers which do not exist.
    const containers = elements
      .map((item) => {
        const elm = typeof item === 'string' ? document.querySelector(item) : item?.current;
        return elm;
      })
      .filter((elm) => !!elm && !!document.contains(elm));

    if (!containers.length) {
      return;
    }

    const isWithinSomeContainer = containers.some((elm) => elm.contains(evt.target));

    const isClickOutside = !isWithinSomeContainer;
    if (isClickOutside) {
      handleClickOutside(evt);
    }
  };
  return handler;
}

const createObjectSelections = ({ appSelections, appModal, model }) => {
  let layout;
  let isActive = false;
  let hasSelected = false;

  /**
   * @class
   * @alias ObjectSelections
   */
  const api = /** @lends ObjectSelections# */ {
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
      // unbindClickOutside = bindClickOutside({ handler });

      return appModal.begin(model, paths, true);
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
      return appModal.end(true);
    },
    /**
     * @returns {Promise<undefined>}
     */
    cancel() {
      hasSelected = false;
      isActive = false;
      this.emit('canceled'); // FIXME - spelling?
      this.emit('deactivated');
      // unbindClickOutside();
      return appModal.end(false);
    },
    /**
     * @param {object} s
     * @param {string} s.method
     * @param {any[]} s.params
     * @returns {Promise<boolean>}
     */
    async select(s) {
      const b = this.begin([s.params[0]]);
      if (!appSelections.isModal()) {
        return false;
      }
      await b;
      const qSuccess = await model[s.method](...s.params);
      hasSelected = s.method !== 'resetMadeSelections';
      if (!qSuccess) {
        model.resetMadeSelections();
        return false;
      }
      return true;
    },
    /**
     * @returns {boolean}
     */
    canClear() {
      if (layout && layout.qListObject && layout.qListObject.qDimensionInfo) {
        return !layout.qListObject.qDimensionInfo.qLocked && !layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne;
      }
      return hasSelected;
    },
    /**
     * @returns {boolean}
     */
    canConfirm() {
      if (layout && layout.qListObject && layout.qListObject.qDimensionInfo) {
        return !layout.qListObject.qDimensionInfo.qLocked;
      }
      return hasSelected;
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
    goModal: (paths) => appModal.begin(model, paths, false),
    /**
     * @param {boolean} [accept=false]
     * @returns {Promise<undefined>}
     */
    noModal: (accept = false) => appModal.end(accept),
  };

  eventmixin(api);

  return api;
};

const getClickOutFuncs = ({ elements, objectSelections }) => {
  const handler = createHandler({
    elements,
    handleClickOutside: () => objectSelections.confirm.call(objectSelections),
  });

  return {
    activateClickOut() {
      document.addEventListener('mousedown', handler);
    },
    deactivateClickOut() {
      document.removeEventListener('mousedown', handler);
    },
  };
};

export default function useObjectSelections(app, model, elements) {
  const elementsArr = Array.isArray(elements) ? elements : [elements];

  const [appSelections] = useAppSelections(app);
  const [layout] = useLayout(model);
  const key = model ? model.id : null;
  const [appModalStore] = useAppModalStore();
  const [objectSelectionsStore] = useObjectSelectionsStore();
  const appModal = appModalStore.get(app.id);
  let objectSelections = objectSelectionsStore.get(key);

  useEffect(() => {
    if (!appSelections || !model || objectSelections) return;

    objectSelections = createObjectSelections({
      appSelections,
      appModal,
      model,
    });

    objectSelectionsStore.set(key, objectSelections);
    objectSelectionsStore.dispatch(true);
  }, [appSelections, model]);

  useEffect(() => {
    if (!objectSelections) return () => {};

    const { activateClickOut, deactivateClickOut } = getClickOutFuncs({ elements: elementsArr, objectSelections });

    objectSelections.addListener('activated', activateClickOut);
    objectSelections.addListener('deactivated', deactivateClickOut);

    return () => {
      objectSelections.removeListener('activated', activateClickOut);
      objectSelections.removeListener('deactivated', deactivateClickOut);
    };
  }, [objectSelections]);

  useEffect(() => {
    if (!objectSelections) return;

    objectSelections.setLayout(layout);
  }, [objectSelections, layout]);

  return [objectSelections];
}
