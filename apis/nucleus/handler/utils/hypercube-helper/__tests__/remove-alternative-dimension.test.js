import removeAlternativeDimension from '../remove-alternative-dimension';

describe('removeAlternativeDimension', () => {
  let self;
  let index;

  beforeEach(() => {
    index = 1;
    self = {
      getAlternativeDimensions: jest.fn().mockReturnValue([{ qDef: { cId: 'altDim1' } }, { qDef: { cId: 'altDim2' } }]),
      dimensionDefinition: {
        remove: jest.fn().mockResolvedValue(),
      },
      properties: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should remove the alternative dimension at the specified index', async () => {
    await removeAlternativeDimension(self, index);

    expect(self.getAlternativeDimensions()).toEqual([{ qDef: { cId: 'altDim1' } }]);
    expect(self.dimensionDefinition.remove).toHaveBeenCalledWith(
      { qDef: { cId: 'altDim2' } },
      self.properties,
      self,
      index
    );
  });

  test('should return undefined if dimensionDefinition.remove is not a function', async () => {
    self.dimensionDefinition.remove = undefined;

    const result = await removeAlternativeDimension(self, index);

    expect(result).toBeUndefined();
  });

  test('should handle removing the dimension if the index is undefined', async () => {
    index = undefined;

    await removeAlternativeDimension(self, index);

    expect(self.dimensionDefinition.remove).toHaveBeenCalled();
  });
});
