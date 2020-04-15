---
id: sn-component
title: Rendering
---

The `component` portion of the definition is where all rendering takes place, it's just a function that does not return anything:

```js
export default function () {
  return {
    component() {
      // rendering logic goes here
    },
  };
}
```

In order to render something you need to access the DOM element the supernova is assigned to, you can do so by importing the `useElement` function:

```js
import { useElement } from '@nebula.js/supernova';
```

This function returns a simple HTMLElement which is your entry point to the visual world:

```js
component() {
  const element = useElement();
  element.innerHTML = 'Hello!';
}
```

`useElement` is one of many functions that provide you with the most common requirements when developing a chart, they allow you to _hook_ into the resources provided by both `nebula.js` and Qlik's Associative Engine.

## Hooks

If you have been working with [React](https://reactjs.org/) you might recognize this as _hooks_. Hooks is a concept which emphasizes reusable composable functions rather than classical object oriented classes and inheritance. While our implementation is completely custom with our own hooks, the concept and rules are very similar, so much so that you can read the [React hooks documentation](https://reactjs.org/docs/hooks-intro.html) to understand how to use nebula's own hooks.

### useElement

You've already seen the `useElement` hook, it's only purpose is to provide the HTMLElement you need to attach your own elements to to make your content visible, in the following example the element's `innerHTML` is set to `Hello!`:

```js
component() {
  // get the element
  const element = useElement();
  // set element content
  element.innerHTML = 'Hello!';
}
```

A static string won't accomplish much though, in most cases you will be updating the content based on data input, component state and user interactions.

The `component()` function is executed every time something that might be connected to your rendering changes; theme, data model, data selections, component state etc. As such, adding and removing event listeners, updating DOM nodes and fetching data is not ideal and can be quite performance heavy if done every time `component()` is run. You should instead batch updates with `useEffect`.

### useEffect

`useEffect` is a hook that accepts a callback function which will be run only when the value you specify changes. This enables you to not only batch updates but to also implement your own form of lifecycle management in your component.

```js
import { useEffect } from '@nebula.js/supernova';
// ...
component() {
  const element = useElement();

  useEffect(() => {
    // run only once when the component is created
    console.log('created');
  }, []);
}
```

Adding event listeners to the element is typically only done when the component is initiated, and then removed when the component is destroyed:

```js
component() {
  const element = useElement();

  useEffect(() => {
    const listener = () => {
      console.log('clicked');
    };

    element.addEventListener('click', listener);

    return () => {
      // clean-up
      element.removeEventListener('click', listener);
    };
  }, [element]);
}
```

In the example above, `element` is provided as an observable value as the second argument so the effect will only run when `element` changes. However, since `element` never changes for the same component the callback will only run once when the component is created. So `listener` will only be instantiated once and only one `click` event listener will be added. The callback also returns a function in the end, it's a clean-up function that is executed when any of the observable values change, or when the component is destroyed. This is where you should clean-up any sideffects you added, in this case the event listener is removed to avoid a memory leak.

### useState

Since `component()` is a function and not a class or object instance, you can not use `this` to store instance values as you would otherwise. The way to store state is through `useState`:

```js
import { useState } from '@nebula.js/supernova';

export default function () {
  return {
    component() {
      const [count, setCount] = useState(0);
    },
  };
}
```

`useState` returns a tuple where the first item is the same as the initial value provided as argument to `useState`, while the second item is a setter function through which you can change the value.

In the following example `count` is incremented by 1 when a user clicks on `element`:

```js
component() {
  const element = useElement();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const listener = () => {
      setCount(count + 1);
    };

    element.addEventListener('click', listener);

    return () => {
      element.removeEventListener('click', listener);
    };
  }, [element]);
}
```

To render the updated value you can add another `useEffect` that is run when `count` changes:

```js
const [count, setCount] = useState(0);
useEffect(() => {
  element.innerHTML = `Count: ${count}`;
}, [count]);
```
