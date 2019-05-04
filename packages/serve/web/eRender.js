import nucleus from '@nebula.js/nucleus';
import snDefinition from 'snDefinition'; // eslint-disable-line

import {
  openApp,
  params,
  info as serverInfo,
} from './connect';

if (!params.app) {
  location.href = location.origin; //eslint-disable-line
}

serverInfo.then(info => openApp(params.app).then((app) => {
  let obj;
  let objType;

  const nebbie = nucleus(app)
    .load((type, config) => {
      objType = type.name;
      return config.Promise.resolve(snDefinition);
    });

  const create = () => {
    obj = nebbie.create({
      type: info.supernova.name,
      fields: params.cols || [],
    }, {
      element: document.querySelector('#chart-container'),
    });
  };

  const get = () => {
    obj = nebbie.get({
      id: params.object,
    }, {
      element: document.querySelector('#chart-container'),
    });
  };

  const render = () => {
    if (params.object) {
      get();
    } else {
      create();
    }
  };

  render();

  if (module.hot) {
    module.hot.accept('snDefinition', () => {
      nebbie.types.clearFromCache(objType);
      obj.then((viz) => {
        viz.close();
        render();
      });
    });
  }
}));
