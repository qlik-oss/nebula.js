/* eslint no-underscore-dangle: 0 */
/* eslint import/no-unresolved: 0 */
/* eslint import/extensions: 0 */

// Sense dependencies
import qlik from 'qlik';
import senseTranslator from 'translator';

// injected
import snDefinition from '__SN_DEF__';
import extDefinition from '__EXT_DEF__';

// lib dependencies
import { __DO_NOT_USE__ } from './nlib/@nebula.js/stardust/dist/stardust';

// wrapper code
import permissions from './permissions';
import selectionsApi from './selections';

const { generator: supernova, theme: themeFn, locale: localeFn } = __DO_NOT_USE__;

// ------- locale ---------
// use nebula locale API to ensure all viz get the same API regardless
// if consumed in Sense or outside
const loc = localeFn({
  initial: senseTranslator.language,
});
const translator = {
  ...loc.translator,
  // wrap get() for this API in order to prefer strings provided by Sense
  get(str, args) {
    const s = senseTranslator.get(str, args);
    if (s === str) {
      return loc.translator.get(str, args);
    }
    return s;
  },
};
// ------------------------

// Galaxy is usually provided by @nebula.js/nucleus when a viz is instantiated.
// Since nucleus is not being used in Sense yet, this interface MUST be provided explicitly here
// and it MUST have the same interface as the one provided by nucleus.
const galaxy = {
  deviceType: 'auto',
  translator,
  flags: {
    isEnabled: () => false,
  },
  anything: {},
};

const ALLOWED_OPTIONS = ['viewState', 'direction', 'renderer'];
function limitOptions(newOptions, oldOptions) {
  const op = {};
  let opChanged = false;
  Object.keys(newOptions).forEach((key) => {
    if (ALLOWED_OPTIONS.indexOf(key) === -1) {
      return;
    }
    op[key] = newOptions[key];
    if (oldOptions[key] !== newOptions[key]) {
      opChanged = true;
    }
  });
  if (opChanged) {
    return op;
  }
  return oldOptions;
}

function createActions(actions) {
  return actions.map((a) => {
    const senseItem = {
      isIcon: true,
      buttonClass: 'sel-toolbar-icon-toggle',
      isActive() {
        return a.active;
      },
      isDisabled() {
        return a.disabled;
      },
      action() {
        a.action();
      },
      getSvgIcon() {
        const icon = a.getSvgIconShape();
        const { viewBox = '0 0 16 16' } = icon;
        const shapes = icon.shapes
          .map(
            ({ type, attrs }) =>
              `<${type} ${Object.keys(attrs)
                .map((k) => `${k}="${attrs[k]}"`)
                .join(' ')}/>`
          )
          .join('');
        return `<i style="display:inline-block;font-style:normal;line-height:0;text-align:center;text-transform:none;vertical-align:-.2em;text-rendering:optimizeLegibility;web-kit-font-smoothing:antialiased;moz-osx-font-smoothing:grayscale"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="${viewBox}" fill="currentColor">${shapes}</svg></i>`;
      },
    };
    Object.defineProperties(senseItem, {
      name: {
        get: () => a.label,
      },
      hidden: {
        get: () => a.hidden,
      },
    });
    return senseItem;
  });
}

function updateTheme(ref) {
  return qlik
    .currApp(ref)
    .theme.getApplied()
    .then((qTheme) => {
      if (ref.nTheme.externalAPI.name() !== qTheme.id) {
        ref.nTheme.internalAPI.setTheme(qTheme.properties, qTheme.id);
      }
    });
}

// ============= EXTENSON =====================================================

const snGenerator = supernova(snDefinition, galaxy);
const ext = extDefinition || {};
let data;

