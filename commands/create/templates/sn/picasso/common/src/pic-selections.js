/* eslint no-param-reassign: 0 */

// --- enable keyboard accessibility ---
// pressing enter (escape) key should confirm (cancel) selections
const KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  IE11_ESC: 'Esc',
  SHIFT: 'Shift',
};

const instances = [];
let expando = 0;
const confirmOrCancelSelection = (e) => {
  const active = instances.filter((a) => a.selections && a.selections.isActive());
  if (!active.length) {
    return;
  }
  if (e.key === KEYS.ENTER) {
    active.forEach((a) => a.selections.confirm());
  } else if (e.key === KEYS.ESCAPE || e.key === KEYS.IE11_ESC) {
    active.forEach((a) => a.selections.cancel());
  }
};

const setup = () => {
  document.addEventListener('keyup', confirmOrCancelSelection);
};

const teardown = () => {
  document.removeEventListener('keyup', confirmOrCancelSelection);
};
// ------------------------------------------------------

const addListeners = (emitter, listeners) => {
  Object.keys(listeners).forEach((type) => {
    emitter.on(type, listeners[type]);
  });
};

const removeListeners = (emitter, listeners) => {
  Object.keys(listeners).forEach((type) => {
    emitter.removeListener(type, listeners[type]);
  });
};

export default function ({ selections, brush, picassoQ } = {}, { path = '/qHyperCubeDef' } = {}) {
  if (!selections) {
    return {
      layout: () => {},
      release: () => {},
    };
  }
  const key = ++expando;

  let layout = null;

  // interceptors primary job is to ensure selections only occur on either values OR ranges
  const valueInterceptor = (added) => {
    const brushes = brush.brushes();
    brushes.forEach((b) => {
      if (b.type === 'range') {
        // has range selections
        brush.clear([]);
      } else if (added[0] && added[0].key !== b.id) {
        // has selections in another dimension
        brush.clear([]);
      }
    });
    return added.filter((t) => t.value !== -2); // do not allow selection on null value
  };

  const rangeInterceptor = (a) => {
    const v = brush.brushes().filter((b) => b.type === 'value');
    if (v.length) {
      // has dimension values selected
      brush.clear([]);
      return a;
    }
    return a;
  };

  brush.intercept('set-ranges', rangeInterceptor);
  brush.intercept('toggle-ranges', rangeInterceptor);

  brush.intercept('toggle-values', valueInterceptor);
  brush.intercept('set-values', valueInterceptor);
  brush.intercept('add-values', valueInterceptor);

  brush.on('start', () => selections.begin(path));

  const selectionListeners = {
    activate: () => {
      // TODO - check if we can select in the current chart,
    },
    deactivated: () => brush.end(),
    cleared: () => brush.clear(),
    canceled: () => brush.end(),
  };
  addListeners(selections, selectionListeners);

  brush.on('update', () => {
    const generated = picassoQ.selections(brush, {}, layout);
    generated.forEach((s) => selections.select(s));
  });

  if (instances.length === 0) {
    setup();
  }

  instances.push({
    key,
    selections,
  });

  return {
    layout: (lt) => {
      layout = lt;
    },
    release: () => {
      layout = null;
      const idx = instances.indexOf(instances.filter((i) => i.key === key)[0]);
      if (idx !== -1) {
        instances.splice(idx, 1);
      }
      if (!instances.length) {
        teardown();
      }
      removeListeners(selections, selectionListeners);
    },
  };
}
