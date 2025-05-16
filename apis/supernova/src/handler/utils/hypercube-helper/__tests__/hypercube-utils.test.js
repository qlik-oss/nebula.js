// eslint-disable-next-line import/no-relative-packages
import uid from '../../../../../../nucleus/src/object/uid';
import * as hcUtils from '../hypercube-utils';

jest.mock('../../../../../../nucleus/src/object/uid', () => jest.fn());

describe('replaceDimensionToColumnOrder', () => {
  let self;
  let dimension;
  let replacedDimension;
  let index;

  beforeEach(() => {
    index = 1;
    uid.mockReturnValue('dim3Id');

    self = {
      getDimensions: jest.fn().mockReturnValue([
        { id: 'dim1', qDef: { cId: 'dimId1' } },
        { id: 'dim2', qDef: { cId: 'dimId2' } },
      ]),
      dimensionDefinition: {
        replace: jest.fn(),
      },
      properties: {},
    };

    dimension = { id: 'dim3', qDef: { cId: 'dim3Id' } };
    replacedDimension = { id: 'dim2', qDef: { cId: 'dimId2' } };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should replace the dimension at the specified index', () => {
    const result = hcUtils.replaceDimensionOrder(self, index, dimension);

    expect(result).toEqual({
      id: 'dim3',
      qDef: { cId: 'dim3Id' },
    });
    expect(self.getDimensions()).toEqual([
      { id: 'dim1', qDef: { cId: 'dimId1' } },
      { id: 'dim3', qDef: { cId: 'dim3Id' } },
    ]);
  });

  test('should call dimensionDefinition.replace with the correct arguments', () => {
    hcUtils.replaceDimensionOrder(self, index, dimension);

    expect(self.dimensionDefinition.replace).toHaveBeenCalledWith(
      {
        id: 'dim3',
        qDef: { cId: 'dim3Id' },
      },
      replacedDimension,
      index,
      self.properties,
      self
    );
  });

  test('should not replace dimension when the dimensionDefinition.replace is undefined', () => {
    self.dimensionDefinition.replace = undefined;
    hcUtils.replaceDimensionOrder(self, index, dimension);

    expect(self.getDimensions()).toEqual([
      { id: 'dim1', qDef: { cId: 'dimId1' } },
      { id: 'dim3', qDef: { cId: 'dim3Id' } },
    ]);
  });
});
