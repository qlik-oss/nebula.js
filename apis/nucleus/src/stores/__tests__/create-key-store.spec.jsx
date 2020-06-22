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
  let sandbox;
  let renderer;
  let render;
  let ref;
  let useKeyStore;
  before(() => {
    [useKeyStore] = createKeyStore();
  });
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    ref = React.createRef();
    render = async (storeKey = 'foo', rendererOptions = null) => {
      await act(async () => {
        renderer = create(<TestHook ref={ref} hook={useKeyStore} storeKey={storeKey} />, rendererOptions);
      });
    };
  });
  afterEach(() => {
    sandbox.restore();
    renderer.unmount();
  });

  it('should cache values', async () => {
    await render();
    const foo = {};
    ref.current.store.set('foo', foo);
    expect(ref.current.store.get('foo')).to.equal(foo);
  });

  it('should throw when caching with invalid key', async () => {
    await render();
    const foo = {};
    const objKey = () => ref.current.store.set({}, foo);
    const undefinedKey = () => ref.current.store.set(undefined, foo);
    expect(objKey).to.throw();
    expect(undefinedKey).to.throw();
  });

  it('should clear values', async () => {
    await render();
    const foo = {};
    ref.current.store.set('foo', foo);
    expect(ref.current.store.get('foo')).to.equal(foo);
    ref.current.store.clear('foo');
    expect(ref.current.store.get('foo')).to.equal(null);
  });

  it('should throw when clearing with invalid key', async () => {
    await render();
    const objKey = () => ref.current.store.clear({});
    const undefinedKey = () => ref.current.store.set(undefined);
    expect(objKey).to.throw();
    expect(undefinedKey).to.throw();
  });

  it('should dispatch', async () => {
    await render();
    const foo = {};
    ref.current.store.set('foo', foo);
    expect(ref.current.store.get('foo')).to.equal(foo);
    await act(async () => ref.current.store.dispatch(true));
    expect(ref.current.count).to.equal(2);
  });
});
