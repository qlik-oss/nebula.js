import createKeyStore from './create-key-store';

const [useAppSelectionsStore, appSelectionsStore] = createKeyStore({});
const [useAppModalStore, appModalStore] = createKeyStore({});
const [useModalObjectStore, modalObjectStore] = createKeyStore({});

export {
  useAppSelectionsStore,
  useAppModalStore,
  appSelectionsStore,
  appModalStore,
  useModalObjectStore,
  modalObjectStore,
};
