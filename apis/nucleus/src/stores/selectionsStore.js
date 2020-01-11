import createKeyStore from './createKeyStore';

const [useAppSelectionsStore, appSelectionsStore] = createKeyStore({});
const [useObjectSelectionsStore] = createKeyStore({});
const [useModalObjectStore] = createKeyStore({});

export { useAppSelectionsStore, useObjectSelectionsStore, useModalObjectStore, appSelectionsStore };
