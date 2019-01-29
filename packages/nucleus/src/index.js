import { create, boot } from './booter';
import types from './sn/types';

function apiGenerator(app) {
  const config = {
    env: {
      Promise,
    },
    load: () => undefined,
  };

  const context = {
    types: types(config),
  };

  const api = {
    get: (common, viz) => boot(common, viz, config, api, app),
    create: (common, viz) => create(common, viz, api, app),
    env: (e) => {
      Object.assign(config.env, e);
      return api;
    },
    load: ($) => {
      config.load = $;
      return api;
    },
    types: context.types,
  };

  return api;
}

export default apiGenerator;
