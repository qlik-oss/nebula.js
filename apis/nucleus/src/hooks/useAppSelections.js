/* eslint no-underscore-dangle: 0 */
import { useEffect } from 'react';
import { useAppSelectionsStore, modalObjectStore, appModalStore } from '../stores/selections-store';

function createAppSelections({ app }) {
  const key = `${app.id}`;

  const end = async (accept = true) => {
    const { model, objectSelections } = modalObjectStore.get(key) || {};
    if (model) {
      await model.endSelections(accept);
      modalObjectStore.clear(key);
      objectSelections.emit('deactivated');
    }
  };

  const begin = async ({ model, paths, accept = true, objectSelections }) => {
    // Quick return if it's already in modal
    if (objectSelections === modalObjectStore.get(key)?.objectSelections) {
      return;
    }

    // If other model is in modal state end it
    end(accept);

    // Pending modal
    modalObjectStore.set(key, { model, objectSelections });

    const p = Array.isArray(paths) ? paths : [paths];
    const beginSelections = async (skipRetry) => {
      try {
        await model.beginSelections(p);
        modalObjectStore.set(key, { model, objectSelections }); // We have a modal
      } catch (err) {
        if (err.code === 6003 && !skipRetry) {
          await app.abortModal(accept);
          beginSelections(true);
        } else {
          modalObjectStore.clear(key); // No modal
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
   * @alias AppSelections
   */
  const appSelections = {
    model: app,
    isInModal() {
      return !!modalObjectStore.get(key);
    },
    isModal(objectSelections) {
      // TODO check model state
      return objectSelections
        ? modalObjectStore.get(key)?.objectSelections === objectSelections
        : !!modalObjectStore.get(key);
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
  const [appSelectionsStore] = useAppSelectionsStore();
  const key = app ? app.id : null;
  let appSelections = appSelectionsStore.get(key);

  useEffect(() => {
    if (!app || appSelections) return;
    appSelections = createAppSelections({ app });
    appSelectionsStore.set(key, appSelections);
    appSelectionsStore.dispatch(true);
  }, [app]);

  return [appSelections];
}
