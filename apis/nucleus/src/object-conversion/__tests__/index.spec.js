import objectConversion from '../index';

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

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sourceQae = {};
      targetQae = {};
      halo = {
        types: {
          get: sandbox.stub().returns({
            supernova: sandbox.stub().returns({ qae: targetQae }),
          }),
        },
      };
      propertyTree = {
        qProperty: {
          visualization: 'abc',
        },
      };
      model = { getFullPropertyTree: sandbox.stub().returns(propertyTree) };
      cellRef = {
        current: {
          getQae: sandbox.stub().returns(sourceQae),
        },
      };
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should do convert correctly when there is no exportProperties and importProperties', async () => {
      newType = 'bar';
      const convertedTree = await objectConversion.convertTo({ halo, model, cellRef, newType });
      expect(cellRef.current.getQae.callCount).to.equal(1);
      expect(model.getFullPropertyTree.callCount).to.equal(1);
      expect(halo.types.get.callCount).to.equal(1);
      expect(halo.types.get().supernova.callCount).to.equal(1);
      expect(convertedTree.qProperty.visualization).to.equal('bar');
    });

    it('should do convert correctly when there is source exportProperties', async () => {
      newType = 'bar';
      sourceQae = { exportProperties: sandbox.stub().returns({ qProperty: { xyz: 1 } }) };
      cellRef = {
        current: {
          getQae: sandbox.stub().returns(sourceQae),
        },
      };
      const convertedTree = await objectConversion.convertTo({ halo, model, cellRef, newType });
      expect(cellRef.current.getQae.callCount).to.equal(1);
      expect(model.getFullPropertyTree.callCount).to.equal(1);
      expect(halo.types.get.callCount).to.equal(1);
      expect(halo.types.get().supernova.callCount).to.equal(1);
      expect(convertedTree.qProperty.visualization).to.equal('bar');
      expect(sourceQae.exportProperties.callCount).to.equal(1);
      expect(convertedTree.qProperty.xyz).to.equal(1);
    });

    it('should do convert correctly when there is target importProperties', async () => {
      newType = 'bar';
      targetQae = { importProperties: sandbox.stub().returns({ qProperty: { mnp: 10 } }) };
      halo = {
        types: {
          get: sandbox.stub().returns({
            supernova: sandbox.stub().returns({ qae: targetQae }),
          }),
        },
      };
      const convertedTree = await objectConversion.convertTo({ halo, model, cellRef, newType });
      expect(cellRef.current.getQae.callCount).to.equal(1);
      expect(model.getFullPropertyTree.callCount).to.equal(1);
      expect(halo.types.get.callCount).to.equal(1);
      expect(halo.types.get().supernova.callCount).to.equal(1);
      expect(convertedTree.qProperty.visualization).to.equal('bar');
      expect(targetQae.importProperties.callCount).to.equal(1);
      expect(convertedTree.qProperty.mnp).to.equal(10);
    });

    it('should do convert correctly when there are source exportProperties and target importProperties', async () => {
      newType = 'bar';
      sourceQae = { exportProperties: sandbox.stub().returns({ qProperty: { xyz: 1 } }) };
      cellRef = {
        current: {
          getQae: sandbox.stub().returns(sourceQae),
        },
      };
      targetQae = { importProperties: sandbox.stub().returns({ qProperty: { mnp: 10 } }) };
      halo = {
        types: {
          get: sandbox.stub().returns({
            supernova: sandbox.stub().returns({ qae: targetQae }),
          }),
        },
      };
      const convertedTree = await objectConversion.convertTo({ halo, model, cellRef, newType });
      expect(cellRef.current.getQae.callCount).to.equal(1);
      expect(model.getFullPropertyTree.callCount).to.equal(1);
      expect(halo.types.get.callCount).to.equal(1);
      expect(halo.types.get().supernova.callCount).to.equal(1);
      expect(convertedTree.qProperty.visualization).to.equal('bar');
      expect(sourceQae.exportProperties.callCount).to.equal(1);
      expect(targetQae.importProperties.callCount).to.equal(1);
      expect(convertedTree.qProperty.mnp).to.equal(10);
    });
  });
});
