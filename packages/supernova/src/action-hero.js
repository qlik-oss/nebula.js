import EventEmitter from 'node-event-emitter';
import extend from 'extend';

const mixin = (obj) => {
  /* eslint no-param-reassign: 0 */
  Object.keys(EventEmitter.prototype).forEach((key) => {
    obj[key] = EventEmitter.prototype[key];
  });
  EventEmitter.init(obj);
  return obj;
};

const actionWrapper = component => (item) => {
  const wrapped = mixin(extend(true, {}, item, {
    action() {
      if (typeof item.action === 'function') {
        item.action.call(wrapped, component);
      }
      wrapped.emit('changed');
    },
    enabled() {
      if (typeof item.enabled === 'function') {
        return item.enabled.call(wrapped, component);
      }
      return true;
    },
    active: typeof item.active === 'function' ? function active() {
      return item.active.call(wrapped, component);
    } : undefined,
  }));

  return wrapped;
};

export default function ({
  sn,
  component,
}) {
  const actions = {};
  const selectionToolbarItems = [];
  const w = actionWrapper(component);
  ((sn.selectionToolbar || {}).items || []).forEach((item) => {
    const wrapped = w(item);
    // TODO - check if key exists
    actions[item.key] = wrapped;
    selectionToolbarItems.push(wrapped);
  });

  (sn.actions || []).forEach((item) => {
    const wrapped = w(item);
    // TODO - check if key exists
    actions[item.key] = wrapped;
  });

  return {
    actions,
    selectionToolbarItems,
    destroy() {
      selectionToolbarItems.length = 0;
    },
  };
}
