/* global SN_NAME */

import nucleus from '@nebula.js/nucleus';
import snDefinition from 'snDefinition'; // eslint-disable-line

import {
  // connect,
  // openApp,
  openDemoApp,
} from './connect';

openDemoApp().then((app) => {
  const nebbie = nucleus(app)
    .load((type, config) => config.Promise.resolve(snDefinition));

  let obj;

  const create = () => {
    obj = nebbie.create({
      type: SN_NAME,
    }, {
      element: document.querySelector('#chart-container'),
    });
  };

  create();

  module.hot.accept('snDefinition', () => {
    nebbie.types.clearFromCache(SN_NAME);
    nebbie.load((type, config) => config.Promise.resolve(snDefinition));
    obj.then((viz) => {
      viz.close();
      create();
    });
  });
});
