import vizualizationAPI from '../viz';

export default async function(model, optional, context, initialError) {
  const api = vizualizationAPI({
    model,
    context,
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
