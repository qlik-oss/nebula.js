import createKeyStore from './createKeyStore';

const [useAppSelectionsStore, appSelectionsStore] = createKeyStore({});
const [useObjectSelectionsStore, objectSelectionsStore] = createKeyStore({});
const [useModalObjectStore, modalObjectStore] = createKeyStore({});

export {
  useAppSelectionsStore,
  useObjectSelectionsStore,
  appSelectionsStore,
  objectSelectionsStore,
  useModalObjectStore,
  modalObjectStore,
};
