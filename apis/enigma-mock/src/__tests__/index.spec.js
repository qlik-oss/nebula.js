import createEnigmaMock from '..';

const fixture = {
  getLayout: {
    qHyperCube: {},
  },
};

describe('enigma-mock', () => {
  it('supports engima functionlity', async () => {
    const { app } = await createEnigmaMock(fixture);
    expect(app).to.include.keys('id', 'session', 'createSessionObject', 'getObject', 'getAppLayout');
  });

  it('id should be a string', async () => {
    const { app } = await createEnigmaMock(fixture);
    expect(app.id).to.be.a.string;
  });

  it('throws if no fixture is specified', async () => {
    expect(() => createEnigmaMock()).to.throw();
  });

  describe('getObject', () => {
    it('supports getObject functionality', async () => {
      const { app } = await createEnigmaMock(fixture);
      const object = await app.getObject();
      expect(object).to.include.keys('id', 'getHyperCubeData', 'getLayout');
    });

    it('id should be a string', async () => {
      const { app } = await createEnigmaMock(fixture);
      const object = await app.getObject();
      expect(object.id).to.be.a.string;
    });

    describe('getHyperCubeData', () => {
      it('should support fixed value', async () => {
        const { app } = await createEnigmaMock({ ...fixture, getHyperCubeData: [{ foo: 'bar' }] });
        const object = await app.getObject();
        const hypercubeData = await object.getHyperCubeData();

        expect(hypercubeData).to.be.an('array');
        expect(hypercubeData).to.be.of.length(1);
        expect(hypercubeData[0].foo).to.equal('bar');
      });

      it('should support dynamic value', async () => {
        const getHyperCubeData = sinon.stub();
        getHyperCubeData.returns([{ foo: 'baz' }]);

        const { app } = await createEnigmaMock({ ...fixture, getHyperCubeData });
        const object = await app.getObject();
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

      it('should have empty array as default value', async () => {
        const { app } = await createEnigmaMock(fixture);
        const object = await app.getObject();
        const hypercubeData = await object.getHyperCubeData();

        expect(hypercubeData).to.be.an('array');
        expect(hypercubeData).to.be.of.length(0);
      });

      it('should return a promise', async () => {
        const { app } = await createEnigmaMock(fixture);
        const object = await app.getObject();
        const hypercubeDataPromise = object.getHyperCubeData();

        expect(hypercubeDataPromise).to.be.a('promise');
      });
    });

    describe('getLayout', () => {
      it('shoud support fixed value', async () => {
        const { app } = await createEnigmaMock(fixture);
        const object = await app.getObject();
        const layout = await object.getLayout();
        expect(layout).to.equal(fixture.getLayout);
      });

      it('should support dynamic value', async () => {
        const getLayout = sinon.stub();
        getLayout.returns({ qInfo: { qId: '2pz14' } });

        const { app } = await createEnigmaMock({ getLayout });
        const object = await app.getObject();
        const layout = await object.getLayout();

        expect(layout.qInfo.qId).to.equal('2pz14');
        expect(getLayout).to.have.been.calledOnce;
      });

      it('throws if no getLayout is specified', async () => {
        expect(() => createEnigmaMock({})).to.throw();
      });
    });

    describe('extensibility', () => {
      it('supports custom fixture prop', async () => {
        const getCustomThing = sinon.stub();
        getCustomThing.returns({ foo: 'bar' });

        const { app } = await createEnigmaMock({ ...fixture, getCustomThing });
        const object = await app.getObject();
        const customThing = object.getCustomThing();

        expect(customThing).to.eql({ foo: 'bar' });
        expect(getCustomThing).to.have.been.calledOnce;
      });
    });
  });

  describe('session', () => {
    describe('getObjectApi', () => {
      it('id should be a string', async () => {
        const { app } = await createEnigmaMock(fixture);
        const objectApi = await app.session.getObjectApi();
        expect(objectApi.id).to.be.a.string;
      });
    });
  });

  describe('createSessionObject', () => {
    it('supports create session functionality', async () => {
      const { app } = await createEnigmaMock(fixture);
      const sessionObject = await app.createSessionObject();
      expect(sessionObject).to.include.keys('on', 'once', 'getLayout', 'id');
    });

    it('returns a promise', async () => {
      const { app } = await createEnigmaMock(fixture);
      const sessionObjectPromise = app.createSessionObject();
      expect(sessionObjectPromise).to.be.a('promise');
    });

    it('uses "qInfo.qId" as id', async () => {
      const { app } = await createEnigmaMock(fixture);
      const sessionObject = await app.createSessionObject({ qInfo: { qId: 'foo' } });
      expect(sessionObject.id).to.equal('foo');
    });

    describe('extensibility', () => {
      it('supports custom props', async () => {
        const getCustomThing = sinon.stub();
        getCustomThing.returns({ foo: 'bar' });

        const { app } = await createEnigmaMock(fixture);
        const sessionObject = await app.createSessionObject({ getCustomThing });
        const customThing = sessionObject.getCustomThing();

        expect(customThing).to.eql({ foo: 'bar' });
        expect(getCustomThing).to.have.been.calledOnce;
      });
    });
  });

  describe('getAppLayout', () => {
    it('returns a promise', async () => {
      const { app } = await createEnigmaMock(fixture);
      const appLayoutPromise = app.getAppLayout();
      expect(appLayoutPromise).to.be.a('promise');
    });

    it('id should be a string', async () => {
      const { app } = await createEnigmaMock(fixture);
      const appLayout = await app.getAppLayout();
      expect(appLayout.id).to.be.a.string;
    });
  });
});
