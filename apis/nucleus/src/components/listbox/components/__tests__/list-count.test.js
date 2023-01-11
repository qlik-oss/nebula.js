import getListCount from '../list-count';

describe('list-count', () => {
  let args;
  let mockPages;

  beforeEach(() => {
    args = { pages: [], minimumBatchSize: 100, count: 200, calculatePagesHeight: false };
    mockPages = [
      {
        qArea: {
          qTop: 0,
          qHeight: 50,
        },
      },
      {
        qArea: {
          qTop: 50,
          qHeight: 50,
        },
      },
    ];
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should fall back to count', () => {
    const listCount = getListCount(args);
    expect(listCount).toEqual(200);
  });

  it('when result is undefined the output should always fall back to 0', () => {
    args.count = undefined;
    const listCount = getListCount(args);
    expect(listCount).toEqual(0);
  });

  it('should fall back to count also when sending in pages', () => {
    args.pages = mockPages;
    const listCount = getListCount(args);
    expect(listCount).toEqual(200);
  });

  it('should calculate count when sending in pages and calculatePagesHeight is true', () => {
    args.pages = mockPages;
    args.calculatePagesHeight = true;
    const listCount = getListCount(args);
    expect(listCount).toEqual(100);
  });
});
