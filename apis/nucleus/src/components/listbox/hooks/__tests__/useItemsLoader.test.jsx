import React from 'react';
import useItemsLoader from '../useItemsLoader';

describe('useItemsLoader', () => {
  let args;
  let getListObjectData;
  let postProcessPages;
  let fetchStart;
  let useState;

  beforeEach(() => {
    useState = jest.fn().mockImplementation((initialValue) => [initialValue, jest.fn()]);
    jest.spyOn(React, 'useState').mockImplementation(useState);
    getListObjectData = jest.fn().mockResolvedValue(['page1', 'page2']);
    fetchStart = jest.fn();
    postProcessPages = (ps) => ps.map((p) => `${p}_I_was_here`);

    args = {
      local: {
        current: {
          queue: [],
          dataOffset: 0,
        },
      },
      loaderRef: { current: undefined },
      model: { getListObjectData },
      fetchStart,
      scrollTimeout: 200,
      postProcessPages,
      listData: { current: {} },
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should fetch and pre-process pages', async () => {
    const { loadMoreItems, pages, isLoading } = useItemsLoader(args);
    expect(typeof loadMoreItems).toEqual('object');
    expect(typeof loadMoreItems.with).toEqual('function');
    expect(pages).toEqual([]);
    expect(isLoading).toBe(false);
    const loadItems = loadMoreItems.with({ minimumBatchSize: 'someNumberGoesHere' });
    expect(typeof loadItems).toEqual('function');

    const startIndex = 0;
    const stopIndex = 100;
    const prom = loadItems(startIndex, stopIndex);
    expect(typeof prom.then).toEqual('function');
    const resp = await prom;
    expect(resp).toBeUndefined();
    expect(args.listData.current.pages).toEqual(['page1_I_was_here', 'page2_I_was_here']);
    expect(args.fetchStart).calledOnce;
    expect(typeof args.fetchStart.mock.calls[0][0].then).toEqual('function');

    const fetchArgs = args.model.getListObjectData.mock.calls[0];
    expect(fetchArgs[0]).toEqual('/qListObjectDef');
    expect(fetchArgs[1]).toEqual([
      {
        qTop: 0,
        qHeight: 'someNumberGoesHere',
        qLeft: 0,
        qWidth: 1,
      },
      {
        qTop: 0,
        qHeight: 'someNumberGoesHere',
        qLeft: 0,
        qWidth: 1,
      },
    ]);
  });

  it('should fetch but not pre-process pages when postProcessPages is undefined', async () => {
    delete args.postProcessPages;
    const { loadMoreItems } = useItemsLoader(args);
    const loadItems = loadMoreItems.with({ minimumBatchSize: 'someNumberGoesHere' });
    await loadItems();
    expect(args.listData.current.pages).toEqual(['page1', 'page2']);
  });
});
