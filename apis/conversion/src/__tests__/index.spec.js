const doMock = ({ hypercube = {} } = {}) => aw.mock([['**/hypercube/index.js', () => hypercube]], ['../index.js']);
describe('objectConversion', () => {
  describe('convertTo', () => {
    let sandbox;
    let newType;
    let halo;
    let model;
    let cellRef;
    let propertyTree;
    let sourceQae;
    let targetQae;
    let hypercube;
    let convertTo;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sourceQae = {
        data: {
          targets: [{ propertyPath: '/qHyperCubeDef' }],
        },
      };
      targetQae = {
        data: {
          targets: [{ propertyPath: '/qHyperCubeDef' }],
        },
        properties: {
          initial: {},
        },
      };
      halo = {
        types: {
          get: sandbox.stub().returns({
            supernova: sandbox.stub().returns({ qae: targetQae }),
          }),
        },
      };
      propertyTree = {
        qProperty: {
          visualization: 'some type',
        },
      };
      model = { getFullPropertyTree: sandbox.stub().returns(propertyTree) };
      cellRef = {
        current: {
          getQae: sandbox.stub().returns(sourceQae),
        },
      };
      hypercube = {
        exportProperties: sandbox.stub().returns({ properties: { prop1: 'value 1' } }),
        importProperties: sandbox.stub().returns({ qProperty: { prop2: 'value 2' } }),
      };
      [{ convertTo }] = doMock({ hypercube });
    });

    afterEach(() => {
      sandbox.reset();
      sandbox.restore();
    });

    it('should use hypercube.exportProperties and hypercube.importProperties when there is no source exportProperties and no target importProperties', async () => {
      newType = 'new type';
      const newPropertyTree = await convertTo({ halo, model, cellRef, newType });
      expect(cellRef.current.getQae.callCount).to.equal(1);
      expect(model.getFullPropertyTree.callCount).to.equal(1);
      expect(halo.types.get.callCount).to.equal(1);
      expect(halo.types.get().supernova.callCount).to.equal(1);
      expect(hypercube.exportProperties.callCount).to.equal(1);
      expect(hypercube.exportProperties).to.have.been.calledWithExactly({ propertyTree, hypercubePath: '' });
      expect(hypercube.importProperties.callCount).to.equal(1);
      expect(hypercube.importProperties).to.have.been.calledWithExactly({
        exportFormat: { properties: { prop1: 'value 1' } },
        initialProperties: { qInfo: { qType: 'new type' }, visualization: 'new type' },
        dataDefinition: { propertyPath: '/qHyperCubeDef' },
        hypercubePath: '',
      });
      expect(newPropertyTree).to.deep.equal({ qProperty: { prop2: 'value 2' } });
    });

    it('should use hypercube.exportProperties when there is no source exportProperties', async () => {
      newType = 'new type';
      targetQae = {
        importProperties: sandbox.stub().returns({ qProperty: { prop4: 'value 4' } }),
        properties: {
          initial: {},
        },
      };
      halo = {
        types: {
          get: sandbox.stub().returns({
            supernova: sandbox.stub().returns({ qae: targetQae }),
          }),
        },
      };
      const newPropertyTree = await convertTo({ halo, model, cellRef, newType });
      expect(cellRef.current.getQae.callCount).to.equal(1);
      expect(model.getFullPropertyTree.callCount).to.equal(1);
      expect(halo.types.get.callCount).to.equal(1);
      expect(halo.types.get().supernova.callCount).to.equal(1);
      expect(hypercube.exportProperties.callCount).to.equal(1);
      expect(hypercube.exportProperties).to.have.been.calledWithExactly({ propertyTree, hypercubePath: '' });
      expect(hypercube.importProperties.callCount).to.equal(0);
      expect(targetQae.importProperties.callCount).to.equal(1);
      expect(targetQae.importProperties).to.have.been.calledWithExactly({
        exportFormat: { properties: { prop1: 'value 1' } },
        initialProperties: { qInfo: { qType: 'new type' }, visualization: 'new type' },
        dataDefinition: {},
        hypercubePath: '',
      });
      expect(newPropertyTree).to.deep.equal({ qProperty: { prop4: 'value 4' } });
    });

    it('should use hypercube.importProperties when there is no target importProperties', async () => {
      newType = 'new type';
      sourceQae = { exportProperties: sandbox.stub().returns({ qProperty: { prop3: 'value 3' } }) };
      cellRef = {
        current: {
          getQae: sandbox.stub().returns(sourceQae),
        },
      };
      const newPropertyTree = await convertTo({ halo, model, cellRef, newType });
      expect(cellRef.current.getQae.callCount).to.equal(1);
      expect(model.getFullPropertyTree.callCount).to.equal(1);
      expect(halo.types.get.callCount).to.equal(1);
      expect(halo.types.get().supernova.callCount).to.equal(1);
      expect(hypercube.exportProperties.callCount).to.equal(0);
      expect(sourceQae.exportProperties.callCount).to.equal(1);
      expect(sourceQae.exportProperties).to.have.been.calledWithExactly({ propertyTree, hypercubePath: '' });
      expect(hypercube.importProperties.callCount).to.equal(1);
      expect(hypercube.importProperties).to.have.been.calledWithExactly({
        exportFormat: { qProperty: { prop3: 'value 3' } },
        initialProperties: { qInfo: { qType: 'new type' }, visualization: 'new type' },
        dataDefinition: { propertyPath: '/qHyperCubeDef' },
        hypercubePath: '',
      });
      expect(newPropertyTree).to.deep.equal({ qProperty: { prop2: 'value 2' } });
    });

    it('should do convert correctly when there are source exportProperties and target importProperties', async () => {
      newType = 'new type';
      sourceQae = { exportProperties: sandbox.stub().returns({ qProperty: { prop3: 'value 3' } }) };
      cellRef = {
        current: {
          getQae: sandbox.stub().returns(sourceQae),
        },
      };
      targetQae = {
        importProperties: sandbox.stub().returns({ qProperty: { prop4: 'value 4' } }),
        properties: {
          initial: {},
        },
      };
      halo = {
        types: {
          get: sandbox.stub().returns({
            supernova: sandbox.stub().returns({ qae: targetQae }),
          }),
        },
      };
      const newPropertyTree = await convertTo({ halo, model, cellRef, newType });
      expect(cellRef.current.getQae.callCount).to.equal(1);
      expect(model.getFullPropertyTree.callCount).to.equal(1);
      expect(halo.types.get.callCount).to.equal(1);
      expect(halo.types.get().supernova.callCount).to.equal(1);
      expect(hypercube.exportProperties.callCount).to.equal(0);
      expect(sourceQae.exportProperties.callCount).to.equal(1);
      expect(sourceQae.exportProperties).to.have.been.calledWithExactly({ propertyTree, hypercubePath: '' });
      expect(hypercube.importProperties.callCount).to.equal(0);
      expect(targetQae.importProperties.callCount).to.equal(1);
      expect(targetQae.importProperties).to.have.been.calledWithExactly({
        exportFormat: { qProperty: { prop3: 'value 3' } },
        initialProperties: { qInfo: { qType: 'new type' }, visualization: 'new type' },
        dataDefinition: {},
        hypercubePath: '',
      });
      expect(newPropertyTree).to.deep.equal({ qProperty: { prop4: 'value 4' } });
    });
  });
});
