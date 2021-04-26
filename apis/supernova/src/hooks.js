/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-console: 0 */
/* eslint no-use-before-define: 0 */

// Hooks implementation heavily inspired by prect hooks

let currentComponent;
let currentIndex;

function depsChanged(prevDeps, deps) {
  if (!prevDeps) {
    return true;
  }
  if (deps.length !== prevDeps.length) {
    return true;
  }

  for (let i = 0; i < deps.length; i++) {
    if (prevDeps[i] !== deps[i]) {
      return true;
    }
  }

  return false;
}

export function initiate(component, { explicitResize = false } = {}) {
  component.__hooks = {
    obsolete: false,
    error: false,
    chain: {
      promise: null,
      resolve: () => {},
    },
    list: [],
    snaps: [],
    actions: {
      list: [],
    },
    pendingEffects: [],
    pendingLayoutEffects: [],
    pendingPromises: [],
    resizer: {
      setters: [],
      explicitResize,
    },
  };
}

export function teardown(component) {
  flushPending(component.__hooks.list, true);

  component.__hooks.obsolete = true;
  component.__hooks.list.length = 0;
  component.__hooks.pendingEffects.length = 0;
  component.__hooks.pendingLayoutEffects.length = 0;
  component.__hooks.actions = null;
  component.__hooks.imperativeHandle = null;
  component.__hooks.resizer = null;

  component.__actionsDispatch = null;

  clearTimeout(component.__hooks.micro);
  cancelAnimationFrame(component.__hooks.macro);
}

export async function run(component) {
  if (component.__hooks.obsolete) {
    return Promise.resolve();
  }

  currentIndex = -1;
  currentComponent = component;

  let num = -1;

  if (currentComponent.__hooks.initiated) {
    num = currentComponent.__hooks.list.length;
  }

  try {
    currentComponent.fn.call(null);
  } catch (e) {
    console.error(e);
  }

  currentComponent.__hooks.initiated = true;

  if (__NEBULA_DEV__) {
    if (num > -1 && num !== currentComponent.__hooks.list.length) {
      console.error('Detected a change in the order of hooks called.');
    }
  }

  const hooks = currentComponent.__hooks;
  dispatchActions(currentComponent);

  currentIndex = undefined;
  currentComponent = undefined;

  if (!hooks.chain.promise) {
    hooks.chain.promise = new Promise((resolve) => {
      hooks.chain.resolve = resolve;
    });
  }

  flushMicro(hooks);
  scheduleMacro(hooks);

  return hooks.chain.promise;
}

function flushPending(list, skipUpdate) {
  try {
    list.forEach((fx) => {
      // teardown existing
      typeof fx.teardown === 'function' ? fx.teardown() : null;

      // update
      if (!skipUpdate) {
        fx.teardown = fx.value[0]();
      }
    });
  } catch (e) {
    console.error(e);
  }

  list.length = 0;
}

function flushMicro(hooks) {
  flushPending(hooks.pendingLayoutEffects);
}
function flushMacro(hooks) {
  flushPending(hooks.pendingEffects);
  hooks.macro = null;

  maybeEndChain(hooks); // eslint-disable-line no-use-before-define
}

function maybeEndChain(hooks) {
  if (hooks.pendingPromises.length || hooks.micro || hooks.macro) {
    return;
  }
  hooks.chain.promise = null;
  hooks.chain.resolve();
}

export function runSnaps(component, layout) {
  try {
    return Promise.all(component.__hooks.snaps.map((h) => Promise.resolve(h.fn(layout)))).then(
      (snaps) => snaps[snaps.length - 1]
    );
  } catch (e) {
    console.error(e);
  }
  return Promise.resolve();
}

export function getImperativeHandle(component) {
  return component.__hooks.imperativeHandle;
}

function dispatchActions(component) {
  if (component.__actionsDispatch && component.__hooks.actions.changed) {
    component.__actionsDispatch(component.__hooks.actions.list.slice());
    component.__hooks.actions.changed = false;
  }
}

export function observeActions(component, callback) {
  component.__actionsDispatch = callback;
  if (component.__hooks) {
    component.__hooks.actions.changed = true;
    dispatchActions(component);
  }
}

