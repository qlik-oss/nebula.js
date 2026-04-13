---
name: nebula-chart-dev
description: 'Build, develop, and review nebula.js (stardust) visualization charts. Use when: creating supernova charts, implementing hooks (usePromise, useLayout, useStaleLayout, useTheme, useRect, useSelections, useInteractionState), setting up the property panel (ext definition, accordion, items), rendering with React inside a supernova component, handling printing/snapshots, avoiding DOM pollution and global CSS. Covers project scaffolding, data binding, selection handling, theme access, resize handling, and debugging patterns. DO NOT USE for mashup/embed API work or Qlik engine configuration.'
---

# Nebula.js Chart Development

Reference: [Official quickstart](https://qlik.dev/extend/extend-quickstarts/first-extension/) | [Examples repo](https://github.com/qlik-oss/nebula.js-examples/tree/main/examples) | [In-Sense guide](https://qlik.dev/extend/build-extension/in-qlik-sense/) | [Property panel guide](https://qlik.dev/extend/property-panel-basics/extensions-add-custom-properties/)

## Multi-File Starter Template

For a real scaffold (not only markdown snippets), use the files in:

- `./assets/advanced-chart-template/src/index.js`
- `./assets/advanced-chart-template/src/data.js`
- `./assets/advanced-chart-template/src/object-properties.js`
- `./assets/advanced-chart-template/src/ext.js`
- `./assets/advanced-chart-template/src/components/root.jsx`
- `./assets/advanced-chart-template/src/components/AdvancedChart.jsx`
- `./assets/advanced-chart-template/src/components/chart.css`

When asked to generate a new nebula chart in this skill, prefer copying this template folder first, then fill in the TODO sections with chart-specific logic.

---

## Project Structure

Scaffold a new chart:

```bash
npx @nebula.js/cli create <name> --picasso none   # plain canvas/DOM chart
npx @nebula.js/cli create <name> --picasso minimal # picasso.js scaffold
npx @nebula.js/cli create <name>                  # full picasso barchart scaffold
```

Key files generated:

- `src/index.js` — supernova entry point (the chart)
- `src/object-properties.js` — default QIX object properties
- `src/data.js` — data targets (dimensions/measures)
- `src/ext.js` — Qlik Sense property panel + environment access

Dev workflow:

```bash
npm run start   # start nebula dev server with hot reload
npm run build   # bundle to /dist
npm run sense   # bundle as Qlik Sense extension to /name-ext/
```

---

## Supernova Skeleton

```js
import { useElement, useLayout, useEffect } from '@nebula.js/stardust';
import properties from './object-properties';
import data from './data';
import ext from './ext';

export default function supernova(galaxy) {
  return {
    qae: { properties, data },
    ext: ext(galaxy),
    component() {
      // All hooks MUST be called here, at the top level — never conditionally
      const element = useElement();
      const layout = useLayout();

      useEffect(() => {
        element.innerHTML = `<p>${layout.title}</p>`;
      }, [element, layout]);
    },
  };
}
```

**Rules:**

- Hooks are only valid inside `component()`. Calling them elsewhere throws `"Invalid stardust hook call"`.
- Never change hook call order between renders (same rule as React).

---

## Hooks Reference

### `useElement()`

Returns the `HTMLElement` the chart must render into. Never manipulate the DOM outside this element.

```js
const element = useElement();
element.innerHTML = '<p>Hello</p>';
```

### `useLayout()` vs `useStaleLayout()`

| Hook               | Behavior during selection modal                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `useLayout()`      | Updates with every layout change; `qSelectionInfo.qInSelections` becomes `true` when in selections mode |
| `useStaleLayout()` | Returns the **last non-modal layout** — `qSelectionInfo.qInSelections` is always `false`                |

**Use `useStaleLayout()` for rendering** when you don't want the chart to re-render while a user is actively brushing/selecting (avoids flickering). Use `useLayout()` only if you specifically need to react to the selection state changing.

```js
// Picasso / most charts — render from stale, don't re-render mid-selection
const layout = useStaleLayout();

// Table / charts that must update their highlight state
const layout = useLayout();
useEffect(() => {
  if (layout.qSelectionInfo.qInSelections) {
    // optionally skip heavy re-render
    return;
  }
  // ...render...
}, [layout]);
```

### `usePromise(factory, deps)`

Wraps an async operation. The factory must return a Promise. Returns `[resolved, rejected]`.

**Why it matters:** nebula.js tracks pending promises returned from `usePromise` to know when the chart has finished rendering. This is critical for:

- Snapshot/print support (`nebula serve --print` and `snapshooter`)
- Integration test stability
- Any async data fetch that must complete before the chart is "done"

If async work is done inside a plain `useEffect`, the framework considers the chart rendered before the data arrives — snapshots will be blank.

```js
import { useModel, usePromise, useEffect } from '@nebula.js/stardust';

const model = useModel();

// GOOD — framework waits for this before considering chart "rendered"
const [layout, error] = usePromise(() => model.getLayout(), [model]);

useEffect(() => {
  if (!layout) return;
  // render with layout
}, [layout]);
```

```js
// BAD for printing — framework does not know to wait
useEffect(() => {
  model.getLayout().then((layout) => {
    // render...
  });
}, [model]);
```

**Pattern: async data transformation with `usePromise`**

```js
const layout = useLayout();
const [data, err] = usePromise(async () => {
  if (!layout?.qHyperCube?.qDataPages[0]?.qMatrix.length) {
    throw new Error('No data');
  }
  // async processing (e.g. fetch enrichment data)
  return processRows(layout.qHyperCube.qDataPages[0].qMatrix);
}, [layout]);

useEffect(() => {
  if (!data) return;
  renderChart(element, data);
}, [data, element]);
```

### `useTheme()`

Returns a `Theme` object. The theme re-triggers dependent effects when the active theme changes (e.g. user switches dark/light).

```js
import { useTheme, useEffect } from '@nebula.js/stardust';

const theme = useTheme();

useEffect(() => {
  const bgColor = theme.getStyle('object', '', 'backgroundColor') ?? '#ffffff';
  const fgColor = theme.getContrastingColorTo(bgColor);
  element.style.background = bgColor;
  element.style.color = fgColor;
}, [theme, element]);
```

**Key `Theme` methods:**

| Method                                          | Returns               | Use case                                                                 |
| ----------------------------------------------- | --------------------- | ------------------------------------------------------------------------ |
| `theme.getStyle(basePath, path, attribute)`     | `string \| undefined` | Resolve CSS-like token from theme JSON (font size, colors, etc.)         |
| `theme.getContrastingColorTo(color)`            | `string`              | Find readable text color for an arbitrary background                     |
| `theme.getColorPickerColor({ index?, color? })` | `string`              | Resolve a Qlik color-picker value (from `color` property) to a CSS color |
| `theme.getDataColorPalettes()`                  | `DataPalette[]`       | Access the theme's named data palettes                                   |
| `theme.getDataColorSpecials()`                  | `DataColorSpecials`   | Null/other/tertiary special colors                                       |
| `theme.validateColor(specifier)`                | `string \| undefined` | Parse any color string incl. Qlik ARGB format                            |

**`getStyle` path resolution:** Starts at `basePath` (e.g. `"object"`) and walks upward through ancestors until found.

```js
// Font size for chart titles
theme.getStyle('object', 'title.main', 'fontSize');
// Same — attribute dotted notation
theme.getStyle('object', '', 'title.main.fontSize');
// Global font size fallback
theme.getStyle('', '', 'fontSize');
```

**Sense-specific theme vs `useTheme()`:**
Inside `ext` (outside `component()`), `galaxy.anything.sense.theme` is available but is a different, Sense-specific module. `useTheme()` is only available inside `component()` and is always present (local dev and in Sense).

### `useRect()`

Returns `{ top, left, width, height }` of the chart container. Updates automatically via `ResizeObserver`.

**Only use `useRect()` if your chart needs to respond to size changes** (e.g. re-layout a canvas or resize a third-party library). Do not add it if the chart already fills the container via CSS.

```js
import { useRect, useEffect } from '@nebula.js/stardust';

const rect = useRect();

// Only re-render when dimensions change
useEffect(() => {
  if (!instance) return;
  instance.resize(rect.width, rect.height);
  instance.update();
}, [rect.width, rect.height, instance]);
```

**Note:** ResizeObserver must be polyfilled by the consumer app if older browser support is required.

### `useSelections()`

```js
import { useSelections, useElement, useState, useEffect } from '@nebula.js/stardust';

const selections = useSelections();
const [selectedRows, setSelectedRows] = useState([]);

// Add click listener (register in one effect, keeping it stable)
useEffect(() => {
  const onClick = (e) => {
    if (e.target.tagName !== 'TD') return;
    if (!selections.isActive()) {
      selections.begin('/qHyperCubeDef');
    }
    const row = +e.target.parentElement.getAttribute('data-row');
    setSelectedRows((prev) => (prev.includes(row) ? prev.filter((v) => v !== row) : [...prev, row]));
  };
  element.addEventListener('click', onClick);
  return () => element.removeEventListener('click', onClick);
}, [element]);

// Commit or clear selections when rows change
useEffect(() => {
  if (selections.isActive()) {
    if (selectedRows.length) {
      selections.select({ method: 'selectHyperCubeCells', params: ['/qHyperCubeDef', selectedRows, []] });
    } else {
      selections.select({ method: 'resetMadeSelections', params: [] });
    }
  } else if (selectedRows.length) {
    setSelectedRows([]);
  }
}, [selections.isActive(), selectedRows]);
```

### `useInteractionState()` (preferred over deprecated `useConstraints()`)

```js
import { useInteractionState } from '@nebula.js/stardust';

const interactions = useInteractionState();
// interactions.active  — true = user can click/scroll
// interactions.select  — true = selections allowed
// interactions.passive — true = tooltips allowed
// interactions.edit    — true = edit mode active

useEffect(() => {
  if (!interactions.active) return; // don't add listeners in passive/view mode
  element.addEventListener('click', handler);
  return () => element.removeEventListener('click', handler);
}, [interactions.active]);
```

### Other hooks (quick reference)

| Hook                  | Returns                                |
| --------------------- | -------------------------------------- |
| `useModel()`          | QIX GenericObject API                  |
| `useApp()`            | QIX Doc API                            |
| `useAppLayout()`      | App-level layout (locale info, etc.)   |
| `useTranslator()`     | Translator for i18n strings            |
| `useDeviceType()`     | `"desktop"` or `"touch"`               |
| `useState(initial)`   | `[value, setter]` — triggers re-render |
| `useMemo(fn, deps)`   | Memoized value                         |
| `useRef(initial)`     | Stable mutable ref (no re-render)      |
| `useAction(fn, deps)` | Register a toolbar action button       |

---

## Rendering with React

Nebula's `component()` is **not** React — it uses its own hooks system. To use React for your chart UI, mount/unmount a React tree from `useEffect`.

```js
// src/components/root.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import MyChart from './MyChart';

export function render(element, props) {
  const root = createRoot(element);
  root.render(<MyChart {...props} />);
  return root;
}

export function teardown(root) {
  root.unmount();
}
```

```js
// src/index.js
import { useElement, useLayout, useEffect } from '@nebula.js/stardust';
import { render, teardown } from './components/root';

export default function supernova(galaxy) {
  return {
    qae: { properties, data },
    ext: ext(galaxy),
    component() {
      const el = useElement();
      const layout = useLayout();

      useEffect(() => {
        const root = render(el, { layout });
        return () => teardown(root); // MUST unmount on cleanup
      }, [layout]);
    },
  };
}
```

**Critical rules:**

1. Always call `root.unmount()` in the `useEffect` cleanup. Failing to do so leaks React trees and causes React warnings about updates on unmounted components.
2. Pass `layout` (and `theme`, `rect`, etc.) as props to the React tree — do **not** call nebula hooks inside React components.
3. For printing/snapshot support, either keep rendering synchronous, or wrap async operations in `usePromise` (nebula side) rather than `useEffect`-then-setState chains.

---

## Property Panel (ext.js)

The `ext` export defines the Qlik Sense property panel. It is evaluated outside `component()`, so nebula hooks are **not** available here. Use `galaxy` for environment access.

### Structure

```js
export default function ext(galaxy) {
  return {
    definition: {
      type: 'items',
      component: 'accordion',
      items: {
        // Built-in sections (reuse with `uses`)
        data: { uses: 'data' }, // dimension/measure pickers
        sorting: { uses: 'sorting' }, // sort order
        settings: { uses: 'settings' }, // title, subtitle, footnote

        // Custom accordion section
        appearance: {
          component: 'expandable-items',
          label: 'Appearance',
          items: {
            colorSection: {
              type: 'items',
              label: 'Colors',
              items: {
                myColor: {
                  ref: 'props.color', // path in layout
                  label: 'Bar color',
                  component: 'color-picker',
                  defaultValue: { color: '#1a73e8' },
                },
                showLabels: {
                  ref: 'props.showLabels',
                  label: 'Show labels',
                  type: 'boolean',
                  component: 'switch', // toggle switch
                  defaultValue: true,
                },
              },
            },
          },
        },
      },
    },
    // Optional: Qlik Sense export support
    support: {
      export: true,
      exportData: true,
    },
  };
}
```

### Available UI components

| `component` value | Input type          | Notes                                                                                             |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| _(omitted)_       | Text box            | Default for `type: 'string'` or `'integer'`                                                       |
| `'switch'`        | Boolean toggle      | Use with `type: 'boolean'`                                                                        |
| `'checkbox'`      | Boolean checkbox    | Use with `type: 'boolean'`                                                                        |
| `'radiobuttons'`  | Enum picker         | Requires `options: [{ value, label }]`                                                            |
| `'dropdown'`      | Enum dropdown       | Requires `options: [{ value, label }]`                                                            |
| `'slider'`        | Number slider       | Requires `min`, `max`, `step`                                                                     |
| `'range-slider'`  | Range (two handles) | Requires `min`, `max`, `step`; value is `[low, high]`                                             |
| `'color-picker'`  | Qlik color picker   | Value is `{ index?: number, color?: string }` — use `theme.getColorPickerColor(value)` to resolve |
| `'textarea'`      | Multi-line text     | Add `maxlength` for limit                                                                         |
| `'link'`          | Clickable link      | Use `url` property                                                                                |
| `'text'`          | Read-only label     | Informational, not a real input                                                                   |
| `'media'`         | Image selector      | Reference to a media library item                                                                 |
| `'button-group'`  | Segmented button    | Requires `options` array                                                                          |

### Reading property values in `component()`

Values are stored on `layout` at the path defined by `ref`:

```js
// ext.js — ref: 'props.color'
// In component():
const layout = useLayout();
const colorVal = layout.props?.color ?? { color: '#1a73e8' };
const cssColor = theme.getColorPickerColor(colorVal);
```

**Always prefix custom `ref` paths** (e.g. `props.*`) to avoid name collisions with QIX built-in properties.

### Conditional visibility

```js
{
  ref: 'props.labelSize',
  label: 'Label size',
  type: 'integer',
  show(layout) {
    return layout.props?.showLabels === true;
  },
}
```

### Using `galaxy` in ext

```js
export default function ext(galaxy) {
  const { anything } = galaxy;
  const inSense = !!anything?.sense;

  return {
    definition: {
      // ...
      items: {
        senseOnlyPanel: {
          component: 'expandable-items',
          label: 'Sense options',
          show: inSense, // hide section when outside Sense
          items: {
            /* ... */
          },
        },
      },
    },
  };
}
```

---

## Data Configuration

### `src/data.js`

```js
export default {
  targets: [
    {
      path: '/qHyperCubeDef', // must match object-properties key
      dimensions: { min: 1, max: 2 },
      measures: { min: 1, max: 5 },
    },
  ],
};
```

### `src/object-properties.js`

```js
export default {
  qHyperCubeDef: {
    qInitialDataFetch: [{ qWidth: 6, qHeight: 1000 }],
  },
};
```

**Accessing data in component:**

```js
const layout = useLayout();
const hc = layout.qHyperCube;
const headers = [...hc.qDimensionInfo, ...hc.qMeasureInfo].map((f) => f.qFallbackTitle);
const rows = hc.qDataPages[0]?.qMatrix ?? [];
```

---

## Printing / Snapshot Support

Nebula uses a chain-of-promises mechanism to decide when a chart is "done" rendering for snapshot export. A chart is considered done when:

1. All pending `usePromise` promises have settled.
2. All `useEffect` callbacks have run.
3. No micro/macro tasks are pending in the hooks chain.

**Checklist for print-safe charts:**

- Wrap async data fetches in `usePromise`, not bare `useEffect`.
- If using React, ensure `root.render(...)` is synchronous (React 18's `createRoot` flushes synchronously in the same tick for non-concurrent renders when called from outside a React event).
- Avoid `setTimeout` / `requestAnimationFrame` for anything that changes visible output.
- If a `useEffect` does something visual asynchronously, move the async part to `usePromise`.

---

## Fixture Testing (Engine-Free Development)

Use fixture files for deterministic chart testing without depending on a live engine.

### Setup

Store fixtures in:

```
test/integration/component/
```

Use `.fix.js` file names, for example:

```
scenario-1.fix.js
```

### Run Command

Start the dev server with fixture discovery:

```bash
nebula serve --fixturePath test/integration/component
```

### Render URL Pattern

Open the render route with a fixture query:

```text
http://localhost:8000/render/?fixture=scenario-1.fix.js
```

Important:

- Use `/render/` route (not root).
- Include full fixture filename with `.fix.js`.

### Minimal Fixture Shape

A fixture should export a default function that returns:

- `type` — chart type name
- `genericObjects` — array of object definitions
- `getLayout()` — function returning `qHyperCube` with:
  - `qDimensionInfo` — dimension metadata
  - `qMeasureInfo` — measure metadata
  - `qDataPages[0].qMatrix` — table data
- optional `getEffectiveProperties()` — property defaults

### Debug Tips

- Keep fixture matrices intentionally small while debugging interactions.
- Add explicit `qElemNumber` and `qState` values to verify selection behavior.
- Use multiple fixtures (baseline, empty, null-values, selection-states) to cover edge cases.

---

## Security & DOM Rules

**Never:**

- Modify DOM elements outside `element` (the container passed by `useElement()`).
- Inject CSS into `document.head` or `<style>` tags without a chart-specific class/attribute prefix (e.g. `[data-chart-id="my-chart-v2"]`). Global unscoped CSS breaks other charts on the same page.
- Use internal nebula APIs (anything that is not in [stardust API docs](https://qlik.dev/apis/javascript/nebulajs-stardust/)).
- Access `window.__nebula*` or internal React/Picasso internals.

**Always:**

- Scope CSS selectors to a class or attribute unique to your chart.
- Remove all event listeners in `useEffect` cleanup functions.
- Call `root.unmount()` / `instance.destroy()` in cleanup when managing React trees or third-party renderers.

---

## Common Patterns & Pitfalls

### Picasso.js chart (with resize)

See [commands/create/templates/sn/picasso/common/src/index.js](../../../commands/create/templates/sn/picasso/common/src/index.js) for the canonical pattern:

```js
const [instance, setInstance] = useState();

// Create once
useEffect(() => {
  const p = picasso.chart({ element, data: [], settings: {} });
  setInstance(p);
  return () => p.destroy();
}, []);

// Update on data/layout change
useEffect(() => {
  if (!instance) return;
  instance.update({ data: [...], settings: definition({ layout }) });
}, [layout, instance]);

// Update on resize
useEffect(() => {
  if (!instance) return;
  instance.update();
}, [rect.width, rect.height, instance]);
```

### Hook order error

If you see `"Detected a change in the order of hooks called"` in dev mode, you likely added a hook inside a conditional. Move all hook calls unconditionally to the top of `component()`.

### `usePromise` with no-data guard

```js
const [data, err] = usePromise(async () => {
  const pages = layout?.qHyperCube?.qDataPages;
  if (!pages?.[0]?.qMatrix?.length) throw new Error('no-data');
  return processData(pages[0].qMatrix);
}, [layout]);

useEffect(() => {
  if (!data) {
    element.innerHTML = '<p class="my-chart__empty">No data to display</p>';
    return;
  }
  renderChart(element, data);
}, [data, element]);
```

### Theme-reactive rendering

```js
const theme = useTheme();
const layout = useLayout();

useEffect(() => {
  const bg = theme.getStyle('object', '', 'backgroundColor') ?? '#fff';
  const text = theme.getContrastingColorTo(bg);
  element.style.cssText = `background:${bg};color:${text}`;
  renderAll(element, layout, theme);
}, [theme, layout, element]); // include theme in deps!
```

### Local Interaction Feedback With `useStaleLayout`

When using `useStaleLayout`, layout updates are delayed until selections confirm. Local interaction feedback (hover highlights, click feedback) must be handled client-side before layout arrives.

**Recommended pattern:**

1. Maintain transient interaction state locally (selected marks, active categories, hovered ids).
2. Emit transient state changes immediately on user interaction.
3. Pass transient state into chart settings/rendering options.
4. Trigger lightweight chart updates when transient state changes.
5. Use renderer logic to visualize transient state (highlight selected, dim non-selected).

**Architecture:**

- **Interaction glue layer**: Translate DOM/chart interaction events into transient state + selection actions.
- **Supernova component layer**: Hold transient state in hook state; pass into rendering; separate layout-driven from transient-only updates.
- **Renderer layer**: Read transient state from options; apply deterministic visual rules.

**QIX Selection Guidance:**

- For value brushing, use q field paths (e.g. `qHyperCube/qDimensionInfo/0`), not grouping tokens.
- Ensure selection mode is active before sending `select()` calls.
- If helper-based selection is unstable, call QIX methods directly via `selections.select({ method, params })`.

**Common Regressions:**

- Mixing transient-state dependencies into main layout/data effects.
- Triggering full chart updates for transient visual changes.
- Emitting transient updates before selection actions complete.

**Mitigation:**

- Keep two separate effect flows:
  - Flow A: layout/data-driven updates.
  - Flow B: transient settings-only updates.
- In event handlers, perform selection action first, then update transient visuals.
- Use minimal diagnostics around selection calls and listener lifecycle.
