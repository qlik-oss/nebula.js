/* eslint no-underscore-dangle:0 */
import sheetAPI from '../sheet';

export default async function initSheet(model, optional, halo, initialError, onDestroy = async () => {}) {
  const api = sheetAPI({
    model,
    halo,
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
