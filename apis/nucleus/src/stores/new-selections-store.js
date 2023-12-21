import createKeyStore from './create-key-store';

export default function initializeStores(appId) {
  const [useAppSelectionsStore, appSelectionsStore] = createKeyStore({});
  const [useAppModalStore, appModalStore] = createKeyStore({});
  const [useModalObjectStore, modalObjectStore] = createKeyStore({});

  return {
    useAppSelectionsStore,
    useAppModalStore,
    appSelectionsStore,
    appModalStore,
    useModalObjectStore,
    modalObjectStore,
    appId,
  };
}
