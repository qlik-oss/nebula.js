/* eslint no-underscore-dangle: 0 */
import { useEffect } from 'react';
import useAppSelectionsNavigation from './useAppSelectionsNavigation';
import { useAppSelectionsStore } from '../stores/selectionsStore';
import createKeyStore from '../stores/createKeyStore';

function createAppSelections({ app, currentSelectionsLayout, navState }) {
  const [, modalObjectStore] = createKeyStore({});
  const key = `${app.id}`;

  const appSelections = {
    model: app,
    switchModal(object, path, accept = true) {
      if (object === modalObjectStore.get(key)) {
        return Promise.resolve();
      }
      if (modalObjectStore.get(key)) {
        modalObjectStore.get(key).endSelections(accept);
        modalObjectStore.get(key)._selections.emit('deactivated');
      }
      if (object && object !== null) {
        // TODO check model state
        modalObjectStore.set(key, object);
        // do not return the call to beginSelection to avoid waiting for it's response
        modalObjectStore
          .get(key)
          .beginSelections(Array.isArray(path) ? path : [path])
          .catch(err => {
            if (err.code === 6003) {
              // If another object already is in modal -> abort and take over
              return appSelections.abortModal().then(() => object.beginSelections(Array.isArray(path) ? path : [path]));
            }
            throw err;
          });
        return Promise.resolve();
      }
      modalObjectStore.set(key, null);
      return Promise.resolve();
    },
    isInModal() {
      return modalObjectStore.get(key) !== null;
    },
    isModal(objectModel) {
      // TODO check model state
      return objectModel ? modalObjectStore.get(key) === objectModel : modalObjectStore.get(key) !== null;
    },
    abortModal(accept = true) {
      if (!modalObjectStore.get(key)) {
        return Promise.resolve({});
      }
      modalObjectStore.set(key, null);
      return app.abortModal(accept);
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
      return appSelections.switchModal().then(() => app.forward());
    },
    back() {
      return appSelections.switchModal().then(() => app.back());
    },
    clear() {
      return appSelections.switchModal().then(() => app.clearAll());
    },
    clearField(field, state = '$') {
      return appSelections.switchModal().then(() => app.getField(field, state).then(f => f.clear()));
    },
  };
  return appSelections;
}
export default function useAppSelections(app) {
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
