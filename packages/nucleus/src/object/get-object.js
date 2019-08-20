import vizualizationAPI from '../viz';
import ObjectAPI from './object-api';

export function observe(model, objectAPI) {
  const onChanged = () =>
    model.getLayout().then(layout => {
      objectAPI.setLayout(layout);
    });
  model.on('changed', onChanged);
  model.once('closed', () => {
    model.removeListener('changed', onChanged);
    objectAPI.close();
  });

  onChanged();
}

export default function initiate(getCfg, optional, context) {
  return context.app.getObject(getCfg.id).then(model => {
    const viz = vizualizationAPI({
      model,
      context,
    });

    const objectAPI = new ObjectAPI(model, context, viz);

    observe(model, objectAPI);

    const api = objectAPI.getPublicAPI();

    if (optional.options) {
      viz.api.options(optional.options);
    }
    if (optional.context) {
      viz.api.context(optional.context);
    }
    if (optional.element) {
      return viz.api.mount(optional.element).then(() => api);
    }

    return api;
  });
}
