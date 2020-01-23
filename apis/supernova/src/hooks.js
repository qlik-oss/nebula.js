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

export function initiate(component) {
  component.__hooks = {
    obsolete: false,
    error: false,
    chain: {
      promise: null,
      resolve: () => {},
    },
    list: [],
    snaps: [],
    actions: [],
    pendingEffects: [],
    pendingLayoutEffects: [],
    pendingPromises: [],
  };
}

export function teardown(component) {
  flushPending(component.__hooks.list, true);

  component.__hooks.obsolete = true;
  component.__hooks.list.length = 0;
  component.__hooks.pendingEffects.length = 0;
  component.__hooks.pendingLayoutEffects.length = 0;
  component.__hooks.actions.length = 0;
  component.__hooks.dispatchActions = null;

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

  currentIndex = undefined;
  currentComponent = undefined;

  if (!hooks.chain.promise) {
    hooks.chain.promise = new Promise(resolve => {
      hooks.chain.resolve = resolve;
    });
  }

  flushMicro(hooks);
  scheduleMacro(hooks);

  return hooks.chain.promise;
}

function flushPending(list, skipUpdate) {
  try {
    list.forEach(fx => {
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
    return Promise.all(
      component.__hooks.snaps.map(h => {
        return Promise.resolve(h.fn(layout));
      })
    ).then(snaps => {
      return snaps[snaps.length - 1];
    });
  } catch (e) {
    console.error(e);
  }
  return Promise.resolve();
}

function dispatchActions(component) {
  component._dispatchActions && component._dispatchActions(component.__hooks.actions.slice());
}

export function observeActions(component, callback) {
  component._dispatchActions = callback;

  if (component.__hooks) {
    dispatchActions(component);
  }
}

function getHook(idx) {
  if (typeof currentComponent === 'undefined') {
    throw new Error('Invalid nebula hook call. Hooks can only be called inside a supernova component.');
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

function useInternalEnv(name) {
  getHook(++currentIndex);
  const { env } = currentComponent;
  return env[name];
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
  };
}

export function useState(initial) {
  const h = getHook(++currentIndex);
  if (!h.value) {
    // initiate
    h.component = currentComponent;
    const setState = s => {
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

export function useMemo(cb, deps) {
  if (__NEBULA_DEV__) {
    if (!deps) {
      console.warn('useMemo called without dependencies.');
    }
  }
  const h = getHook(++currentIndex);
  if (depsChanged(h.value ? h.value[0] : undefined, deps)) {
    h.value = [deps, cb()];
  }
  return h.value[1];
}

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
      .then(v => {
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
      .catch(e => {
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
export function useAction(fn, deps) {
  const [ref] = useState({
    action() {
      ref._config.action.call(null);
    },
  });

  if (!ref.component) {
    ref.component = currentComponent;
    currentComponent.__hooks.actions.push(ref);
  }
  useMemo(() => {
    const a = fn();
    ref._config = a;

    ref.active = a.active || false;
    ref.enabled = a.enabled !== false;
    ref.getSvgIconShape = a.icon ? () => a.icon : undefined;

    ref.key = a.key || ref.component.__hooks.actions.length;
    dispatchActions(ref.component);
  }, deps);

  return [ref.action];
}

export function useRect() {
  const element = useElement();
  const [rect, setRect] = useState(() => {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { left, top, width, height };
  });

  const ref = useState(() => ({ current: {} }));
  ref.current = rect;

  useLayoutEffect(() => {
    const handleResize = () => {
      // TODO - should we really care about left/top?
      const { left, top, width, height } = element.getBoundingClientRect();
      const r = ref.current;

      if (r.width !== width || r.height !== height || r.left !== left || r.top !== top) {
        setRect({ left, top, width, height });
      }
    };
    if (typeof ResizeObserver === 'function') {
      let resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(element);
      return () => {
        resizeObserver.unobserve(element);
        resizeObserver.disconnect(element);
        resizeObserver = null;
      };
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [element]);

  return [rect];
}

export function useModel() {
  return useInternalContext('model');
}

export function useApp() {
  return useInternalContext('app');
}

export function useGlobal() {
  return useInternalContext('global');
}

export function useElement() {
  return useInternalContext('element');
}

export function useSelections() {
  return useInternalContext('selections');
}

export function useTheme() {
  return useInternalContext('theme');
}

export function useLayout() {
  return useInternalContext('layout');
}

export function useStaleLayout() {
  const layout = useInternalContext('layout');
  const [ref] = useState({ current: layout });
  if (!layout.qSelectionInfo || !layout.qSelectionInfo.qInSelections) {
    ref.current = layout;
  }
  return ref.current;
}

export function useAppLayout() {
  return useInternalContext('appLayout');
}

export function useTranslator() {
  return useInternalEnv('translator');
}

export function onTakeSnapshot(cb) {
  const h = getHook(++currentIndex);
  if (!h.value) {
    h.value = 1;
    currentComponent.__hooks.snaps.push(h);
  }
  h.fn = cb;
}
