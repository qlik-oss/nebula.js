import createEnigmaMocker from '../from-generic-objects';

describe('enigma-mocker', () => {
  let genericObject;
  let genericObjects;

  beforeEach(() => {
    genericObject = {
      getLayout: {
        qInfo: { qId: 'b488pz' },
        qHyperCube: {},
      },
    };
    genericObjects = [genericObject];
  });

  test('supports engima functionlity', async () => {
    const app = await createEnigmaMocker(genericObjects);
    expect(app).toMatchObject({
      id: expect.any(String),
      session: {
        getObjectApi: expect.any(Function),
      },
      createSessionObject: expect.any(Function),
      getObject: expect.any(Function),
      getAppLayout: expect.any(Function),
    });
  });

  test('throws if no generic object is specified', async () => {
    const app = await createEnigmaMocker();
    expect(() => app.getObject()).toThrow();
  });

  test('throws if generic objects argument is not array', async () => {
    const app = await createEnigmaMocker({});
    expect(() => app.getObject()).toThrow();
  });

  test('throws if generic objects argument is empty array', async () => {
    const app = await createEnigmaMocker([]);
    expect(() => app.getObject()).toThrow();
  });

  describe('getObject', () => {
    test('returns undefined when id does not exist', async () => {
      const app = await createEnigmaMocker(genericObjects);
      const object = await app.getObject('p55ez');

      expect(object).toBe(undefined);
    });

    test('supports getObject functionality', async () => {
      const app = await createEnigmaMocker(genericObjects);
      const object = await app.getObject('b488pz');
      expect(object).toMatchObject({
        id: expect.any(String),
        getLayout: expect.any(Function),
        on: expect.any(Function),
        once: expect.any(Function),
      });
    });

    test('supports multiple generic objects', async () => {
      const genericObjectA = {
        getLayout: { qInfo: { qId: '112233' } },
      };
      const genericObjectB = {
        getLayout: { qInfo: { qId: 'aabbcc' } },
      };
      const app = await createEnigmaMocker([genericObjectA, genericObjectB]);

      expect(await app.getObject('112233')).not.toBe(undefined);
      expect(await app.getObject('aabbcc')).not.toBe(undefined);
    });

    test('error for unmatched IDs', async () => {
      const genericObjectA = {
        id: 'AABBCC',
        getLayout: { qInfo: { qId: '112233' } },
      };
      await expect(async () => {
        await createEnigmaMocker([genericObjectA]);
      }).rejects.toThrow();
    });

    describe('getLayout', () => {
      test('shoud support fixed value', async () => {
        const app = await createEnigmaMocker(genericObjects);
        const object = await app.getObject('b488pz');
        const layout = await object.getLayout();
        expect(layout).toEqual(genericObject.getLayout);
      });

      test('should support dynamic value', async () => {
        const getLayoutMock = jest.fn().mockReturnValue({ qInfo: { qId: '2pz14' } });

        const app = await createEnigmaMocker([{ getLayout: getLayoutMock }]);
        const object = await app.getObject('2pz14');
        const layout = await object.getLayout();

        expect(layout.qInfo.qId).toEqual('2pz14');
        expect(getLayoutMock).toHaveBeenCalled;
      });

      test('is asynchronous', async () => {
        const app = await createEnigmaMocker(genericObjects);
        const object = await app.getObject('b488pz');
        const getLayoutPromise = object.getLayout();

        expect(getLayoutPromise instanceof Promise).toBe(true);
      });

      test('throws if no getLayout is specified', async () => {
        expect(() => createEnigmaMocker([{}])).toThrow();
      });

      test('throws if no qId is specified', async () => {
        expect(() => createEnigmaMocker([{ getLayout: { qInfo: {} } }])).toThrow();
      });
    });

    describe('getHyperCubeData', () => {
      test('should support fixed value', async () => {
        const app = await createEnigmaMocker([{ ...genericObject, getHyperCubeData: [{ foo: 'bar' }] }]);
        const object = await app.getObject('b488pz');
        const hypercubeData = await object.getHyperCubeData();

        expect(hypercubeData instanceof Array).toBe(true);
        expect(hypercubeData.length).toBe(1);
        expect(hypercubeData[0].foo).toBe('bar');
      });

      test('should support dynamic value', async () => {
        const getHyperCubeData = jest.fn().mockReturnValue([{ foo: 'baz' }]);

        const app = await createEnigmaMocker([{ ...genericObject, getHyperCubeData }]);
        const object = await app.getObject('b488pz');
        const hypercubeData = await object.getHyperCubeData('/qHyperCubeDef', {
          width: 10,
          height: 8,
          top: 0,
          left: 4,
        });

        expect(hypercubeData instanceof Array).toBe(true);
        expect(hypercubeData.length).toBe(1);
        expect(hypercubeData[0]).toEqual({ foo: 'baz' });
        expect(getHyperCubeData).toHaveBeenCalledWith('/qHyperCubeDef', {
          width: 10,
          height: 8,
          top: 0,
          left: 4,
        });
      });

      test('is asynchronous', async () => {
        const app = await createEnigmaMocker([{ ...genericObject, getHyperCubeData: [] }]);
        const object = await app.getObject('b488pz');
        const hypercubeDataPromise = object.getHyperCubeData();

        expect(hypercubeDataPromise instanceof Promise).toBe(true);
      });
    });

    describe('on', () => {
      test('is synchronous', async () => {
        const app = await createEnigmaMocker([{ ...genericObject, on: () => true }]);
        const object = await app.getObject('b488pz');
        const result = object.on();
        expect(result instanceof Promise).toBe(false);
      });

      test('is extensible', async () => {
        const onMock = jest.fn().mockReturnValue(false);

        const app = await createEnigmaMocker([{ ...genericObject, on: onMock }]);
        const object = await app.getObject('b488pz');
        const result = await object.on();
        expect(result).toBe(false);
        expect(onMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('once', () => {
      test('is synchronous', async () => {
        const app = await createEnigmaMocker(genericObjects);
        const object = await app.getObject('b488pz');
        const result = object.once();
        expect(result instanceof Promise).toBe(false);
      });

      test('is extensible', async () => {
        const onceMock = jest.fn().mockReturnValue(false);

        const app = await createEnigmaMocker([{ ...genericObject, once: onceMock }]);
        const object = await app.getObject('b488pz');
        const result = await object.once();
        expect(result).toBe(false);
        expect(onceMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('addListener', () => {
      test('is synchronous', async () => {
        const app = await createEnigmaMocker([{ ...genericObject, addListener: () => true }]);
        const object = await app.getObject('b488pz');
        const result = object.addListener();
        expect(result instanceof Promise).toBe(false);
      });
    });

    describe('emit', () => {
      test('is synchronous', async () => {
        const app = await createEnigmaMocker([{ ...genericObject, emit: () => true }]);
        const object = await app.getObject('b488pz');
        const result = object.emit();
        expect(result instanceof Promise).toBe(false);
      });
    });

    describe('removeAllListeners', () => {
      test('is synchronous', async () => {
        const app = await createEnigmaMocker([{ ...genericObject, removeAllListeners: () => true }]);
        const object = await app.getObject('b488pz');
        const result = object.removeAllListeners();
        expect(result instanceof Promise).toBe(false);
      });
    });

    describe('removeListener', () => {
      test('is synchronous', async () => {
        const app = await createEnigmaMocker([{ ...genericObject, removeListener: () => true }]);
        const object = await app.getObject('b488pz');
        const result = object.removeListener();
        expect(result instanceof Promise).toBe(false);
      });
    });

    describe('setMaxListerners', () => {
      test('is synchronous', async () => {
        const app = await createEnigmaMocker([{ ...genericObject, setMaxListerners: () => true }]);
        const object = await app.getObject('b488pz');
        const result = object.setMaxListerners();
        expect(result instanceof Promise).toBe(false);
      });
    });

    describe('custom property (extensibility)', () => {
      test('should return value', async () => {
        const getCustomThing = jest.fn().mockReturnValue({ foo: 'bar' });

        const app = await createEnigmaMocker([{ ...genericObject, getCustomThing }]);
        const object = await app.getObject('b488pz');
        const customThing = await object.getCustomThing();

        expect(customThing).toEqual({ foo: 'bar' });
        expect(getCustomThing).toHaveBeenCalledTimes(1);
      });

      test('is asynchronous', async () => {
        const getCustomThing = jest.fn();
        const app = await createEnigmaMocker([{ ...genericObject, getCustomThing }]);
        const object = await app.getObject('b488pz');
        const customThingPromise = object.getCustomThing();

        expect(customThingPromise instanceof Promise).toBe(true);
      });
    });
  });

  describe('session', () => {
    describe('getObjectApi', () => {
      test('id should be a string', async () => {
        const app = await createEnigmaMocker(genericObjects);
        const objectApi = await app.session.getObjectApi();
        expect(objectApi).toMatchObject({
          id: expect.any(String),
        });
      });
    });
  });

  describe('createSessionObject', () => {
    test('supports create session functionality', async () => {
      const app = await createEnigmaMocker(genericObjects);
      const sessionObject = await app.createSessionObject();
      expect(sessionObject).toMatchObject({
        id: expect.any(String),
        on: expect.any(Function),
        once: expect.any(Function),
        getLayout: expect.any(Function),
        getProperties: expect.any(Function),
        getEffectiveProperties: expect.any(Function),
        qInfo: {
          qId: expect.any(String),
        },
      });
    });

    test('is asynchronous', async () => {
      const app = await createEnigmaMocker(genericObjects);
      const sessionObjectPromise = app.createSessionObject();
      expect(sessionObjectPromise instanceof Promise).toBe(true);
    });

    test('uses "qInfo.qId" as id', async () => {
      const app = await createEnigmaMocker(genericObjects);
      const sessionObject = await app.createSessionObject({ qInfo: { qId: 'foo' } });
      expect(sessionObject.id).toBe('foo');
    });

    describe('extensibility', () => {
      test('supports custom props', async () => {
        const getCustomThing = jest.fn().mockReturnValue({ foo: 'bar' });

        const app = await createEnigmaMocker(genericObjects);
        const sessionObject = await app.createSessionObject({ getCustomThing });
        const customThing = sessionObject.getCustomThing();

        expect(customThing).toEqual({ foo: 'bar' });
        expect(getCustomThing).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getAppLayout', () => {
    test('is asynchronous', async () => {
      const app = await createEnigmaMocker(genericObjects);
      const appLayoutPromise = app.getAppLayout();
      expect(appLayoutPromise instanceof Promise).toBe(true);
    });

    test('id should be a string', async () => {
      const app = await createEnigmaMocker(genericObjects);
      const appLayout = await app.getAppLayout();
      expect(appLayout).toMatchObject({
        id: expect.any(String),
      });
    });
  });
});
