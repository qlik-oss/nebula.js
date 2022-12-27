const getCalculatedHeight = ({ pages = [], minimumBatchSize, count }) => {
  // If values have been filtered in the currently loaded page, we want to
  // prevent rendering empty rows by assigning the actual number of items to render
  // since count (qcy) does not reflect this in DQ mode currently.
  const hasFilteredValues = pages.some((page) => page.qArea.qHeight < minimumBatchSize);
  const h = Math.max(...pages.map((page) => page.qArea.qTop + page.qArea.qHeight));
  const out = hasFilteredValues ? h : count;
  return out;
};

export default function getListCount({ pages, minimumBatchSize, count, calculatePagesHeight = false }) {
  const listCount =
    pages?.length && calculatePagesHeight ? getCalculatedHeight({ pages, minimumBatchSize, count }) : count;
  return listCount || 0;
}
