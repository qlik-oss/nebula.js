import getMeasureText from '../measure-text';

describe('measure-text', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return a text string of same length', () => {
    const layout = {
      qListObject: {
        qDimensionInfo: {
          qApprMaxGlyphCount: 10,
        },
      },
    };
    const text = getMeasureText(layout);
    expect(text).toEqual('MMMMMMMMMM');
    expect(text).toHaveLength(10);
  });

  it('should return an empty string', () => {
    const layout = undefined;
    const text = getMeasureText(layout);
    expect(text).toEqual('');
    expect(text).toHaveLength(0);
  });
});
