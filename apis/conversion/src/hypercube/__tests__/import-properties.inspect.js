import importProperties from '../import-properties';
import * as Helpers from '../../helpers';

describe('importProperties', () => {
  let exportFormat;
  let initialProperties;
  let defaultPropertyValues;

  let createNewPropertiesMock;
  let getMaxMinDimensionMeasureMock;
  let getDefaultDimensionMock;
  let getDefaultMeasureMock;
  let shouldInitLayoutExcludeMock;
  let initLayoutExcludeMock;
  let setInterColumnSortOrderMock;
  let addDefaultDimensionsMock;
  let addDefaultMeasuresMock;
  let copyPropertyIfExistMock;
  let copyPropertyOrSetDefaultMock;
  let importCommonPropertiesMock;
  let updateDimensionsOnAddedMock;
  let updateMeasuresOnAddedMock;

  beforeEach(() => {
    createNewPropertiesMock = jest.fn().mockReturnValue({ qHyperCubeDef: { qDimensions: [], qMeasures: [] } });
    getMaxMinDimensionMeasureMock = jest
      .fn()
      .mockReturnValue({ maxDimensions: 1, minDimensions: 1, maxMeasures: 3, minMeasures: 1 });
    getDefaultDimensionMock = jest.fn().mockReturnValue({ prop1: 1 });
    getDefaultMeasureMock = jest.fn().mockReturnValue({ prop2: 2 });
    shouldInitLayoutExcludeMock = jest.fn().mockReturnValue(true);
    initLayoutExcludeMock = jest.fn();
    setInterColumnSortOrderMock = jest.fn();
    addDefaultDimensionsMock = jest.fn();
    addDefaultMeasuresMock = jest.fn();
    copyPropertyIfExistMock = jest.fn();
    copyPropertyOrSetDefaultMock = jest.fn();
    importCommonPropertiesMock = jest.fn();
    updateDimensionsOnAddedMock = jest.fn();
    updateMeasuresOnAddedMock = jest.fn();

    jest.spyOn(Helpers.default, 'createNewProperties').mockImplementation(createNewPropertiesMock);
    jest.spyOn(Helpers.default, 'getMaxMinDimensionMeasure').mockImplementation(getMaxMinDimensionMeasureMock);
    jest.spyOn(Helpers.default, 'getDefaultDimension').mockImplementation(getDefaultDimensionMock);
    jest.spyOn(Helpers.default, 'getDefaultMeasure').mockImplementation(getDefaultMeasureMock);
    jest.spyOn(Helpers.default, 'shouldInitLayoutExclude').mockImplementation(shouldInitLayoutExcludeMock);
    jest.spyOn(Helpers.default, 'initLayoutExclude').mockImplementation(initLayoutExcludeMock);
    jest.spyOn(Helpers.default, 'setInterColumnSortOrder').mockImplementation(setInterColumnSortOrderMock);
    jest.spyOn(Helpers.default, 'addDefaultDimensions').mockImplementation(addDefaultDimensionsMock);
    jest.spyOn(Helpers.default, 'addDefaultMeasures').mockImplementation(addDefaultMeasuresMock);
    jest.spyOn(Helpers.default, 'copyPropertyIfExist').mockImplementation(copyPropertyIfExistMock);
    jest.spyOn(Helpers.default, 'copyPropertyOrSetDefault').mockImplementation(copyPropertyOrSetDefaultMock);
    jest.spyOn(Helpers.default, 'importCommonProperties').mockImplementation(importCommonPropertiesMock);
    jest.spyOn(Helpers.default, 'updateDimensionsOnAdded').mockImplementation(updateDimensionsOnAddedMock);
    jest.spyOn(Helpers.default, 'updateMeasuresOnAdded').mockImplementation(updateMeasuresOnAddedMock);

    exportFormat = {
      data: [
        {
          dimensions: [],
          measures: [],
          excludedDimensions: [],
          excludedMeasures: [],
          interColumnSortOrder: [],
        },
      ],
      properties: {},
    };
    initialProperties = {};
    defaultPropertyValues = {};
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  test('should run helpers correctly if there is no defaultPropertyValues', () => {
    importProperties({ exportFormat, initialProperties, defaultPropertyValues });
    expect(createNewPropertiesMock).toHaveBeenCalledTimes(1);
    expect(getMaxMinDimensionMeasureMock).toHaveBeenCalledTimes(1);
    expect(getDefaultDimensionMock).toHaveBeenCalledTimes(1);
    expect(getDefaultMeasureMock).toHaveBeenCalledTimes(1);
    expect(shouldInitLayoutExcludeMock).toHaveBeenCalledTimes(1);
    expect(initLayoutExcludeMock).toHaveBeenCalledTimes(1);
    expect(addDefaultDimensionsMock).toHaveBeenCalledTimes(1);
    expect(addDefaultMeasuresMock).toHaveBeenCalledTimes(1);
    expect(setInterColumnSortOrderMock).toHaveBeenCalledTimes(1);
    expect(copyPropertyIfExistMock).toHaveBeenCalledTimes(2);
    expect(copyPropertyOrSetDefaultMock).toHaveBeenCalledTimes(6);
    expect(importCommonPropertiesMock).toHaveBeenCalledTimes(1);
    expect(updateDimensionsOnAddedMock).toHaveBeenCalledTimes(1);
    expect(updateMeasuresOnAddedMock).toHaveBeenCalledTimes(1);
  });

  test('should run helpers correctly if there is defaultPropertyValues', () => {
    defaultPropertyValues = { defaultDimension: {}, defaultMeasure: {} };
    importProperties({ exportFormat, initialProperties, defaultPropertyValues });
    expect(createNewPropertiesMock).toHaveBeenCalledTimes(1);
    expect(getMaxMinDimensionMeasureMock).toHaveBeenCalledTimes(1);
    expect(getDefaultDimensionMock).toHaveBeenCalledTimes(0);
    expect(getDefaultMeasureMock).toHaveBeenCalledTimes(0);
    expect(shouldInitLayoutExcludeMock).toHaveBeenCalledTimes(1);
    expect(initLayoutExcludeMock).toHaveBeenCalledTimes(1);
    expect(addDefaultDimensionsMock).toHaveBeenCalledTimes(1);
    expect(addDefaultMeasuresMock).toHaveBeenCalledTimes(1);
    expect(setInterColumnSortOrderMock).toHaveBeenCalledTimes(1);
    expect(copyPropertyIfExistMock).toHaveBeenCalledTimes(2);
    expect(copyPropertyOrSetDefaultMock).toHaveBeenCalledTimes(6);
    expect(importCommonPropertiesMock).toHaveBeenCalledTimes(1);
    expect(updateDimensionsOnAddedMock).toHaveBeenCalledTimes(1);
    expect(updateMeasuresOnAddedMock).toHaveBeenCalledTimes(1);
  });

  test('should run helpers correctly if layoutExlcude is disabled', () => {
    shouldInitLayoutExcludeMock.mockReturnValue(false);
    defaultPropertyValues = { defaultDimension: {}, defaultMeasure: {} };
    importProperties({ exportFormat, initialProperties, defaultPropertyValues });
    expect(createNewPropertiesMock).toHaveBeenCalledTimes(1);
    expect(getMaxMinDimensionMeasureMock).toHaveBeenCalledTimes(1);
    expect(getDefaultDimensionMock).toHaveBeenCalledTimes(0);
    expect(getDefaultMeasureMock).toHaveBeenCalledTimes(0);
    expect(shouldInitLayoutExcludeMock).toHaveBeenCalledTimes(1);
    expect(initLayoutExcludeMock).toHaveBeenCalledTimes(0);
    expect(addDefaultDimensionsMock).toHaveBeenCalledTimes(1);
    expect(addDefaultMeasuresMock).toHaveBeenCalledTimes(1);
    expect(setInterColumnSortOrderMock).toHaveBeenCalledTimes(1);
    expect(copyPropertyIfExistMock).toHaveBeenCalledTimes(2);
    expect(copyPropertyOrSetDefaultMock).toHaveBeenCalledTimes(6);
    expect(importCommonPropertiesMock).toHaveBeenCalledTimes(1);
    expect(updateDimensionsOnAddedMock).toHaveBeenCalledTimes(1);
    expect(updateMeasuresOnAddedMock).toHaveBeenCalledTimes(1);
  });
});