function getHook(idx) {
  if (typeof currentComponent === 'undefined') {
    throw new Error('Invalid stardust hook call. Hooks can only be called inside a visualization component.');
  }
  const hooks = currentComponent.__hooks;
  if (idx >= hooks.list.length) {
    hooks.list.push({});
  }
  return hooks.list[idx];
}

function scheduleMicro(component) {
  if (component.__hooks.micro) {
    return;
  }

  component.__hooks.micro = setTimeout(() => {
    component.__hooks.micro = null;
    run(component);
  }, 0);
}

function scheduleMacro(hooks) {
  if (hooks.macro) {
    return;
  }

  hooks.macro = requestAnimationFrame(() => {
    flushMacro(hooks);
  });
}

function useInternalContext(name) {
  getHook(++currentIndex);
  const ctx = currentComponent.context;
  return ctx[name];
}

export function updateRectOnNextRun(component) {
  if (component.__hooks) {
    component.__hooks.resizer.update = true;
  }
}

// ========  EXTERNAL =========

export function hook(cb) {
  return {
    __hooked: true,
    fn: cb,
    initiate,
    run,
    teardown,
    runSnaps,
    observeActions,
    getImperativeHandle,
    updateRectOnNextRun,
  };
}

/**
 * @template S
 * @interface SetStateFn
 * @param {S|function(S):S} newState - The new state
 */

/**
 * Creates a stateful value.
 * @entry
 * @template S
 * @param {S|function():S} initialState - The initial state.
 * @returns {Array<S,SetStateFn<S>>} The value and a function to update it.
 * @example
 * import { useState } from '@nebula.js/stardust';
 * // ...
 * // initiate with simple primitive value
 * const [zoomed, setZoomed] = useState(false);
 *
 * // update
 * setZoomed(true);
 *
 * // lazy initiation
 * const [value, setValue] = useState(() => heavy());
 *
 */
export function useState(initial) {
  const h = getHook(++currentIndex);
  if (!h.value) {
    // initiate
    h.component = currentComponent;
    const setState = (s) => {
      if (h.component.__hooks.obsolete) {
        if (__NEBULA_DEV__) {
          throw new Error(
            'Calling setState on an unmounted component is a no-op and indicates a memory leak in your component.'
          );
        }
        return;
      }
      const v = typeof s === 'function' ? s(h.value[0]) : s;
      if (v !== h.value[0]) {
        h.value[0] = v;
        scheduleMicro(h.component);
      }
    };
    h.value = [typeof initial === 'function' ? initial() : initial, setState];
  }
  return h.value;
}

/**
 * @typedef {function():(void | function():void)} EffectCallback
 */

/**
 * Triggers a callback function when a dependent value changes.
 * @entry
 * @param {EffectCallback} effect - The callback.
 * @param {Array<any>=} deps - The dependencies that should trigger the callback.
 * @example
 * import { useEffect } from '@nebula.js/stardust';
 * // ...
 * useEffect(() => {
 *   console.log('mounted');
 *   return () => {
 *     console.log('unmounted');
 *   };
 * }, []);
 */
export function useEffect(cb, deps) {
  if (__NEBULA_DEV__) {
    if (typeof deps !== 'undefined' && !Array.isArray(deps)) {
      throw new Error('Invalid dependencies. Second argument must be an array.');
    }
  }
  const h = getHook(++currentIndex);
  if (depsChanged(h.value ? h.value[1] : undefined, deps)) {
    h.value = [cb, deps];
    if (currentComponent.__hooks.pendingEffects.indexOf(h) === -1) {
      currentComponent.__hooks.pendingEffects.push(h);
    }
  }
}

// don't expose this hook since it's no different than useEffect except for the timing
function useLayoutEffect(cb, deps) {
  if (__NEBULA_DEV__) {
    if (typeof deps !== 'undefined' && !Array.isArray(deps)) {
      throw new Error('Invalid dependencies. Second argument must be an array.');
    }
  }
  const h = getHook(++currentIndex);
  if (depsChanged(h.value ? h.value[1] : undefined, deps)) {
    h.value = [cb, deps];
    currentComponent.__hooks.pendingLayoutEffects.push(h);
  }
}

