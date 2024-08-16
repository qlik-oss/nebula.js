import eventmixin from '../../selections/event-mixin';

export default function createNavigationApi(halo, store, model) {
  const { galaxy } = halo.public;
  if (galaxy.anything?.sense?.navigation) {
    return galaxy.anything?.sense?.navigation;
  }

  const State = { model };

  /**
   * @class Navigation
   */
  const navigationAPI = /** @lends Navigation# */ {
    /**
     * Navigate to the supplied sheet and emit 'sheetChanged' event if the target sheet Id is valid
     * @experimental
     * @since 5.4.0
     * @param {string} sheetId Id of the sheet to navigate to
     */
    goToSheet: async (sheetId) => {
      if (!State.sheetRef) {
        return;
      }
      const { modelStore, rpcRequestModelStore } = store;
      const key = `${sheetId}`;
      let rpc = rpcRequestModelStore.get(key);
      if (!rpc) {
        rpc = halo.app.getObject(sheetId);
        rpcRequestModelStore.set(key, rpc);
      }
      let newModel;
      try {
        newModel = await rpc;
        if (newModel.genericType !== 'sheet') {
          return;
        }
      } catch (e) {
        return;
      }
      modelStore.set(key, newModel);
      State.sheetRef?.current?.setModel?.(newModel);
      State.model = newModel;
      navigationAPI.emit('sheetChanged');
    },
    /**
     * @private
     * Set the sheet ref
     * @param {object} sheetRef sheet ref object
     */
    setSheetRef: (sheetRef) => {
      State.sheetRef = sheetRef;
    },
    /**
     * Return the current sheet id
     * @experimental
     * @since 5.4.0
     * @returns {string|false} The current sheet Id. false means there is no current sheet.
     */
    getCurrentSheetId: () => {
      if (State.model) {
        return State.model.id;
      }
      return false;
    },
  };
  eventmixin(navigationAPI);
  return navigationAPI;
}
