/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */
/* eslint no-console: 0 */

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
    list: [],
    snaps: [],
    pendingEffects: [],
  };
}

export function teardown(component) {
  component.__hooks.list.forEach(fx => {
    try {
      typeof fx.teardown === 'function' ? fx.teardown() : null;
    } catch (e) {
      console.error(e);
    }
  });

  component.__hooks.obsolete = true;
  component.__hooks.list.length = 0;
  component.__hooks.pendingEffects.length = 0;
  cancelAnimationFrame(component.__hooks.scheduled);
}

export async function render(component) {
  if (component.__hooks.error || component.__hooks.obsolete) {
    return;
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
      console.warn('Detected a change in the order of hooks called.');
    }
  }

  const pending = currentComponent.__hooks;
  pending.scheduled = null;

  currentIndex = undefined;
  currentComponent = undefined;

  // eslint-disable-next-line consistent-return
  return new Promise(resolve => {
    setTimeout(() => {
      afterRender(pending); // eslint-disable-line no-use-before-define
      resolve();
    }, 0);
  });
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

function afterRender(hooks) {
  try {
    hooks.pendingEffects.forEach(fx => {
      // teardown existing
      typeof fx.teardown === 'function' ? fx.teardown() : null;

      // update
      fx.teardown = fx.value[0]();
    });
  } catch (e) {
    console.error(e);
  }

  hooks.pendingEffects.length = 0;
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

function schedule(component) {
  if (component.__hooks.scheduled) {
    return;
  }

  component.__hooks.scheduled = requestAnimationFrame(() => {
    render(component, true);
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
    render,
    teardown,
    runSnaps,
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
        schedule(h.component);
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
    currentComponent.__hooks.pendingEffects.push(h);
  }
}

export function useMemo(cb, deps) {
  if (__NEBULA_DEV__) {
    if (!deps || !deps.length) {
      console.warn('useMemo called without dependencies.');
    }
  }
  const h = getHook(++currentIndex);
  if (depsChanged(h.value ? h.value[0] : undefined, deps)) {
    h.value = [deps, cb()];
  }
  return h.value[1];
}

// ---- composed hooks ------
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

export function useTranslator() {
  return useInternalEnv('translator');
}

export function useBehaviour() {
  return useInternalContext('permissions');
}

export function onTakeSnapshot(cb) {
  const h = getHook(++currentIndex);
  if (!h.value) {
    h.value = 1;
    currentComponent.__hooks.snaps.push(h);
  }
  h.fn = cb;
}