/**
 * Creates a stateful value when a dependent changes.
 * @entry
 * @template T
 * @param {function():T} factory - The factory function.
 * @param {Array<any>} deps - The dependencies.
 * @returns {T} The value returned from the factory function.
 * @example
 * import { useMemo } from '@nebula.js/stardust';
 * // ...
 * const v = useMemo(() => {
 *   return doSomeHeavyCalculation();
 * }), []);
 */
export function useMemo(fn, deps) {
  if (__NEBULA_DEV__) {
    if (!deps) {
      console.warn('useMemo called without dependencies.');
    }
  }
  const h = getHook(++currentIndex);
  if (depsChanged(h.value ? h.value[0] : undefined, deps)) {
    h.value = [deps, fn()];
  }
  return h.value[1];
}

/**
 * Runs a callback function when a dependent changes.
 * @entry
 * @template P
 * @param {function():Promise<P>} factory - The factory function that calls the promise.
 * @param {Array<any>=} deps - The dependencies.
 * @returns {Array<P,Error>} The resolved value.
 * @example
 * import { usePromise } from '@nebula.js/stardust';
 * import { useModel } from '@nebula.js/stardust';
 * // ...
 * const model = useModel();
 * const [resolved, rejected] = usePromise(() => model.getLayout(), []);
 */
export function usePromise(p, deps) {
  const [obj, setObj] = useState(() => ({
    resolved: undefined,
    rejected: undefined,
    state: 'pending',
  }));

  const h = getHook(++currentIndex);
  if (!h.component) {
    h.component = currentComponent;
  }

  useLayoutEffect(() => {
    let canceled = false;
    h.teardown = () => {
      canceled = true;
      h.teardown = null;
      const idx = h.component.__hooks.pendingPromises.indexOf(h);
      if (idx > -1) {
        h.component.__hooks.pendingPromises.splice(idx, 1);
      }
    };

    // setObj({
    //   ...obj,
    //   state: 'pending',
    // });

    p()
      .then((v) => {
        if (canceled) {
          return;
        }
        h.teardown && h.teardown();
        setObj({
          resolved: v,
          rejected: undefined,
          state: 'resolved',
        });
      })
      .catch((e) => {
        if (canceled) {
          return;
        }
        h.teardown && h.teardown();
        setObj({
          resolved: undefined,
          rejected: e,
          state: 'resolved',
        });
      });

    h.component.__hooks.pendingPromises.push(h);

    return () => {
      h.teardown && h.teardown();
    };
  }, deps);

  return [obj.resolved, obj.rejected];
}

// ---- composed hooks ------
/**
 * Gets the HTMLElement this visualization is rendered into.
 * @entry
 * @returns {HTMLElement}
 * @example
 * import { useElement } from '@nebula.js/stardust';
 * // ...
 * const el = useElement();
 * el.innerHTML = 'Hello!';
 */
export function useElement() {
  return useInternalContext('element');
}

/**
 * @interface Rect
 * @property {number} top
 * @property {number} left
 * @property {number} width
 * @property {number} height
 */

/**
 * Gets the size of the HTMLElement the visualization is rendered into.
 * @entry
 * @returns {Rect} The size of the element.
 * @example
 * import { useRect } from '@nebula.js/stardust';
 * // ...
 * const rect = useRect();
 * useEffect(() => {
 *   console.log('resize');
 * }, [rect.width, rect.height])
 */
