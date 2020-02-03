import vizualizationAPI from '../viz';

export default async function(model, optional, corona, initialError) {
  const api = vizualizationAPI({
    model,
    corona,
    initialError,
  });
  if (optional.options) {
    api.options(optional.options);
  }
  if (optional.element) {
    await api.mount(optional.element);
  }

  return api;
}
