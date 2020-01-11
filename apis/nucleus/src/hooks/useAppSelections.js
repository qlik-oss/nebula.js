/* eslint no-underscore-dangle: 0 */
import { useEffect } from 'react';
import useAppSelectionsNavigation from './useAppSelectionsNavigation';
import { useAppSelectionsStore } from '../stores/selectionsStore';

let modalObject;

function createAppSelections({ app, currentSelectionsLayout, navState }) {
  const appSelections = {
    model: app,
    switchModal(object, path, accept = true) {
      if (object === modalObject) {
        return Promise.resolve();
      }
      if (modalObject) {
        modalObject.endSelections(accept);
        modalObject._selections.emit('deactivated');
      }
      if (object && object !== null) {
        // TODO check model state
        modalObject = object;
        // do not return the call to beginSelection to avoid waiting for it's response
        modalObject.beginSelections(Array.isArray(path) ? path : [path]).catch(err => {
          if (err.code === 6003) {
            // If another object already is in modal -> abort and take over
            return appSelections.abortModal().then(() => object.beginSelections(Array.isArray(path) ? path : [path]));
          }
          throw err;
        });
        return Promise.resolve();
      }
      modalObject = null;
      return Promise.resolve();
    },
    isInModal() {
      return modalObject !== null;
    },
    isModal(objectModel) {
      // TODO check model state
      return objectModel ? modalObject === objectModel : modalObject !== null;
    },
    abortModal(accept = true) {
      if (!modalObject) {
        return Promise.resolve({});
      }
      // modalObject._selections.
      modalObject = null;
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
  const [store] = useAppSelectionsStore();
  const key = app ? app.id : null;
  let appSelections = store.get(key);

  useEffect(() => {
    if (!app || !currentSelectionsModel || !currentSelectionsLayout || !navState || appSelections) return;

    appSelections = createAppSelections({ app, currentSelectionsLayout, navState });
    store.set(key, appSelections);
  }, [app, currentSelectionsModel, currentSelectionsLayout, navState]);

  return [appSelections, navState];
}
