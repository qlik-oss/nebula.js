import vizualizationAPI from '../viz';

export default async function(model, optional, corona, initialError) {
  const api = vizualizationAPI({
    model,
    corona,
    initialError,
  });
  if (optional.element) {
    await api.mount(optional.element);
  }
  if (optional.options) {
    api.options(optional.options);
  }
  if (optional.context) {
    api.context(optional.context);
  }

  return api;
}
