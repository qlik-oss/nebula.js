import createEnigmaMocker from '../from-generic-objects';

const genericObject = {
  getLayout: {
    qInfo: { qId: 'b488pz' },
    qHyperCube: {},
  },
};

describe('enigma-mocker', () => {
  it('supports engima functionlity', async () => {
    const app = await createEnigmaMocker(genericObject);

    expect(app).to.include.keys('id', 'session', 'createSessionObject', 'getObject', 'getAppLayout');
  });

  it('id should be a string', async () => {
    const app = await createEnigmaMocker(genericObject);
    expect(app.id).to.be.a.string;
  });

  it('throws if no fixture is specified', async () => {
    expect(() => createEnigmaMocker()).to.throw();
  });

  describe('getObject', () => {
    it('returns undefined when id does not exist', async () => {
      const app = await createEnigmaMocker(genericObject);
      const object = await app.getObject('p55ez');

      expect(object).to.be.undefined;
    });

    it('supports getObject functionality', async () => {
      const app = await createEnigmaMocker(genericObject);
      const object = await app.getObject('b488pz');
      expect(object).to.include.keys('id', 'getLayout', 'on', 'once');
    });

    it('id should be a string', async () => {
      const app = await createEnigmaMocker(genericObject);
      const object = await app.getObject('b488pz');
      expect(object.id).to.be.a.string;
    });

    it('supports multiple generic objects', async () => {
      const genericObjectA = {
        getLayout: { qInfo: { qId: '112233' } },
      };
      const genericObjectB = {
        getLayout: { qInfo: { qId: 'aabbcc' } },
      };
      const app = await createEnigmaMocker([genericObjectA, genericObjectB]);

      expect(await app.getObject('112233')).to.not.be.undefined;
      expect(await app.getObject('aabbcc')).to.not.be.undefined;
    });

    describe('getLayout', () => {
      it('shoud support fixed value', async () => {
        const app = await createEnigmaMocker(genericObject);
        const object = await app.getObject('b488pz');
        const layout = await object.getLayout();
        expect(layout).to.equal(genericObject.getLayout);
      });

      it('should support dynamic value', async () => {
        const getLayout = sinon.stub();
        getLayout.returns({ qInfo: { qId: '2pz14' } });

        const app = await createEnigmaMocker({ getLayout });
        const object = await app.getObject('2pz14');
        const layout = await object.getLayout();

        expect(layout.qInfo.qId).to.equal('2pz14');
        expect(getLayout).to.have.been.called;
      });

      it('is asynchronous', async () => {
        const app = await createEnigmaMocker(genericObject);
        const object = await app.getObject('b488pz');
        const getLayoutPromise = object.getLayout();

        expect(getLayoutPromise).to.be.a('promise');
      });

      it('throws if no getLayout is specified', async () => {
        expect(() => createEnigmaMocker({})).to.throw();
      });

      it('throws if no qId is specified', async () => {
        expect(() => createEnigmaMocker({ getLayout: { qInfo: {} } })).to.throw();
      });
    });

    describe('getHyperCubeData', () => {
      it('should support fixed value', async () => {
        const app = await createEnigmaMocker({ ...genericObject, getHyperCubeData: [{ foo: 'bar' }] });
        const object = await app.getObject('b488pz');
        const hypercubeData = await object.getHyperCubeData();

        expect(hypercubeData).to.be.an('array');
        expect(hypercubeData).to.be.of.length(1);
        expect(hypercubeData[0].foo).to.equal('bar');
      });

      it('should support dynamic value', async () => {
        const getHyperCubeData = sinon.stub();
        getHyperCubeData.returns([{ foo: 'baz' }]);

        const app = await createEnigmaMocker({ ...genericObject, getHyperCubeData });
        const object = await app.getObject('b488pz');
        const hypercubeData = await object.getHyperCubeData('/qHyperCubeDef', {
          width: 10,
          height: 8,
          top: 0,
          left: 4,
        });

        expect(hypercubeData).to.be.an('array');
        expect(hypercubeData).to.be.of.length(1);
        expect(hypercubeData[0]).to.eql({ foo: 'baz' });
        expect(getHyperCubeData).to.have.been.calledWith('/qHyperCubeDef', {
          width: 10,
          height: 8,
          top: 0,
          left: 4,
        });
      });

      it('is asynchronous', async () => {
        const app = await createEnigmaMocker({ ...genericObject, getHyperCubeData: [] });
        const object = await app.getObject('b488pz');
        const hypercubeDataPromise = object.getHyperCubeData();

        expect(hypercubeDataPromise).to.be.a('promise');
      });
    });

    describe('on', () => {
      it('is synchronous', async () => {
        const app = await createEnigmaMocker({ ...genericObject, on: () => true });
        const object = await app.getObject('b488pz');
        const result = object.on();
        expect(result).to.not.be.a('promise');
      });

      it('is extensible', async () => {
        const onStub = sinon.stub();
        onStub.returns(false);
        const app = await createEnigmaMocker({ ...genericObject, on: onStub });
        const object = await app.getObject('b488pz');
        const result = await object.on();
        expect(result).to.equal(false);
        expect(onStub).to.have.been.called;
      });
    });

    describe('once', () => {
      it('is synchronous', async () => {
        const app = await createEnigmaMocker(genericObject);
        const object = await app.getObject('b488pz');
        const result = object.once();
        expect(result).to.not.be.a('promise');
      });

      it('is extensible', async () => {
        const onceStub = sinon.stub();
        onceStub.returns(false);
        const app = await createEnigmaMocker({ ...genericObject, once: onceStub });
        const object = await app.getObject('b488pz');
        const result = await object.once();
        expect(result).to.equal(false);
        expect(onceStub).to.have.been.called;
      });
    });

    describe('addListener', () => {
      it('is synchronous', async () => {
        const app = await createEnigmaMocker({ ...genericObject, addListener: () => true });
        const object = await app.getObject('b488pz');
        const result = object.addListener();
        expect(result).to.not.be.a('promise');
      });
    });

    describe('emit', () => {
      it('is synchronous', async () => {
        const app = await createEnigmaMocker({ ...genericObject, emit: () => true });
        const object = await app.getObject('b488pz');
        const result = object.emit();
        expect(result).to.not.be.a('promise');
      });
    });

    describe('removeAllListeners', () => {
      it('is synchronous', async () => {
        const app = await createEnigmaMocker({ ...genericObject, removeAllListeners: () => true });
        const object = await app.getObject('b488pz');
        const result = object.removeAllListeners();
        expect(result).to.not.be.a('promise');
      });
    });

    describe('removeListener', () => {
      it('is synchronous', async () => {
        const app = await createEnigmaMocker({ ...genericObject, removeListener: () => true });
        const object = await app.getObject('b488pz');
        const result = object.removeListener();
        expect(result).to.not.be.a('promise');
      });
    });

    describe('setMaxListerners', () => {
      it('is synchronous', async () => {
        const app = await createEnigmaMocker({ ...genericObject, setMaxListerners: () => true });
        const object = await app.getObject('b488pz');
        const result = object.setMaxListerners();
        expect(result).to.not.be.a('promise');
      });
    });

    describe('custom property (extensibility)', () => {
      it('should return value', async () => {
        const getCustomThing = sinon.stub();
        getCustomThing.returns({ foo: 'bar' });

        const app = await createEnigmaMocker({ ...genericObject, getCustomThing });
        const object = await app.getObject('b488pz');
        const customThing = await object.getCustomThing();

        expect(customThing).to.eql({ foo: 'bar' });
        expect(getCustomThing).to.have.been.called;
      });

      it('is asynchronous', async () => {
        const getCustomThing = sinon.stub();
        const app = await createEnigmaMocker({ ...genericObject, getCustomThing });
        const object = await app.getObject('b488pz');
        const customThingPromise = object.getCustomThing();

        expect(customThingPromise).to.be.a('promise');
      });
    });
  });

  describe('session', () => {
    describe('getObjectApi', () => {
      it('id should be a string', async () => {
        const app = await createEnigmaMocker(genericObject);
        const objectApi = await app.session.getObjectApi();
        expect(objectApi.id).to.be.a.string;
      });
    });
  });

  describe('createSessionObject', () => {
    it('supports create session functionality', async () => {
      const app = await createEnigmaMocker(genericObject);
      const sessionObject = await app.createSessionObject();
      expect(sessionObject).to.include.keys('on', 'once', 'getLayout', 'id');
    });

    it('is asynchronous', async () => {
      const app = await createEnigmaMocker(genericObject);
      const sessionObjectPromise = app.createSessionObject();
      expect(sessionObjectPromise).to.be.a('promise');
    });

    it('uses "qInfo.qId" as id', async () => {
      const app = await createEnigmaMocker(genericObject);
      const sessionObject = await app.createSessionObject({ qInfo: { qId: 'foo' } });
      expect(sessionObject.id).to.equal('foo');
    });

    describe('extensibility', () => {
      it('supports custom props', async () => {
        const getCustomThing = sinon.stub();
        getCustomThing.returns({ foo: 'bar' });

        const app = await createEnigmaMocker(genericObject);
        const sessionObject = await app.createSessionObject({ getCustomThing });
        const customThing = sessionObject.getCustomThing();

        expect(customThing).to.eql({ foo: 'bar' });
        expect(getCustomThing).to.have.been.called;
      });
    });
  });

  describe('getAppLayout', () => {
    it('is asynchronous', async () => {
      const app = await createEnigmaMocker(genericObject);
      const appLayoutPromise = app.getAppLayout();
      expect(appLayoutPromise).to.be.a('promise');
    });

    it('id should be a string', async () => {
      const app = await createEnigmaMocker(genericObject);
      const appLayout = await app.getAppLayout();
      expect(appLayout.id).to.be.a.string;
    });
  });
});
