/* eslint no-underscore-dangle: 0 */
import { useEffect } from 'react';
import useAppSelectionsNavigation from './useAppSelectionsNavigation';
import {
  useAppSelectionsStore,
  objectSelectionsStore,
  modalObjectStore,
  appModalStore,
} from '../stores/selectionsStore';

function createAppSelections({ app, currentSelectionsLayout, navState }) {
  const key = `${app.id}`;

  const end = async (accept = true) => {
    const model = modalObjectStore.get(key);
    if (model) {
      await model.endSelections(accept);
      modalObjectStore.set(key, undefined);
      const objectSelections = objectSelectionsStore.get(model.id);
      objectSelections.emit('deactivated');
    }
  };

  const begin = async (model, path, accept = true) => {
    // Quick return if it's already in modal
    if (model === modalObjectStore.get(key)) {
      return;
    }

    // If other model is in modal state end it
    end(accept);

    // Pending modal
    modalObjectStore.set(key, model);

    const p = Array.isArray(path) ? path : [path];
    const beginSelections = async (skipRetry) => {
      try {
        await model.beginSelections(p);
        modalObjectStore.set(key, model); // We have a modal
      } catch (err) {
        if (err.code === 6003 && !skipRetry) {
          await app.abortModal(accept);
          beginSelections(true);
        } else {
          modalObjectStore.set(key, undefined); // No modal
        }
      }
    };
    await beginSelections();
  };

  const appModal = {
    begin,
    end,
  };

  appModalStore.set(key, appModal);

  /**
   * @class
   * @hideconstructor
   * @alias AppSelections
   */
  const appSelections = {
    model: app,
    isInModal() {
      return !!modalObjectStore.get(key);
    },
    isModal(object) {
      // TODO check model state
      return object ? modalObjectStore.get(key) === object : !!modalObjectStore.get(key);
    },
    async abortModal(accept = true) {
      if (!modalObjectStore.get(key)) {
        return;
      }
      await app.abortModal(accept);
      modalObjectStore.set(key, undefined);
    },
    canGoForward() {
      return navState.canGoForward;
    },
    canGoBack() {
      return navState.canGoBack;
    },
    canClear() {
      return navState.canClear;
    },
    layout() {
      return currentSelectionsLayout;
    },
    forward() {
      return appModal.end().then(() => app.forward());
    },
    back() {
      return appModal.end().then(() => app.back());
    },
    clear() {
      return appModal.end().then(() => app.clearAll());
    },
    clearField(field, state = '$') {
      return appModal.end().then(() => app.getField(field, state).then((f) => f.clear()));
    },
  };
  return appSelections;
}
export default function useAppSelections(app) {
  if (!app.session) {
    // assume the app is mocked if session is undefined
    return [];
  }
  const [navState, currentSelectionsModel, currentSelectionsLayout] = useAppSelectionsNavigation(app);
  const [appSelectionsStore] = useAppSelectionsStore();
  const key = app ? app.id : null;
  let appSelections = appSelectionsStore.get(key);

  useEffect(() => {
    if (!app || !currentSelectionsModel || !currentSelectionsLayout || !navState || appSelections) return;
    appSelections = createAppSelections({ app, currentSelectionsLayout, navState });
    appSelectionsStore.set(key, appSelections);
  }, [app, currentSelectionsModel, currentSelectionsLayout, navState]);

  return [appSelections, navState];
}
