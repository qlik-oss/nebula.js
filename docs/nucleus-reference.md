---
id: nucleus-reference
title: API Reference
---

## Table of contents

- [interface: nucleus(app[, instanceConfig])](#interface-nucleusapp-instanceconfig)
- [interface: Context](#interface-context)
- [interface: Configuration](#interface-configuration)
- [class: Nucleus](#class-nucleus)
  - [nucleus.render(cfg)](#nucleusrendercfg)
  - [nucleus.context(ctx)](#nucleuscontextctx)
  - [nucleus.selections()](#nucleusselections)
- [interface: ThemeInfo](#interface-themeinfo)
- [class: SupernovaController](#class-supernovacontroller)
  - [supernovaController.destroy()](#supernovacontrollerdestroy)
- [class: AppSelections](#class-appselections)
  - [appSelections.mount(element)](#appselectionsmountelement)
  - [appSelections.unmount()](#appselectionsunmount)
- [interface: CreateConfig](#interface-createconfig)
- [interface: BaseConfig](#interface-baseconfig)
- [interface: GetConfig](#interface-getconfig)
- [type Field = <[string]|[qae.NxDimension]|[qae.NxMeasure]|[LibraryField]>](#type-field-stringqaenxdimensionqaenxmeasurelibraryfield)
- [interface: LibraryField](#interface-libraryfield)
- [interface: LoadType(type, env)](#interface-loadtypetype-env)
- [interface: TypeInfo](#interface-typeinfo)

## API

### interface: nucleus(app[, instanceConfig])

- `app` <`enigma.Doc`>
- `instanceConfig` <[Configuration]>
- `returns:` <[Nucleus]>

Initiates a new `Nucleus` instance using the specified `app`.

```js
import nucleus from '@nebula.js/nucleus';
const n = nucleus(app);
n.render({ id: 'abc' });
```

- `createConfiguration` <[Function]> Creates a new `nucleus` scope bound to the specified `configuration`.

The configuration is merged with all previous scopes.

### interface: Context

- `constraints` <[Object]>
  - `active` <[boolean]>
  - `passive` <[boolean]>
  - `select` <[boolean]>
- `theme` <[string]> Defaults to `light`
- `language` <[string]> Defaults to `en-US`

### interface: Configuration

- `context` <[Context]>
- `types` <[Array]<[TypeInfo]>>
- `themes` <[Array]<[ThemeInfo]>>
- `env` <[Object]>

### class: Nucleus

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

#### nucleus.context(ctx)

- `ctx` <[Context]> The context to update.
- `returns:` <[Promise]<[undefined]>>

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

#### nucleus.selections()

- `returns:` <[Promise]<[AppSelections]>>

Gets the app selections of this instance.

```js
const selections = await n.selections();
selections.mount(element);
```

### interface: ThemeInfo

- `id` <[string]> Theme identifier
- `load` <[Function]> A function that should return a Promise that resolve to a raw JSON theme

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

### interface: CreateConfig

- extends: <[BaseConfig]>

* `type` <[string]>
* `version` <[string]>
* `fields` <[Array]>
* `properties` <[qae.GenericObjectProperties]>

### interface: BaseConfig

- `element` <`HTMLElement`>
- `options` <[Object]>

### interface: GetConfig

- extends: <[BaseConfig]>

* `id` <[string]>

### type Field = <[string]|[qae.NxDimension]|[qae.NxMeasure]|[LibraryField]>

### interface: LibraryField

- `qLibraryId` <[string]>
- `type` <`dimension`|`measure`>

### interface: LoadType(type, env)

- `type` <[Object]>
  - `name` <[string]>
  - `version` <[string]>
- `env` <[Object]>
- `returns:` <[Promise]<`Supernova`>>

### interface: TypeInfo

- `name` <[string]>
- `version` <[string]>
- `load` <[LoadType]>
- `meta` <[Object]>

[enigma.doc]: undefined
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type
[array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[undefined]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined
[htmlelement]: undefined
[qae.genericobjectproperties]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#genericobjectproperties
[qae.nxdimension]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxdimension
[qae.nxmeasure]: https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxmeasure
[supernova]: undefined
[context]: #interface-context
[configuration]: #interface-configuration
[nucleus]: #class-nucleus
[themeinfo]: #interface-themeinfo
[supernovacontroller]: #class-supernovacontroller
[appselections]: #class-appselections
[createconfig]: #interface-createconfig
[baseconfig]: #interface-baseconfig
[getconfig]: #interface-getconfig
[libraryfield]: #interface-libraryfield
[loadtype]: #interface-loadtypetype-env
[typeinfo]: #interface-typeinfo
