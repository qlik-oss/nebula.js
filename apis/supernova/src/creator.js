/* eslint no-underscore-dangle: 0 */

import EventEmitter from 'node-event-emitter';

import JSONPatch from './json-patch';
import actionhero from './action-hero';

const defaultComponent = {
  app: null,
  model: null,
  actions: null,
  selections: null,
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

  Object.assign(userInstance, {
    model: opts.model,
    app: opts.app,
    selections: opts.selections,
    actions: hero.actions,
  });

  Object.assign(componentInstance, {
    actions: hero.actions,
    model: opts.model,
    app: opts.app,
    selections: opts.selections,
  });

  if (!opts.model.__setPropertiesIntercept) {
    // TODO - figure out what happens when using the same model for a different sn
    // TODO - teardown
    opts.model.__setPropertiesIntercept = opts.model.setProperties;
    opts.model.setProperties = function setProperties(...args) {
      if (generator.qae.properties.onChange) {
        generator.qae.properties.onChange.call(
          {
            // Don't expose APIs that may not be necessary yet
            // model: opts.model,
            // app: opts.app,
            // definition: generator.definition,
          },
          ...args
        );
      }
      return opts.model.__setPropertiesIntercept.call(this, ...args);
    };
  }
  if (!opts.model.__applyPatchesIntercept) {
    opts.model.__applyPatchesIntercept = opts.model.applyPatches;
    opts.model.applyPatches = function applyPatches(qPatches, qSoftPatch) {
      // TODO - check permissions

      if (!generator.qae.properties.onChange) {
        return opts.model.__applyPatchesIntercept.call(this, qPatches, qSoftPatch);
      }

      const method = qSoftPatch ? 'getEffectiveProperties' : 'getProperties';
      return opts.model[method]().then(currentProperties => {
        // apply patches to current props
        const original = JSONPatch.clone(currentProperties);
        const patches = qPatches.map(p => ({ op: p.qOp, value: JSON.parse(p.qValue), path: p.qPath }));
        JSONPatch.apply(currentProperties, patches);

        generator.qae.properties.onChange.call({}, currentProperties);

        // calculate new patches from after change
        const newPatches = JSONPatch.generate(original, currentProperties).map(p => ({
          qOp: p.op,
          qValue: JSON.stringify(p.value),
          qPath: p.path,
        }));

        return opts.model.__applyPatchesIntercept.call(this, newPatches, qSoftPatch);
      });
    };
  }

  return {
    generator,
    component: componentInstance,
    selectionToolbar: {
      items: hero.selectionToolbarItems,
    },
    logicalSize: generator.definition.logicalSize || (() => false),
  };
}
