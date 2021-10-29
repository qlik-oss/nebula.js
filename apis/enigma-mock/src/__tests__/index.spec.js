import createEnigmaMock from '..';

const fixture = {
  layout: {
    qHyperCube: {
      qDataPages: [],
    },
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

  it('throws if not fixture is specified', async () => {
    expect(createEnigmaMock).to.throw();
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
      it('should return data', async () => {
        const { app } = await createEnigmaMock(fixture);
        const object = await app.getObject();
        const hypercubeData = await object.getHyperCubeData();
        expect(hypercubeData).to.be.an('array');
      });
    });

    describe('getLayout', () => {
      it('shoud return layout', async () => {
        const { app } = await createEnigmaMock(fixture);
        const object = await app.getObject();
        const layout = await object.getLayout();
        expect(layout).to.equal(fixture.layout);
      });
    });
  });

  describe('override', () => {
    it('override id of app', async () => {
      const overrides = () => ({
        id: 'custom-app-id',
      });
      const { app } = await createEnigmaMock(fixture, { overrides });
      expect(app.id).to.equal('custom-app-id');
    });

    it('override getObject', async () => {
      const overrides = ({ base }) => ({
        getObject(id) {
          if (/^ColorMapModel/.test(id)) {
            return Promise.resolve({
              id: 'colors',
              getLayout: () => Promise.resolve({ colorMap: [{ id: 'color1' }] }),
            });
          }
          return Promise.resolve(base.getObject());
        },
      });
      const { app } = await createEnigmaMock(fixture, { overrides });
      const colorObject = await app.getObject('ColorMapModel');
      const colorLayout = await colorObject.getLayout();
      expect(colorLayout).to.include.keys('colorMap');

      const otherObject = await app.getObject('other');
      const otherLayout = await otherObject.getLayout();
      expect(otherLayout).to.equal(fixture.layout);
    });

    it('should be called with fixture and base as arguments', async () => {
      const overrides = sinon.stub().returns({});
      const { base } = await createEnigmaMock(fixture, { overrides });

      expect(overrides).to.have.been.calledWith({ fixture, base });
    });
  });
});
