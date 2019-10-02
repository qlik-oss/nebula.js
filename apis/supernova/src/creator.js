/* eslint no-underscore-dangle: 0 */

import EventEmitter from 'node-event-emitter';

import JSONPatch from './json-patch';
import actionhero from './action-hero';

/**
 * @interface SnComponent
 * @alias SnComponent
 */
const defaultComponent = /** @lends SnComponent */ {
  app: null,
  model: null,
  actions: null,
  selections: null,
  /** */
  created: () => {},
  /** */
  mounted: () => {},
  /** */
  render: () => {},
  /** */
  resize: () => {},
  /** */
  willUnmount: () => {},
  /** */
  destroy: () => {},

  emit: () => {},
  getViewState: () => {},

  // temporary
  setSnapshotData: snapshot => Promise.resolve(snapshot),
};

const reservedKeys = Object.keys(defaultComponent);

const mixin = obj => {
  /* eslint no-param-reassign: 0 */
  Object.keys(EventEmitter.prototype).forEach(key => {
    obj[key] = EventEmitter.prototype[key];
  });
  EventEmitter.init(obj);
  return obj;
};

export default function create(generator, opts) {
  const componentInstance = {
    ...defaultComponent,
  };

  mixin(componentInstance);

  const userInstance = {
    emit(...args) {
      componentInstance.emit(...args);
    },
  };

  Object.keys(generator.component || {}).forEach(key => {
    if (reservedKeys.indexOf(key) !== -1) {
      componentInstance[key] = generator.component[key].bind(userInstance);
    } else {
      userInstance[key] = generator.component[key];
    }
  });

  const hero = actionhero({
    sn: generator,
    component: userInstance,
  });

  const qGlobal = opts.app && opts.app.session ? opts.app.session.getObjectApi({ handle: -1 }) : null;

  Object.assign(
    userInstance,
    /** @lends SnComponent */ {
      /** @type {EnigmaObjectModel} */
      model: opts.model,
      /** @type {EnigmaAppModel} */
      app: opts.app,
      /** @type {?EnigmaGlobalModel} */
      global: qGlobal, // TODO - calling it 'global' might not be the best thing here
      /** @type {ObjectSelections} */
      selections: opts.selections,
      actions: hero.actions,
    }
  );

  Object.assign(componentInstance, {
    actions: hero.actions,
    model: opts.model,
    app: opts.app,
    selections: opts.selections,
  });

  const teardowns = [];

  if (generator.qae.properties.onChange) {
    // TODO - handle multiple sn
    // TODO - check permissions
    if (opts.model.__snInterceptor) {
      // remove old hook - happens only when proper cleanup hasn't been done
      opts.model.__snInterceptor.teardown();
    }

    opts.model.__snInterceptor = {
      setProperties: opts.model.setProperties,
      applyPatches: opts.model.applyPatches,
      teardown: undefined,
    };

    opts.model.setProperties = function setProperties(...args) {
      generator.qae.properties.onChange.call({ model: opts.model }, ...args);
      return opts.model.__snInterceptor.setProperties.call(this, ...args);
    };

    opts.model.applyPatches = function applyPatches(qPatches, qSoftPatch) {
      const method = qSoftPatch ? 'getEffectiveProperties' : 'getProperties';
      return opts.model[method]().then(currentProperties => {
        // apply patches to current props
        const original = JSONPatch.clone(currentProperties);
        const patches = qPatches.map(p => ({ op: p.qOp, value: JSON.parse(p.qValue), path: p.qPath }));
        JSONPatch.apply(currentProperties, patches);

        generator.qae.properties.onChange.call({ model: opts.model }, currentProperties);

        // calculate new patches from after change
        const newPatches = JSONPatch.generate(original, currentProperties).map(p => ({
          qOp: p.op,
          qValue: JSON.stringify(p.value),
          qPath: p.path,
        }));

        return opts.model.__snInterceptor.applyPatches.call(this, newPatches, qSoftPatch);
      });
    };

    opts.model.__snInterceptor.teardown = () => {
      opts.model.setProperties = opts.model.__snInterceptor.setProperties;
      delete opts.model.__snInterceptor;
    };

    teardowns.push(opts.model.__snInterceptor.teardown);
  }

  return {
    generator,
    component: componentInstance,
    selectionToolbar: {
      items: hero.selectionToolbarItems,
    },
    destroy() {
      teardowns.forEach(t => t());
    },
    logicalSize: generator.definition.logicalSize || (() => false),
  };
}
