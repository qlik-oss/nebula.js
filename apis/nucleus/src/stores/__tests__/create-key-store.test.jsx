import React, { forwardRef, useEffect, useState, useImperativeHandle } from 'react';
import { create, act } from 'react-test-renderer';

import createKeyStore from '../create-key-store';

const TestHook = forwardRef(({ hook, hookProps = [], storeKey }, ref) => {
  const [store] = hook(...hookProps);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount((c) => {
      const newCount = c + 1;
      return newCount;
    });
  }, [store.get(storeKey)]);

  useImperativeHandle(ref, () => ({
    store,
    count,
  }));
  return null;
});

describe('', () => {
  let renderer;
  let render;
  let ref;
  let useKeyStore;
  beforeAll(() => {
    [useKeyStore] = createKeyStore();
  });
  beforeEach(() => {
    ref = React.createRef();
    render = async (storeKey = 'foo', rendererOptions = null) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useKeyStore} storeKey={storeKey} />, rendererOptions);
      });
    };
  });
  afterEach(() => {
    renderer.unmount();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should cache values', async () => {
    await render();
    const foo = {};
    ref.current.store.set('foo', foo);
    expect(ref.current.store.get('foo')).toEqual(foo);
  });

  test('should throw when caching with invalid key', async () => {
    await render();
    const foo = {};
    const objKey = () => ref.current.store.set({}, foo);
    const undefinedKey = () => ref.current.store.set(undefined, foo);
    expect(objKey).toThrow();
    expect(undefinedKey).toThrow();
  });

  test('should clear values', async () => {
    await render();
    const foo = {};
    ref.current.store.set('foo', foo);
    expect(ref.current.store.get('foo')).toEqual(foo);
    ref.current.store.clear('foo');
    expect(ref.current.store.get('foo')).toBe(null);
  });

  test('should throw when clearing with invalid key', async () => {
    await render();
    const objKey = () => ref.current.store.clear({});
    const undefinedKey = () => ref.current.store.set(undefined);
    expect(objKey).toThrow();
    expect(undefinedKey).toThrow();
  });

  test('should dispatch', async () => {
    await render();
    const foo = {};
    ref.current.store.set('foo', foo);
    expect(ref.current.store.get('foo')).toEqual(foo);
    await act(async () => ref.current.store.dispatch(true));
    expect(ref.current.count).toBe(2);
  });
});
