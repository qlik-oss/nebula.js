import extend from 'extend';
import EventEmitter from 'node-event-emitter';

import translator from './translator';
import actionhero from './action-hero';

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

export default function create(sn, opts, env) {
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

  extend(userInstance, {
    model: opts.model,
    app: opts.app,
    selections: opts.selections,
    actions: hero.actions,
    resources: {
      translator: env.translator || translator,
      Promise: env.Promise || Promise,
    },
  });

  extend(componentInstance, {
    actions: hero.actions,
    model: opts.model,
    app: opts.app,
  });

  return {
    generator: sn,
    component: componentInstance,
    selectionToolbar: {
      items: hero.selectionToolbarItems,
    },
    logicalSize: sn.logicalSize || (() => false),
  };
}
