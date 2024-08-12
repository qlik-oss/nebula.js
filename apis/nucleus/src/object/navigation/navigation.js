export default function createNavigationApi(halo, store) {
  const { galaxy } = halo.public;
  if (galaxy.anything?.sense?.navigation) {
    return galaxy.anything?.sense?.navigation;
  }
  const State = {};

  /**
   * @class Navigation
   */
  const navigationAPI = /** @lends Navigation# */ {
    /**
     * Navigate to the supplied sheet
     * @param {string} sheetId Id of the sheet to navigate to
     */
    goToSheet: async (sheetId) => {
      const { modelStore, rpcRequestModelStore } = store;
      const key = `${sheetId}`;
      let rpc = rpcRequestModelStore.get(key);
      if (!rpc) {
        rpc = halo.app.getObject(sheetId);
        rpcRequestModelStore.set(key, rpc);
      }
      const model = await rpc;
      modelStore.set(key, model);
      State.sheetRef?.current?.setModel?.(model);
    },
    /**
     * Set the current sheet id
     * @param {string} sheetId Id of the current sheet
     */
    setCurrentSheetId: (sheetId) => {
      State.sheetId = sheetId;
    },
    /**
     * Set the sheet ref
     * @param {object} sheetRef sheet ref object
     */
    setSheetRef: (sheetRef) => {
      State.sheetRef = sheetRef;
    },
    /**
     * Return the current sheet id
     * @returns {string|false}
     */
    getCurrentSheetId: () => {
      if (State.sheetId) {
        return State.sheetId;
      }
      return false;
    },
  };
  return navigationAPI;
}
