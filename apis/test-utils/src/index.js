/* eslint import/prefer-default-export:0 */

import 'regenerator-runtime/runtime'; // temporary polyfill for transpiled async/await in supernova
import { hook } from '@nebula.js/supernova';

if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = cb => setTimeout(cb, 10);
  global.cancelAnimationFrame = id => clearTimeout(id);
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
    unmount() {
      return hooked.teardown(component);
    },
    takeSnapshot() {
      return hooked.runSnaps(component, component.context.layout);
    },
    actions() {
      // TODO
      return [];
    },
  };
}
