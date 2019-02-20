import { createAppSelectionAPI } from './selections';

import create from './create-object';
import get from './get-object';
import types from './sn/types';
import logger from './logger';

function apiGenerator(app) {
  createAppSelectionAPI(app);

  const lgr = logger({ level: 4 });

  const config = {
    env: {
      Promise,
    },
    load: () => undefined,
  };

  const context = {
    nebbie: null,
    app,
    config,
    logger: lgr,
    types: types(config),
  };

  const api = {
    get: (getCfg, userProps) => get(getCfg, userProps, context),
    create: (createCfg, userProps) => create(createCfg, userProps, context),
    env: (e) => {
      Object.assign(config.env, e);
      return api;
    },
    load: ($) => {
      config.load = $;
      return api;
    },
    selections: () => app._selections, // eslint-disable-line no-underscore-dangle
    types: context.types,
  };

  context.nebbie = api;

  return api;
}

export default apiGenerator;
