import { useState } from 'react';

/* eslint-disable no-param-reassign */
export default function useItemsLoader({
  local,
  loaderRef,
  model,
  fetchStart,
  scrollTimeout,
  postProcessPages,
  listData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [pages, setPages] = useState([]);
  let [minimumBatchSize] = useState(0);

  const loadMoreItems = (startIndex, stopIndex) => {
    local.current.queue.push({
      start: startIndex,
      stop: stopIndex,
    });

    const isScrolling = loaderRef.current
      ? // eslint-disable-next-line no-underscore-dangle
        loaderRef.current._listRef && loaderRef.current._listRef.state.isScrolling
      : false;

    if (local.current.queue.length > 10) {
      local.current.queue.shift();
    }
    clearTimeout(local.current.timeout);
    setIsLoading(true);
    return new Promise((resolve) => {
      // eslint-disable-next-line no-param-reassign
      local.current.timeout = setTimeout(
        () => {
          const lastItemInQueue = local.current.queue.slice(-1)[0];
          const reqPromise = model
            .getListObjectData(
              '/qListObjectDef',
              // we need to ask for two payloads
              // 2nd one is our starting index + minimumBatchSize items
              // 1st one is 2nd ones starting index - minimumBatchSize items
              // we do this because we don't want to miss any items between fast scrolls
              [
                {
                  qTop: lastItemInQueue.start > minimumBatchSize ? lastItemInQueue.start - minimumBatchSize : 0,
                  qHeight: minimumBatchSize,
                  qLeft: 0,
                  qWidth: 1,
                },
                {
                  qTop: lastItemInQueue.start,
                  qHeight: minimumBatchSize,
                  qLeft: 0,
                  qWidth: 1,
                },
              ]
            )
            .then((p) => {
              const processedPages = postProcessPages ? postProcessPages(p) : p;
              local.current.validPages = true;
              listData.current.pages = processedPages;
              setPages(processedPages);
              setIsLoading(false);
              resolve();
            });
          fetchStart && fetchStart(reqPromise);
        },
        isScrolling ? scrollTimeout : 0
      );
    });
  };

  return {
    loadMoreItems: {
      with({ minimumBatchSize: m }) {
        if (m) {
          minimumBatchSize = m;
        }
        return loadMoreItems;
      },
    },
    pages,
    isLoading,
  };
}