export function useRect() {
  const element = useElement();
  const ref = currentComponent.__hooks.resizer;

  const [rect, setRect] = useState(() => {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { left, top, width, height };
  });

  ref.current = rect;

  if (ref.setters.indexOf(setRect) === -1) {
    ref.setters.push(setRect);
  }

  // a forced resize should alwas update size regardless of whether ResizeObserver is available
  if (ref.update && ref.resize) {
    ref.update = false;
    ref.resize();
  }

  useLayoutEffect(() => {
    if (ref.initiated) {
      return undefined;
    }
    ref.initiated = true;

    const handleResize = () => {
      // TODO - should we really care about left/top?
      const { left, top, width, height } = element.getBoundingClientRect();
      const r = ref.current;

      if (r.width !== width || r.height !== height || r.left !== left || r.top !== top) {
        ref.setters.forEach((setR) => setR({ left, top, width, height }));
      }
    };

    ref.resize = () => {
      handleResize();
    };

    // if component is configured with explicitResize, then we skip the
    // size observer and let the user control the resize themselves
    if (ref.explicitResize) {
      return () => {
        ref.resize = undefined;
      };
    }

    // TODO - document that ResizeObserver needs to be polyfilled by the user
    // if they want auto resize to work
    if (typeof ResizeObserver === 'function') {
      let resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(element);
      return () => {
        resizeObserver.unobserve(element);
        resizeObserver.disconnect(element);
        resizeObserver = null;
        ref.resize = undefined;
      };
    }
    return undefined;
  }, [element]);

  return rect;
}

/**
 * Gets the layout of the generic object associated with this visualization.
 * @entry
 * @returns {qae.GenericObjectLayout}
 * @example
 * import { useLayout } from '@nebula.js/stardust';
 * // ...
 * const layout = useLayout();
 * console.log(layout);
 */
export function useLayout() {
  return useInternalContext('layout');
}

/**
 * Gets the layout of the generic object associated with this visualization.
 *
 * Unlike the regular layout, a _stale_ layout is not changed when a generic object enters
 * the modal state. This is mostly notable in that `qSelectionInfo.qInSelections` in the layout is
 * always `false`.
 * The returned value from `useStaleLayout()` and `useLayout()` are identical when the object
 * is not in a modal state.
 * @entry
 * @returns {qae.GenericObjectLayout}
 * @example
 * import { useStaleLayout } from '@nebula.js/stardust';
 * // ...
 * const staleLayout = useStaleLayout();
 * console.log(staleLayout);
 */
export function useStaleLayout() {
  const layout = useInternalContext('layout');
  const [ref] = useState({ current: layout });
  if (!layout.qSelectionInfo || !layout.qSelectionInfo.qInSelections) {
    ref.current = layout;
  }
  return ref.current;
}

/**
 * Gets the layout of the app associated with this visualization.
 * @entry
 * @returns {qae.NxAppLayout} The app layout
 * @example
 * import { useAppLayout } from '@nebula.js/stardust';
 * // ...
 * const appLayout = useAppLayout();
 * console.log(appLayout.qLocaleInfo);
 */
export function useAppLayout() {
  return useInternalContext('appLayout');
}

/**
 * Gets the generic object API of the generic object connected to this visualization.
 * @entry
 * @returns {enigma.GenericObject|undefined}
 * @example
 * import { useModel } from '@nebula.js/stardust';
 * // ...
 * const model = useModel();
 * useEffect(() => {
 *   model.getInfo().then(info => {
 *     console.log(info);
 *   })
 * }, []);
 */
export function useModel() {
  const model = useInternalContext('model');
  return model && model.session ? model : undefined;
}

/**
 * Gets the doc API.
 * @entry
 * @returns {enigma.Doc|undefined} The doc API.
 * @example
 * import { useApp } from '@nebula.js/stardust';
 * // ...
 * const app = useApp();
 * useEffect(() => {
 *   app.getAllInfos().then(infos => {
 *     console.log(infos);
 *   })
 * }, []);
 */
export function useApp() {
  const app = useInternalContext('app');
  return app && app.session ? app : undefined;
}

/**
 * Gets the global API.
 * @entry
 * @returns {enigma.Global|undefined} The global API.
 * @example
 * import { useGlobal } from '@nebula.js/stardust';
 *
 * // ...
 * const g = useGlobal();
 * useEffect(() => {
 *   g.engineVersion().then(version => {
 *     console.log(version);
 *   })
 * }, []);
 */
export function useGlobal() {
  const global = useInternalContext('global');
  return global && global.session ? global : undefined;
}

