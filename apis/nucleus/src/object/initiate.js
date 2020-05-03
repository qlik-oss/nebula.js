import vizualizationAPI from '../viz';

export default async function (model, optional, halo, initialError, onDestroy = async () => {}) {
  const api = vizualizationAPI({
    model,
    halo,
    initialError,
    onDestroy,
  });
  if (optional.options) {
    api.options(optional.options);
  }
  if (optional.element) {
    await api.mount(optional.element);
  }

  return api;
}
