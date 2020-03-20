# @nebula.js/supernova

> version: 0.2.0

## Table of contents

- [function: useState(initialState)](#function-usestateinitialstate)
- [function: useEffect(effect[, deps])](#function-useeffecteffect-deps)
- [function: useMemo(factory, deps)](#function-usememofactory-deps)
- [function: usePromise(factory[, deps])](#function-usepromisefactory-deps)
- [function: useElement()](#function-useelement)
- [function: useRect()](#function-userect)
- [function: useLayout()](#function-uselayout)
- [function: useStaleLayout()](#function-usestalelayout)
- [function: useAppLayout()](#function-useapplayout)
- [function: useModel()](#function-usemodel)
- [function: useApp()](#function-useapp)
- [function: useGlobal()](#function-useglobal)
- [function: useSelections()](#function-useselections)
- [function: useTheme()](#function-usetheme)
- [function: useTranslator()](#function-usetranslator)
- [function: useAction(factory[, deps])](#function-useactionfactory-deps)
- [function: useConstraints()](#function-useconstraints)
- [function: useOptions()](#function-useoptions)
- [function: onTakeSnapshot(snapshotCallback)](#function-ontakesnapshotsnapshotcallback)
- [interface: Supernova([env])](#interface-supernovaenv)
- [interface: SupernovaDefinition](#interface-supernovadefinition)
- [interface: SetStateFn(newState)](#interface-setstatefnnewstate)
- [type EffectCallback = <[Function]>](#type-effectcallback-function)
- [interface: Rect](#interface-rect)
- [interface: ActionDefinition](#interface-actiondefinition)
- [interface: Constraints](#interface-constraints)
- [interface: QAEDefinition](#interface-qaedefinition)
- [interface: DataTarget](#interface-datatarget)
- [interface: FieldTarget](#interface-fieldtarget)
- [class: ObjectSelections](#class-objectselections)
  - [objectSelections.begin(paths)](#objectselectionsbeginpaths)
  - [objectSelections.clear()](#objectselectionsclear)
  - [objectSelections.confirm()](#objectselectionsconfirm)
  - [objectSelections.cancel()](#objectselectionscancel)
  - [objectSelections.select(s)](#objectselectionsselects)
  - [objectSelections.canClear()](#objectselectionscanclear)
  - [objectSelections.canConfirm()](#objectselectionscanconfirm)
  - [objectSelections.canCancel()](#objectselectionscancancel)
  - [objectSelections.isActive()](#objectselectionsisactive)
  - [objectSelections.isModal()](#objectselectionsismodal)
  - [objectSelections.goModal(paths)](#objectselectionsgomodalpaths)
  - [objectSelections.noModal([accept])](#objectselectionsnomodalaccept)
  - [objectSelections.abortModal()](#objectselectionsabortmodal)
- [class: Translator](#class-translator)
  - [translator.add(item)](#translatoradditem)
  - [translator.get(str[, args])](#translatorgetstr-args)
- [class: Theme](#class-theme)
  - [theme.getDataColorScales()](#themegetdatacolorscales)
  - [theme.getDataColorPalettes()](#themegetdatacolorpalettes)
  - [theme.getDataColorPickerPalettes()](#themegetdatacolorpickerpalettes)
  - [theme.getDataColorSpecials()](#themegetdatacolorspecials)
  - [theme.getColorPickerColor(c)](#themegetcolorpickercolorc)
  - [theme.getContrastingColorTo(color)](#themegetcontrastingcolortocolor)
  - [theme.getStyle(basePath, path, attribute)](#themegetstylebasepath-path-attribute)
  - [interface: ScalePalette](#interface-scalepalette)
  - [interface: DataPalette](#interface-datapalette)
  - [interface: ColorPickerPalette](#interface-colorpickerpalette)
  - [interface: DataColorSpecials](#interface-datacolorspecials)

## API

### function: useState(initialState)

- `initialState` <`S`|[Function]> The initial state.
- `returns:` <[Array]> The value and a function to update it.

Creates a stateful value.

```js
import { useState } from '@nebula.js/supernova';
// ...
// initiate with simple primitive value
const [zoomed, setZoomed] = useState(false);

// update
setZoomed(true);

// lazy initiation
const [value, setValue] = useState(() => heavy());
```

### function: useEffect(effect[, deps])

- `effect` <[EffectCallback]> The callback.
- `deps` <[Array]<`any`>> The dependencies which should trigger the callback.

Triggers a callback function when a dependant value changes.

```js
import { useEffect } from '@nebula.js/supernova';
// ...
useEffect(() => {
  console.log('mounted');
  return () => {
    console.log('unmounted');
  };
}, []);
```

### function: useMemo(factory, deps)

- `factory` <[Function]> The factory function.
- `deps` <[Array]<`any`>> The dependencies.
- `returns:` <`T`> The value returned from the factory function.

Creates a stateful value when a dependant changes.

```js
import { useMemo } from '@nebula.js/supernova';
// ...
const v = useMemo(() => {
  return doSomeHeavyCalculation();
}), []);
```

### function: usePromise(factory[, deps])

- `factory` <[Function]> The factory function that calls the promise.
- `deps` <[Array]<`any`>> The dependencies.
- `returns:` <[Array]> The resolved value.

Runs a callback function when a dependant changes.

```js
import { usePromise } from '@nebula.js/supernova';
import { useModel } from '@nebula.js/supernova';
// ...
const model = useModel();
const [resolved, rejected] = usePromise(() => model.getLayout(), []);
```

### function: useElement()

- `returns:` <`HTMLElement`>

Gets the HTMLElement this supernova is rendered into.

```js
import { useElement } from '@nebula.js/supernova';
// ...
const el = useElement();
el.innerHTML = 'Hello!';
```

### function: useRect()

- `returns:` <[Rect]> The size of the element.

Gets the size of the HTMLElement the supernova is rendered into.

```js
import { useRect } from '@nebula.js/supernova';
// ...
const rect = useRect();
useEffect(() => {
  console.log('resize');
}, [rect.width, rect.height]);
```

### function: useLayout()

- `returns:` <[qae.GenericObjectLayout]>

Gets the layout of the generic object associated with this supernova.

```js
import { useLayout } from '@nebula.js/supernova';
// ...
const layout = useLayout();
console.log(layout);
```

### function: useStaleLayout()

- `returns:` <[qae.GenericObjectLayout]>

Gets the layout of the generic object associated with this supernova.

Unlike the regular layout, a _stale_ layout is not changed when a generic object enters
the modal state. This is mostly notable in that `qSelectionInfo.qInSelections` in the layout is
always `false`.
The returned value from `useStaleLayout()` and `useLayout()` are identical when the object
is not in a modal state.

```js
import { useStaleLayout } from '@nebula.js/supernova';
// ...
const staleLayout = useStaleLayout();
console.log(staleLayout);
```

### function: useAppLayout()

- `returns:` <[qae.NxAppLayout]> The app layout

Gets the layout of the app associated with this supernova.

```js
import { useAppLayout } from '@nebula.js/supernova';
// ...
const appLayout = useAppLayout();
console.log(appLayout.qLocaleInfo);
```

### function: useModel()

- `returns:` <`enigma.GenericObject`|[undefined]>

Gets the generic object API of the generic object connected to this supernova.

```js
import { useModel } from '@nebula.js/supernova';
// ...
const model = useModel();
useEffect(() => {
  model.getInfo().then(info => {
    console.log(info);
  });
}, []);
```

### function: useApp()

- `returns:` <`enigma.Doc`|[undefined]> The doc API.

Gets the doc API.

```js
import { useApp } from '@nebula.js/supernova';
// ...
const app = useApp();
useEffect(() => {
  app.getAllInfos().then(infos => {
    console.log(infos);
  });
}, []);
```

### function: useGlobal()

- `returns:` <`enigma.Global`|[undefined]> The global API.

Gets the global API.

```js
import { useGlobal } from '@nebula.js/supernova';

// ...
const g = useGlobal();
useEffect(() => {
  g.engineVersion().then(version => {
    console.log(version);
  });
}, []);
```

### function: useSelections()

- `returns:` <[ObjectSelections]> The object selections.

Gets the object selections.

```js
import { useSelections } from '@nebula.js/supernova';
import { useElement } from '@nebula.js/supernova';
import { useEffect } from '@nebula.js/supernova';
// ...
const selections = useSelections();
const element = useElement();
useEffect(() => {
  const onClick = () => {
    selections.begin('/qHyperCubeDef');
  };
  element.addEventListener('click', onClick);
  return () => {
    element.removeEventListener('click', onClick);
  };
}, []);
```

### function: useTheme()

- `returns:` <[Theme]> The theme.

Gets the theme.

```js
import { useTheme } from '@nebula.js/supernova';

const theme = useTheme();
console.log(theme.getContrastinColorTo('#ff0000'));
```

### function: useTranslator()

- `returns:` <[Translator]> The translator.

Gets the translator.

```js
import { useTranslator } from '@nebula.js/supernova';
// ...
const translator = useTranslator();
console.log(translator.get('SomeString'));
```

### function: useAction(factory[, deps])

- `factory` <[Function]>
- `deps` <[Array]<`any`>>
- `returns:` <`A`>

Registers a custom action.

```js
import { useAction } from '@nebula.js/supernova';
// ...
const [zoomed, setZoomed] = useState(false);
const act = useAction(
  () => ({
    hidden: false,
    disabled: zoomed,
    action() {
      setZoomed(prev => !prev);
    },
    icon: {},
  }),
  [zoomed]
);
```

### function: useConstraints()

- `returns:` <[Constraints]>

Gets the desired constraints that should be applied when rendering the supernova.

The constraints are set on the nuclues configuration before the supernova is rendered
and should respected by you when implementing the supernova.

```js
// configure nucleus to disallow active interactions when rendering
nucleus(app, {
  constraints: {
    active: true, // do not allow interactions
  },
}).render({ element, id: 'sdfsdf' });
```

```js
import { useConstraints } from '@nebula.js/supernova';
// ...
const constraints = useConstraints();
useEffect(() => {
  if (constraints.active) {
    // do not add any event listener if active constraint is set
    return undefined;
  }
  const listener = () => {};
  element.addEventListener('click', listener);
  return () => {
    element.removeEventListener('click', listener);
  };
}, [constraints]);
```

### function: useOptions()

- `returns:` <[Object]>

Gets the options object provided when rendering the supernova.

This is an empty object by default but enables customization of the supernova through this object.
Options are different from setting properties on the generic object in that options
are only temporary settings applied to the supernova when rendered.

You have the responsibility to provide documentation of the options you support, if any.

```js
// when rendering the supernova with nucleus, anything can be set in options
nucleus(app).render({
  element,
  type: 'my-chart',
  options: {
    showNavigation: true,
  },
});
```

```js
// it is up to you use and implement the provided options
import { useOptions } from '@nebula.js/supernova';
import { useEffect } from '@nebula.js/supernova';
// ...
const options = useOptions();
useEffect(() => {
  if (!options.showNavigation) {
    // hide navigation
  } else {
    // show navigation
  }
}, [options.showNavigation]);
```

### function: onTakeSnapshot(snapshotCallback)

- `snapshotCallback` <[Function]>

Registers a callback that is called when a snapshot is taken.

```js
import { onTakeSnapshot } from '@nebula.js/supernova';
import { useState } from '@nebula.js/supernova';
import { useLayout } from '@nebula.js/supernova';

const layout = useLayout();
const [zoomed] = useState(layout.isZoomed || false);

onTakeSnapshot(copyOfLayout => {
  copyOfLayout.isZoomed = zoomed;
  return Promise.resolve(copyOfLayout);
});
```

### interface: Supernova([env])

- `env` <[Object]>
- `returns:` <[SupernovaDefinition]>

The entry point for defining a supernova.

```js
import { useElement, useLayout } from '@nebula.js/supernova';

export default function() {
  return {
    qae: {
      properties: {
        dude: 'Heisenberg',
      },
    },
    component() {
      const el = useElement();
      const layout = useLayout();
      el.innerHTML = `What's my name? ${layout.dude}!!!`;
    },
  };
}
```

### interface: SupernovaDefinition

- `qae` <[QAEDefinition]>
- `component` <[Function]>

### interface: SetStateFn(newState)

- `newState` <`S`|[Function]> The new state

### type EffectCallback = <[Function]>

### interface: Rect

- `top` <[number]>
- `left` <[number]>
- `width` <[number]>
- `height` <[number]>

### interface: ActionDefinition

- `action` <`A`>
- `hidden` <[boolean]>
- `disabled` <[boolean]>
- `icon` <[Object]>
  - `viewBox` <[string]> Defaults to `"0 0 16 16"`
  - `shapes` <[Array]<[Object]>>

### interface: Constraints

- `passive` <[boolean]>
- `active` <[boolean]>
- `select` <[boolean]>

### interface: QAEDefinition

- `properties` <[qae.GenericObjectProperties]>
- `data` <[Object]>
  - `targets` <[Array]<[DataTarget]>>

### interface: DataTarget

- `path` <[string]>
- `dimensions` <[FieldTarget]<[qae.NxDimension]>>
- `measures` <[FieldTarget]<[qae.NxMeasure]>>

### interface: FieldTarget

- `min` <[Function]>
- `max` <[Function]>
- `added` <[Function]>
- `removed` <[Function]>

### class: ObjectSelections

#### objectSelections.begin(paths)

- `paths` <[Array]<[string]>>
- `returns:` <[Promise]<[undefined]>>

#### objectSelections.clear()

- `returns:` <[Promise]<[undefined]>>

#### objectSelections.confirm()

- `returns:` <[Promise]<[undefined]>>

#### objectSelections.cancel()

- `returns:` <[Promise]<[undefined]>>

#### objectSelections.select(s)

- `s` <[Object]>
  - `method` <[string]>
  - `params` <[Array]<`any`>>
- `returns:` <[Promise]<[boolean]>>

#### objectSelections.canClear()

- `returns:` <[boolean]>

#### objectSelections.canConfirm()

- `returns:` <[boolean]>

#### objectSelections.canCancel()

- `returns:` <[boolean]>

#### objectSelections.isActive()

- `returns:` <[boolean]>

#### objectSelections.isModal()

- `returns:` <[boolean]>

#### objectSelections.goModal(paths)

- `paths` <[Array]<[string]>>
- `returns:` <[Promise]<[undefined]>>

#### objectSelections.noModal([accept])

- `accept` <[boolean]>
- `returns:` <[Promise]<[undefined]>>

#### objectSelections.abortModal()

- `returns:` <[Promise]<[undefined]>>

### class: Translator

#### translator.add(item)

- `item` <[Object]>
  - `id` <[string]>
  - `locale` <[Object]<[string],[string]>>

Registers a string in multiple locales

```js
translator.add({
  id: 'company.hello_user',
  locale: {
    'en-US': 'Hello {0}',
    'sv-SE': 'Hej {0}
  }
});
translator.get('company.hello_user', ['John']); // Hello John
```

#### translator.get(str[, args])

- `str` <[string]> Id of the registered string
- `args` <[Array]<[string]>> Values passed down for string interpolation
- `returns:` <[string]> The translated string

Translates a string for current locale

### class: Theme

#### theme.getDataColorScales()

- `returns:` <[Array]<[ScalePalette]>>

#### theme.getDataColorPalettes()

- `returns:` <[Array]<[DataPalette]>>

#### theme.getDataColorPickerPalettes()

- `returns:` <[Array]<[ColorPickerPalette]>>

#### theme.getDataColorSpecials()

- `returns:` <[DataColorSpecials]>

#### theme.getColorPickerColor(c)

- `c` <[Object]>
  - `index` <[number]>
  - `color` <[string]>
- `returns:` <[string]> The resolved color.

Resolve a color object using the color picker palette from the provided JSON theme.

```js
theme.getColorPickerColor({ index: 1 });
theme.getColorPickerColor({ color: 'red' });
```

#### theme.getContrastingColorTo(color)

- `color` <[string]> A color to measure the contrast against
- `returns:` <[string]> - The color that has the best contrast against the specified `color`.

Get the best contrasting color against the specified `color`.
This is typically used to find a suitable text color for a label placed on an arbitrarily colored background.

The returned colors are derived from the theme.

```js
theme.getContrastingColorTo('#400');
```

#### theme.getStyle(basePath, path, attribute)

- `basePath` <[string]> Base path in the theme's json structure to start the search in (specified as a name path separated by dots)
- `path` <[string]> Expected path for the attribute (specified as a name path separated by dots)
- `attribute` <[string]> Name of the style attribute
- `returns:` <[string]> The style value

Get the value of a style attribute in the theme by searching in the theme's json structure.
The search starts at the specified base path and continue upwards until the value is found.
If possible it will get the attribute's value using the given path.

```js
theme.getStyle('object', 'title.main', 'fontSize'));
theme.getStyle('', '', 'fontSize'));
```

#### interface: ScalePalette

- `key` <[string]>
- `type` <`gradient`|`class`>
- `colors` <[Array]<[string]>>

#### interface: DataPalette

- `key` <[string]>
- `type` <`pyramid`|`row`>
- `colors` <[Array]|[Array]>

#### interface: ColorPickerPalette

- `key` <[string]>
- `colors` <[Array]<[string]>>

#### interface: DataColorSpecials

- `primary` <[string]>
- `nil` <[string]>
- `others` <[string]>

[s]: undefined
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[any]: undefined
[t]: undefined
[htmlelement]: undefined
[qae.genericobjectlayout]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#genericobjectlayout
[qae.nxapplayout]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxapplayout
[enigma.genericobject]: undefined
[undefined]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined
[enigma.doc]: undefined
[enigma.global]: undefined
[a]: undefined
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[qae.genericobjectproperties]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#genericobjectproperties
[qae.nxdimension]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxdimension
[qae.nxmeasure]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxmeasure
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[supernovadefinition]: #interface-supernovadefinition
[effectcallback]: #type-effectcallback-function
[rect]: #interface-rect
[constraints]: #interface-constraints
[qaedefinition]: #interface-qaedefinition
[datatarget]: #interface-datatarget
[fieldtarget]: #interface-fieldtarget
[objectselections]: #class-objectselections
[translator]: #class-translator
[theme]: #class-theme
[scalepalette]: #interface-scalepalette
[datapalette]: #interface-datapalette
[colorpickerpalette]: #interface-colorpickerpalette
[datacolorspecials]: #interface-datacolorspecials