/**
 * Gets the object selections.
 * @entry
 * @returns {ObjectSelections} The object selections.
 * @example
 * import { useSelections } from '@nebula.js/stardust';
 * import { useElement } from '@nebula.js/stardust';
 * import { useEffect } from '@nebula.js/stardust';
 * // ...
 * const selections = useSelections();
 * const element = useElement();
 * useEffect(() => {
 *   const onClick = () => {
 *     selections.begin('/qHyperCubeDef');
 *   };
 *   element.addEventListener('click', onClick);
 *   return () => {
 *     element.removeEventListener('click', onClick);
 *   };
 * }, []);
 */
export function useSelections() {
  return useInternalContext('selections');
}

/**
 * Gets the theme.
 * @entry
 * @returns {Theme} The theme.
 * @example
 * import { useTheme } from '@nebula.js/stardust';
 *
 * const theme = useTheme();
 * console.log(theme.getContrastinColorTo('#ff0000'));
 */
export function useTheme() {
  return useInternalContext('theme');
}

/**
 * Gets the translator.
 * @entry
 * @returns {Translator} The translator.
 * @example
 * import { useTranslator } from '@nebula.js/stardust';
 * // ...
 * const translator = useTranslator();
 * console.log(translator.get('SomeString'));
 */
export function useTranslator() {
  return useInternalContext('translator');
}

/**
 * Gets the device type. ('touch' or 'desktop')
 * @entry
 * @returns {string} device type.
 * @example
 * import { useDeviceType } from '@nebula.js/stardust';
 * // ...
 * const deviceType = useDeviceType();
 * if (deviceType === 'touch') { ... };
 */
export function useDeviceType() {
  return useInternalContext('deviceType');
}

/**
 * Gets the array of plugins provided when rendering the visualization.
 * @entry
 * @returns {Plugin[]} array of plugins.
 * @example
 * // provide plugins that can be used when rendering
 * embed(app).render({
 *   element,
 *   type: 'my-chart',
 *   plugins: [plugin]
 * });
 *
 * @example
 * // It's up to the chart implementation to make use of plugins in any way
 * import { usePlugins } from '@nebula.js/stardust';
 * // ...
 * const plugins = usePlugins();
 * plugins.forEach((plugin) => {
 *   // Invoke plugin
 *   plugin.fn();
 * });
 */
export function usePlugins() {
  return useInternalContext('plugins');
}

/**
 * @template A
 * @interface ActionDefinition
 * @property {A} action
 * @property {boolean=} hidden
 * @property {boolean=} disabled
 * @property {object=} icon
 * @property {string} [icon.viewBox="0 0 16 16"]
 * @property {Array<object>} icon.shapes
 * @property {string} icon.shapes[].type
 * @property {object=} icon.shapes[].attrs
 */

/**
 * Registers a custom action.
 * @entry
 * @template A
 * @param {function():ActionDefinition<A>} factory
 * @param {Array<any>=} deps
 * @returns {A}
 *
 * @example
 * import { useAction } from '@nebula.js/stardust';
 * // ...
 * const [zoomed, setZoomed] = useState(false);
 * const act = useAction(() => ({
 *   hidden: false,
 *   disabled: zoomed,
 *   action() {
 *     setZoomed(prev => !prev);
 *   },
 *   icon: {}
 * }), [zoomed]);
 */
export function useAction(fn, deps) {
  const [ref] = useState({
    action() {
      ref._config.action.call(null);
    },
  });

  if (!ref.component) {
    ref.component = currentComponent;
    currentComponent.__hooks.actions.list.push(ref);
  }
  useMemo(() => {
    const a = fn();
    ref._config = a;

    ref.active = a.active || false;
    ref.disabled = a.disabled || false;
    ref.hidden = a.hidden || false;
    ref.label = a.label || '';
    ref.getSvgIconShape = a.icon ? () => a.icon : undefined;

    ref.key = a.key || ref.component.__hooks.actions.list.length;

    ref.component.__hooks.actions.changed = true;
  }, deps);

  return ref.action;
}

/**
 * @interface Constraints
 * @property {boolean=} passive
 * @property {boolean=} active
 * @property {boolean=} select
 */

