import vizualizationAPI from '../viz';
import ObjectAPI from './object-api';
import { observe } from './observer';

export default function initiate(getCfg, optional, context) {
  return context.app.getObject(getCfg.id).then(model => {
    const viz = vizualizationAPI({
      model,
      context,
    });

    const objectAPI = new ObjectAPI(model, context, viz);

    observe(model, layout => objectAPI.setLayout(layout)); // TODO - call unobserve when viz is destroyed

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
