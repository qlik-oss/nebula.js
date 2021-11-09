import createEnigmaMock from '..';

const fixture = {
  getLayout: {
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

  it('throws if no fixture is specified', async () => {
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
        expect(layout).to.equal(fixture.getLayout);
      });
    });
  });
});