/**
 * Gets the desired constraints that should be applied when rendering the visualization.
 *
 * The constraints are set on the embed configuration before the visualization is rendered
 * and should respected by you when implementing the visualization.
 * @entry
 * @returns {Constraints}
 * @example
 * // configure embed to disallow active interactions when rendering
 * embed(app, {
 *   constraints: {
 *     active: true, // do not allow interactions
 *   }
 * }).render({ element, id: 'sdfsdf' });
 *
 * @example
 * import { useConstraints } from '@nebula.js/stardust';
 * // ...
 * const constraints = useConstraints();
 * useEffect(() => {
 *   if (constraints.active) {
 *     // do not add any event listener if active constraint is set
 *     return undefined;
 *   }
 *   const listener = () => {};
 *   element.addEventListener('click', listener);
 *   return () => {
 *     element.removeEventListener('click', listener);
 *   };
 * }, [constraints])
 *
 */
export function useConstraints() {
  return useInternalContext('constraints');
}

/**
 * Gets the options object provided when rendering the visualization.
 *
 * This is an empty object by default but enables customization of the visualization through this object.
 * Options are different from setting properties on the generic object in that options
 * are only temporary settings applied to the visualization when rendered.
 *
 * You have the responsibility to provide documentation of the options you support, if any.
 * @entry
 * @returns {object}
 *
 * @example
 * // when embedding the visualization, anything can be set in options
 * embed(app).render({
 *   element,
 *   type: 'my-chart',
 *   options: {
 *     showNavigation: true,
 *   }
 * });
 *
 * @example
 * // it is up to you use and implement the provided options
 * import { useOptions } from '@nebula.js/stardust';
 * import { useEffect } from '@nebula.js/stardust';
 * // ...
 * const options = useOptions();
 * useEffect(() => {
 *   if (!options.showNavigation) {
 *     // hide navigation
 *   } else {
 *     // show navigation
 *   }
 * }, [options.showNavigation]);
 *
 */
export function useOptions() {
  return useInternalContext('options');
}

/**
 * TODO before making public - expose getImperativeHandle on Viz
 * Exposes an API to the external environment.
 *
 * This is an empty object by default, but enables you to provide a custom API of your visualization to
 * make it possible to control after it has been rendered.
 *
 * You can only use this hook once, calling it more than once is considered an error.
 * @entry
 * @private
 * @template T
 * @param {function():T} factory
 * @param {Array<any>=} deps
 * @example
 * import { useImperativeHandle } form '@nebula.js/stardust';
 * // ...
 * useImperativeHandle(() => ({
 *   resetZoom() {
 *     setZoomed(false);
 *   }
 * }));
 *
 * @example
 * // when embedding the visualization, you can get a handle to this API
 * // and use it to control the visualization
 * const ctl = await embed(app).render({
 *   element,
 *   type: 'my-chart',
 * });
 * ctl.getImperativeHandle().resetZoom();
 */
export function useImperativeHandle(fn, deps) {
  const h = getHook(++currentIndex);
  if (!h.imperative) {
    if (__NEBULA_DEV__) {
      if (currentComponent.__hooks.imperativeHandle) {
        throw new Error('useImperativeHandle already used.');
      }
    }
    h.imperative = true;
  }

  if (depsChanged(h.value ? h.value[0] : undefined, deps)) {
    const v = fn();
    h.value = [deps, v];
    currentComponent.__hooks.imperativeHandle = v;
  }
}

/**
 * Registers a callback that is called when a snapshot is taken.
 * @entry
 * @param {function(qae.GenericObjectLayout): Promise<qae.GenericObjectLayout>} snapshotCallback
 * @example
 * import { onTakeSnapshot } from '@nebula.js/stardust';
 * import { useState } from '@nebula.js/stardust';
 * import { useLayout } from '@nebula.js/stardust';
 *
 * const layout = useLayout();
 * const [zoomed] = useState(layout.isZoomed || false);
 *
 * onTakeSnapshot((copyOfLayout) => {
 *   copyOfLayout.isZoomed = zoomed;
 *   return Promise.resolve(copyOfLayout);
 * });
 */
export function onTakeSnapshot(cb) {
  const h = getHook(++currentIndex);
  if (!h.value) {
    h.value = 1;
    currentComponent.__hooks.snaps.push(h);
  }
  h.fn = cb;
}
