import createKeyStore from './createKeyStore';

const [useAppSelectionsStore, appSelectionsStore] = createKeyStore({});
const [useObjectSelectionsStore, objectSelectionsStore] = createKeyStore({});

export { useAppSelectionsStore, useObjectSelectionsStore, appSelectionsStore, objectSelectionsStore };
