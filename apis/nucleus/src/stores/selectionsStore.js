import createKeyStore from './createKeyStore';

const [useAppSelectionsStore, appSelectionsStore] = createKeyStore({});
const [useObjectSelectionsStore] = createKeyStore({});

export { useAppSelectionsStore, useObjectSelectionsStore, appSelectionsStore };