if (snGenerator.qae.data.targets[0]) {
  const d = snGenerator.qae.data.targets[0];
  // supernova uses the convention of 'added' instead of 'add' since the
  // method is called after the dimension/measures has been added to the hypercube.
  // we therefore need to map supernova callbacks to the ones supported in Sense
  const map = (v) => ({
    ...v,
    add: v.added,
    remove: v.removed,
    replace: v.replaced,
    move: v.moved,
  });

  data = {};
  if (d.dimensions) {
    data.dimensions = map(d.dimensions);
  }
  if (d.measures) {
    data.measures = map(d.measures);
  }
}

const X = {
  // overridable properties
  definition: {
    type: 'items',
    component: 'accordion',
    items: {
      data: data
        ? {
            uses: 'data',
          }
        : undefined,
      sorting: data
        ? {
            uses: 'sorting',
          }
        : undefined,
      settings: {
        uses: 'settings',
      },
    },
  },
  data,
  // -- defaults for the following are injected in default-extension.js --
  // support
  // importProperties,
  // exportProperties,
  // ----
  getSelectionToolbar() {
    return [
      ...this.senseItems,
      {
        name: 'Tooltip.clearSelection',
        tid: 'selection-toolbar.clear',
        isIcon: true,
        buttonClass: 'clear',
        iconClass: 'lui-icon lui-icon--clear-selections',
        action: function action() {
          this.selectionsApi.clear();
        },
        isDisabled: function isDisabled() {
          return !this.selectionsApi.selectionsMade;
        },
      },
    ];
  },
  // override with user config
  ...ext,

  // =============================================
  // non-overridable properties
  initialProperties: snGenerator.qae.properties.initial,
  template: '<div style="height: 100%;position: relative"></div>',
  mounted($element) {
    const element = $element[0].children[0];
    const selectionAPI = selectionsApi(this.$scope);
    const sn = snGenerator.create({
      model: this.backendApi.model,
      app: this.backendApi.model.session.app,
      selections: selectionAPI,
      explicitResize: true,
    });
    this.sn = sn;
    this.snComponent = sn.component;
    this.snComponent.created();
    this.snComponent.mounted(element);
    this.senseItems = [];
    const { senseItems } = this;
    this.snComponent.observeActions((actions) => {
      senseItems.length = 0;
      senseItems.push(...createActions(actions));
      this.$scope.selectionsApi.refreshToolbar();
    });

    this.nTheme = themeFn();

    this.initiatedTheme = updateTheme(this);
  },
  suppressOnPaint: () => false,
  paint() {
    const perms = permissions(this.options, this.backendApi);
    const constraints = {
      passive: perms.indexOf('passive') === -1 || undefined,
      active: perms.indexOf('interact') === -1 || undefined,
      select: perms.indexOf('select') === -1 || undefined,
    };
    const opts = limitOptions(this.options, this.snComponent.context.options);
    this._pureLayout = this.backendApi.model.pureLayout || this.backendApi.model.layout;
    return this.initiatedTheme.then(() => {
      updateTheme(this);
      return this.snComponent.render({
        layout: this.backendApi.model.pureLayout || this.backendApi.model.layout,
        context: {
          appLayout: {
            qLocaleInfo: this.backendApi.localeInfo,
          },
          constraints,
          theme: this.nTheme.externalAPI,
        },
        options: opts,
      });
    });
  },
  resize() {
    if (this._pureLayout !== this.backendApi.model.pureLayout) {
      return this.paint();
    }
    const opts = limitOptions(this.options, this.snComponent.context.options);
    this.snComponent.context.options = opts;
    return this.snComponent.resize();
  },
  setInteractionState() {
    this.paint();
  },
  setSnapshotData(layout) {
    return this.snComponent.setSnapshotData(layout);
  },
  getViewState() {
    const ref = this.snComponent.getImperativeHandle();
    if (ref && typeof ref.getViewState === 'function') {
      return ref.getViewState();
    }
    return undefined;
  },
  destroy() {
    this.sn.destroy();
    if (this.snComponent) {
      this.snComponent.willUnmount();
      this.snComponent.destroy();
    }
  },
};

export { X as default };
