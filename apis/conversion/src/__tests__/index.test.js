import * as HyperCube from '../hypercube';
import { convertTo } from '../index';

describe('objectConversion', () => {
  describe('convertTo', () => {
    let newType;
    let halo;
    let model;
    let cellRef;
    let propertyTree;
    let sourceQae;
    let targetQae;

    let haloGetTypesMock;
    let supernovaMock;
    let getFullPropertyTreeMock;
    let getQaeMock;
    let exportPropertiesMock;
    let importPropertiesMock;

    beforeEach(() => {
      sourceQae = {
        data: {
          targets: [{ propertyPath: '/qHyperCubeDef' }],
        },
      };
      getQaeMock = jest.fn().mockReturnValue(sourceQae);
      cellRef = {
        current: {
          getQae: getQaeMock,
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
      supernovaMock = jest.fn().mockReturnValue({ qae: targetQae });
      haloGetTypesMock = jest.fn().mockReturnValue({
        supernova: supernovaMock,
      });
      halo = {
        types: {
          get: haloGetTypesMock,
        },
      };

      propertyTree = {
        qProperty: {
          visualization: 'some type',
        },
      };
      getFullPropertyTreeMock = jest.fn().mockReturnValue(propertyTree);
      model = { getFullPropertyTree: getFullPropertyTreeMock };

      exportPropertiesMock = jest.fn().mockReturnValue({ properties: { prop1: 'value 1' } });
      importPropertiesMock = jest.fn().mockReturnValue({ qProperty: { prop2: 'value 2' } });

      jest.spyOn(HyperCube.default, 'exportProperties').mockImplementation(exportPropertiesMock);
      jest.spyOn(HyperCube.default, 'importProperties').mockImplementation(importPropertiesMock);
    });

    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    test('should use hypercube.exportProperties and hypercube.importProperties when there is no source exportProperties and no target importProperties', async () => {
      newType = 'new type';
      const newPropertyTree = await convertTo({ halo, model, cellRef, newType });
      expect(getQaeMock).toHaveBeenCalledTimes(1);
      expect(getFullPropertyTreeMock).toHaveBeenCalledTimes(1);
      expect(haloGetTypesMock).toHaveBeenCalledTimes(1);
      expect(supernovaMock).toHaveBeenCalledTimes(1);
      expect(exportPropertiesMock).toHaveBeenCalledTimes(1);
      expect(exportPropertiesMock).toHaveBeenCalledWith({ propertyTree, hypercubePath: '' });
      expect(importPropertiesMock).toHaveBeenCalledTimes(1);
      expect(importPropertiesMock).toHaveBeenCalledWith({
        exportFormat: { properties: { prop1: 'value 1' } },
        initialProperties: { qInfo: { qType: 'new type' }, visualization: 'new type' },
        dataDefinition: { propertyPath: '/qHyperCubeDef' },
        hypercubePath: '',
      });
      expect(newPropertyTree).toEqual({ qProperty: { prop2: 'value 2' } });
    });

    test('should use hypercube.exportProperties when there is no source exportProperties', async () => {
      newType = 'new type';
      const targetQaeImportPropertiesMock = jest.fn().mockReturnValue({ qProperty: { prop4: 'value 4' } });
      targetQae = {
        importProperties: targetQaeImportPropertiesMock,
        properties: {
          initial: {},
        },
      };
      supernovaMock.mockReturnValue({ qae: targetQae });

      const newPropertyTree = await convertTo({ halo, model, cellRef, newType });
      expect(getQaeMock).toHaveBeenCalledTimes(1);
      expect(getFullPropertyTreeMock).toHaveBeenCalledTimes(1);
      expect(haloGetTypesMock).toHaveBeenCalledTimes(1);
      expect(supernovaMock).toHaveBeenCalledTimes(1);
      expect(exportPropertiesMock).toHaveBeenCalledTimes(1);
      expect(exportPropertiesMock).toHaveBeenCalledWith({ propertyTree, hypercubePath: '' });
      expect(importPropertiesMock).toHaveBeenCalledTimes(0);
      expect(targetQaeImportPropertiesMock).toHaveBeenCalledTimes(1);
      expect(targetQaeImportPropertiesMock).toHaveBeenCalledWith({
        exportFormat: { properties: { prop1: 'value 1' } },
        initialProperties: { qInfo: { qType: 'new type' }, visualization: 'new type' },
        dataDefinition: {},
        hypercubePath: '',
      });
      expect(newPropertyTree).toEqual({ qProperty: { prop4: 'value 4' } });
    });

    test('should use hypercube.importProperties when there is no target importProperties', async () => {
      newType = 'new type';
      const sourceQaeExportPropertiesMock = jest.fn().mockReturnValue({ qProperty: { prop3: 'value 3' } });
      sourceQae = { exportProperties: sourceQaeExportPropertiesMock };
      getQaeMock.mockReturnValue(sourceQae);

      const newPropertyTree = await convertTo({ halo, model, cellRef, newType });
      expect(getQaeMock).toHaveBeenCalledTimes(1);
      expect(getFullPropertyTreeMock).toHaveBeenCalledTimes(1);
      expect(haloGetTypesMock).toHaveBeenCalledTimes(1);
      expect(supernovaMock).toHaveBeenCalledTimes(1);
      expect(exportPropertiesMock).toHaveBeenCalledTimes(0);
      expect(sourceQaeExportPropertiesMock).toHaveBeenCalledTimes(1);
      expect(sourceQaeExportPropertiesMock).toHaveBeenCalledWith({ propertyTree, hypercubePath: '' });
      expect(importPropertiesMock).toHaveBeenCalledTimes(1);
      expect(importPropertiesMock).toHaveBeenCalledWith({
        exportFormat: { qProperty: { prop3: 'value 3' } },
        initialProperties: { qInfo: { qType: 'new type' }, visualization: 'new type' },
        dataDefinition: { propertyPath: '/qHyperCubeDef' },
        hypercubePath: '',
      });
      expect(newPropertyTree).toEqual({ qProperty: { prop2: 'value 2' } });
    });

    test('should do convert correctly when there are source exportProperties and target importProperties', async () => {
      newType = 'new type';
      const sourceQaeExportPropertiesMock = jest.fn().mockReturnValue({ qProperty: { prop3: 'value 3' } });
      sourceQae = { exportProperties: sourceQaeExportPropertiesMock };
      getQaeMock.mockReturnValue(sourceQae);

      const targetQaeImportPropertiesMock = jest.fn().mockReturnValue({ qProperty: { prop4: 'value 4' } });
      targetQae = {
        importProperties: targetQaeImportPropertiesMock,
        properties: {
          initial: {},
        },
      };
      supernovaMock.mockReturnValue({ qae: targetQae });

      const newPropertyTree = await convertTo({ halo, model, cellRef, newType });
      expect(getQaeMock).toHaveBeenCalledTimes(1);
      expect(getFullPropertyTreeMock).toHaveBeenCalledTimes(1);
      expect(haloGetTypesMock).toHaveBeenCalledTimes(1);
      expect(supernovaMock).toHaveBeenCalledTimes(1);
      expect(exportPropertiesMock).toHaveBeenCalledTimes(0);
      expect(sourceQaeExportPropertiesMock).toHaveBeenCalledTimes(1);
      expect(sourceQaeExportPropertiesMock).toHaveBeenCalledWith({ propertyTree, hypercubePath: '' });
      expect(importPropertiesMock).toHaveBeenCalledTimes(0);
      expect(targetQaeImportPropertiesMock).toHaveBeenCalledTimes(1);
      expect(targetQaeImportPropertiesMock).toHaveBeenCalledWith({
        exportFormat: { qProperty: { prop3: 'value 3' } },
        initialProperties: { qInfo: { qType: 'new type' }, visualization: 'new type' },
        dataDefinition: {},
        hypercubePath: '',
      });
      expect(newPropertyTree).toEqual({ qProperty: { prop4: 'value 4' } });
    });

    test('should call export table properties when convertToTable is true', async () => {
      newType = 'sn-table';
      const sourceQaeExportTableProperties = jest.fn().mockReturnValue({ qProperty: { prop3: 'sourceValue' } });
      sourceQae = { exportTableProperties: sourceQaeExportTableProperties };
      getQaeMock.mockReturnValue(sourceQae);

      const targetQaeImportPropertiesMock = jest.fn().mockReturnValue({ qProperty: { prop4: 'targetValue' } });
      targetQae = {
        importProperties: targetQaeImportPropertiesMock,
        properties: {
          initial: {},
        },
      };
      supernovaMock.mockReturnValue({ qae: targetQae });

      const newPropertyTree = await convertTo({ halo, model, cellRef, newType, convertToTable: true });
      expect(getQaeMock).toHaveBeenCalledTimes(1);
      expect(getFullPropertyTreeMock).toHaveBeenCalledTimes(1);
      expect(haloGetTypesMock).toHaveBeenCalledTimes(1);
      expect(supernovaMock).toHaveBeenCalledTimes(1);
      expect(exportPropertiesMock).toHaveBeenCalledTimes(0);
      expect(sourceQaeExportTableProperties).toHaveBeenCalledTimes(1);
      expect(newPropertyTree).toEqual({ qProperty: { prop4: 'targetValue' } });
    });
  });
});
