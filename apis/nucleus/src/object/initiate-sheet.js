/* eslint no-underscore-dangle:0 */
import sheetAPI from '../sheet';
import createNavigationApi from './navigation/navigation';

export default async function initSheet(model, optional, halo, store, initialError, onDestroy = async () => {}) {
  const navigation = createNavigationApi(halo, store);
  const api = sheetAPI({
    model,
    halo,
    navigation,
    initialError,
    onDestroy,
  });
  if (optional.options) {
    api.__DO_NOT_USE__.options(optional.options);
  }
  if (optional.plugins) {
    api.__DO_NOT_USE__.plugins(optional.plugins);
  }
  if (optional.element) {
    await api.__DO_NOT_USE__.mount(optional.element);
  }

  return api;
}
