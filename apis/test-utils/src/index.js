/* eslint import/prefer-default-export:0 */

import { __DO_NOT_USE__ } from '@nebula.js/stardust';

const { hook } = __DO_NOT_USE__;

if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 10);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
}
export function create(definition, context = {}) {
  const hooked = hook(definition);
  const component = {
    context: {
      ...context,
    },
    env: {
      translator: context.translator,
    },
    fn: hooked.fn,
  };

  let actions = [];
  hooked.observeActions(component, (updatedActions) => {
    actions = updatedActions;
  });

  hooked.initiate(component);

  return {
    update(ctx) {
      if (ctx) {
        Object.assign(component.context, ctx);
      }
      if (ctx && ctx.translator) {
        component.env.translator = ctx.translator;
      }
      return hooked.run(component);
    },
    updateRectOnNextUpdate() {
      hooked.updateRectOnNextRun(component);
    },
    unmount() {
      return hooked.teardown(component);
    },
    takeSnapshot() {
      return hooked.runSnaps(component, component.context.layout);
    },
    actions() {
      return actions;
    },
  };
}
