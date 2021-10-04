/* eslint no-underscore-dangle:0 */
import vizualizationAPI from '../viz';

export default async function init(model, optional, halo, initialError, onDestroy = async () => {}) {
  const api = vizualizationAPI({
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
