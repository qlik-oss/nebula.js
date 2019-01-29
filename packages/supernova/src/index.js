import extend from 'extend';
import EventEmitter from 'node-event-emitter';
import { createObjectSelectionAPI } from '@nebula.js/selections';

import translator from './translator';
import flags from './flags';
import actionhero from './action-hero';
import qae from './qae';

const PERMISSIONS = {
  PASSIVE: 1, // allowed actions that don't effect the state of the chart (e.g. click on links, mousehover etc)
  INTERACT: 2, // allowed to click, zoom, scroll, pan etc, (anything that does not affect selections)
  SELECT: 4, // allowed to select (should never be on if ENGINE is not available)
  FETCH: 8, // engine is available (might be better to proxy enigma calls in snapshot mode)
};

const defaultComponent = {
  app: null,
  model: null,
  actions: null,
  created: () => {},
  mounted: () => {},
  render: () => {},
  resize: () => {},
  willUnmount: () => {},
  destroy: () => {},

  emit: () => {},
  getViewState: () => {},

  // temporary
  setSnapshotData: snapshot => Promise.resolve(snapshot),
};

const reservedKeys = Object.keys(defaultComponent);

const mixin = (obj) => {
  /* eslint no-param-reassign: 0 */
  Object.keys(EventEmitter.prototype).forEach((key) => {
    obj[key] = EventEmitter.prototype[key];
  });
  EventEmitter.init(obj);
  return obj;
};

function create(sn, opts, env) {
  const componentInstance = {
    ...defaultComponent,
  };

  mixin(componentInstance);

  const userInstance = {
    emit(...args) {
      componentInstance.emit(...args);
    },
  };

  Object.keys(sn.component || {}).forEach((key) => {
    if (reservedKeys.indexOf(key) !== -1) {
      componentInstance[key] = sn.component[key].bind(userInstance);
    } else {
      userInstance[key] = sn.component[key];
    }
  });

  const hero = actionhero({
    sn,
    component: userInstance,
  });

  let selections = null;

  if (!opts.selections && !opts.model.selections) {
    Object.defineProperty(opts.model, 'selections', {
      get() {
        selections = selections || createObjectSelectionAPI(opts.model, opts.app);
        return selections;
      },
    });
  }

  extend(userInstance, {
    model: opts.model,
    app: opts.app,
    selections: opts.selections || opts.model.selections,
    actions: hero.actions,
    resources: {
      translator: env.translator || translator,
      Promise: env.Promise || Promise,
      flags: env.flags || flags(),
      PERMISSIONS,
    },
  });

  extend(componentInstance, {
    actions: hero.actions,
  });

  // componentInstance.created({
  //   options: snOptions,
  // });

  return {
    definition: sn,
    component: componentInstance,
    selectionToolbar: {
      items: hero.selectionToolbarItems,
    },
    logicalSize: sn.logicalSize || (() => false),
  };
}

/**
 * @returns
 */
export default function generator(UserSN, env) {
  let sn;

  const localEnv = extend({
    translator,
    Promise,
    flags: flags(),
    PERMISSIONS,
  }, env);

  if (typeof UserSN === 'function') {
    sn = UserSN(localEnv);
  } else {
    sn = UserSN;
  }

  const gen = {
    qae: qae(sn.qae),
    component: sn.component || {},
    create({
      model,
      app,
      selections,
    }) {
      const ss = create(gen, {
        model,
        app,
        selections,
      }, localEnv);

      return ss;
    },
  };

  Object.keys(sn).forEach((key) => {
    if (!gen[key]) {
      gen[key] = sn[key];
    }
  });

  return gen;
}
