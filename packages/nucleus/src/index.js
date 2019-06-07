/* eslint no-underscore-dangle:0 */
import localeFn from './locale';

import { createAppSelectionAPI } from './selections';

import App from './components/NebulaApp';
import AppSelectionsPortal from './components/selections/AppSelections';

import create from './object/create-object';
import get from './object/get-object';
import types from './sn/types';
import logger from './utils/logger';

function nucleus(app, cfg = {}) {
  createAppSelectionAPI(app);

  const lgr = logger({ level: 4 });

  const locale = localeFn(cfg.locale);

  const config = {
    env: {
      Promise,
      translator: locale.translator(),
    },
    load: () => undefined,
  };

  const root = App({
    app,
    translator: locale.translator(),
  });

  const context = {
    nebbie: null,
    app,
    config,
    logger: lgr,
    types: types(config),
    root,
  };

  let selectionsApi = null;
  let selectionsComponentReference = null;

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
    theme(t) {
      root.theme(t);
    },
    selections: () => {
      if (!selectionsApi) {
        selectionsApi = {
          ...app._selections, // eslint-disable-line no-underscore-dangle
          mount(element) {
            if (selectionsComponentReference) {
              console.error('Already mounted');
              return;
            }
            selectionsComponentReference = AppSelectionsPortal({
              element,
              api: app._selections,
            });
            root.add(selectionsComponentReference);
          },
          unmount() {
            if (selectionsComponentReference) {
              root.remove(selectionsComponentReference);
              selectionsComponentReference = null;
            }
          },
        };
      }
      return selectionsApi;
    },
    types: context.types,
  };

  context.nebbie = api;

  return api;
}

export default nucleus;
