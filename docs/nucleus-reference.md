---
id: nucleus-reference
title: API Reference
---

## Table of contents

- [function: nucleus(app[, instanceConfig])](#function-nucleusapp-instanceconfig)
  - [nucleus.createConfiguration(configuration)](#nucleuscreateconfigurationconfiguration)
- [class: AppSelections](#class-appselections)
  - [appSelections.mount(element)](#appselectionsmountelement)
  - [appSelections.unmount()](#appselectionsunmount)
- [interface: BaseConfig](#interface-baseconfig)
- [interface: Configuration](#interface-configuration)
- [interface: Context](#interface-context)
- [interface: CreateConfig](#interface-createconfig)
- [type `Field`= <[string]|`qae.NxDimension`|`qae.NxMeasure`|[LibraryField]>](#type-field-stringqaenxdimensionqaenxmeasurelibraryfield)
- [interface: GetConfig](#interface-getconfig)
- [interface: LibraryField](#interface-libraryfield)
- [interface: LoadType(type, env)](#interface-loadtypetype-env)
- [class: Nucleus](#class-nucleus)
  - [nucleus.context(ctx)](#nucleuscontextctx)
  - [nucleus.render(cfg)](#nucleusrendercfg)
  - [nucleus.selections()](#nucleusselections)
- [class: SupernovaController](#class-supernovacontroller)
  - [supernovaController.destroy()](#supernovacontrollerdestroy)
- [interface: ThemeInfo](#interface-themeinfo)
- [interface: TypeInfo](#interface-typeinfo)

## API

### function: nucleus(app[, instanceConfig])

- `app` <`enigma.Doc`>
- `instanceConfig` <[Configuration]>
- `returns:` <[Nucleus]>

Initiates a new `Nucleus` instance using the specified `app`.

```js
import nucleus from '@nebula.js/nucleus';
const n = nucleus(app);
n.render({ id: 'abc' });
```

#### nucleus.createConfiguration(configuration)

- `configuration` <[Configuration]> The configuration object
- `returns:` <[nucleus]>

Creates a new `nucleus` scope bound to the specified `configuration`.

The configuration is merged with all previous scopes.

```js
import nucleus from '@nebula.js/nucleus';
// create a 'master' config which registers all types
const m = nucleus.createConfiguration({
  types: [
    {
      name: 'mekko',
      version: '1.0.0',
      load: () => Promise.resolve(mekko),
    },
  ],
});

// create an alternate config with dark theme
// and inherit the config from the previous
const d = m.createConfiguration({
  theme: 'dark',
});

m(app).render({ type: 'mekko' }); // will render the object with default theme
d(app).render({ type: 'mekko' }); // will render the object with 'dark' theme
nucleus(app).render({ type: 'mekko' }); // will throw error since 'mekko' is not a register type on the default instance
```

### class: AppSelections

#### appSelections.mount(element)

- `element` <`HTMLElement`>

Mounts the app selection UI into the provided HTMLElement

```js
selections.mount(element);
```

#### appSelections.unmount()

Unmounts the app selection UI from the DOM

```js
selections.unmount();
```

### interface: BaseConfig

- `element` <`HTMLElement`>
- `options` <[Object]>

### interface: Configuration

- `context` <[Context]>
- `env` <[Object]>
- `themes` <[Array]<[ThemeInfo]>>
- `types` <[Array]<[TypeInfo]>>

### interface: Context

- `constraints` <[Object]>
  - `active` <[boolean]>
  - `passive` <[boolean]>
  - `select` <[boolean]>
- `language` <[string]> Defaults to `en-US`
- `theme` <[string]> Defaults to `light`

### interface: CreateConfig

- extends: <[BaseConfig]>

* `type` <[string]>
* `version` <[string]>
* `fields` <[Array]<[Field]>>
* `properties` <`qae.GenericObjectProperties`>

### type `Field`= <[string]|`qae.NxDimension`|`qae.NxMeasure`|[LibraryField]>

### interface: GetConfig

- extends: <[BaseConfig]>

* `id` <[string]>

### interface: LibraryField

- `qLibraryId` <[string]>
- `type` <`'dimension'`|`'measure'`>

### interface: LoadType(type, env)

- `type` <[Object]>
  - `name` <[string]>
  - `version` <[string]>
- `env` <[Object]>
- `returns:` <[Promise]<`Supernova`>>

### class: Nucleus

#### nucleus.context(ctx)

- `ctx` <[Context]> The context to update.

Updates the current context of this nucleus instance.
Use this when you want to change some part of the current context, like theme.

```js
// change theme
n.context({ theme: 'dark' });
```

```js
// limit constraints
n.context({ constraints: { active: true } });
```

#### nucleus.render(cfg)

- `cfg` <[CreateConfig]|[GetConfig]> The render configuration.
- `returns:` <[Promise]<[SupernovaController]>> A controller to the rendered supernova

Renders a supernova into an HTMLElement.

```js
// render from existing object
n.render({
  element: el,
  id: 'abcdef',
});
```

```js
// render on the fly
n.render({
  type: 'barchart',
  fields: ['Product', { qLibraryId: 'u378hn', type: 'measure' }],
});
```

#### nucleus.selections()

- `returns:` <[Promise]<[AppSelections]>>

Gets the app selections of this instance.

```js
const selections = await n.selections();
selections.mount(element);
```

### class: SupernovaController

A controller to further modify a supernova after it has been rendered.

```js
const ctl = await nucleus(app).render({
  element,
  type: 'barchart',
});
ctl.destroy();
```

#### supernovaController.destroy()

Destroys the supernova and removes if from the the DOM.

```js
const ctl = ctl.destroy();
```

### interface: ThemeInfo

- `id` <[string]> Theme identifier
- `load` <[Function]> A function that should return a Promise that resolve to a raw JSON theme

### interface: TypeInfo

- `load` <[LoadType]>
- `name` <[string]>
- `version` <[string]>
- `meta` <[Object]>

[enigma.doc]: undefined
[htmlelement]: undefined
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[qae.genericobjectproperties]: undefined
[qae.nxdimension]: undefined
[qae.nxmeasure]: undefined
[supernova]: undefined
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[nucleus]: #function-nucleusapp-instanceconfig
[appselections]: #class-appselections
[baseconfig]: #interface-baseconfig
[configuration]: #interface-configuration
[context]: #interface-context
[createconfig]: #interface-createconfig
[field]: #type-field-stringqaenxdimensionqaenxmeasurelibraryfield
[getconfig]: #interface-getconfig
[libraryfield]: #interface-libraryfield
[loadtype]: #interface-loadtypetype-env
[nucleus]: #class-nucleus
[supernovacontroller]: #class-supernovacontroller
[themeinfo]: #interface-themeinfo
[typeinfo]: #interface-typeinfo
