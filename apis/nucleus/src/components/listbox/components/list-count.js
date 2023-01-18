import useDataStore from '../hooks/useDataStore';

const getCalculatedHeight = ({ pages = [], minimumBatchSize, count }) => {
  // If values have been filtered in the currently loaded page, we want to
  // prevent rendering empty rows by assigning the actual number of items to render
  // since count (qcy) does not reflect this in DQ mode currently.
  const hasFilteredValues = pages.some((page) => page.qArea.qHeight < minimumBatchSize);
  const h = Math.max(...pages.map((page) => page.qArea.qTop + page.qArea.qHeight));
  const out = hasFilteredValues ? h : count;
  return out;
};

export default function getListCount({
  pages,
  minimumBatchSize,
  count,
  layoutOptions,
  calculatePagesHeight = false,
  model,
}) {
  const { getStoreValue } = useDataStore(model);
  let listCount =
    pages?.length && calculatePagesHeight ? getCalculatedHeight({ pages, minimumBatchSize, count }) : count;
  const maxRowCount = layoutOptions.dense ? 838000 : 577000; // Styling breaks on items above this number: https://github.com/bvaughn/react-window/issues/659
  const maxColumnCount = Math.floor(33550000 / getStoreValue('columnWidth'));
  const itemForDisclaimer = Number(layoutOptions.dataLayout === 'singleColumn');
  const maxListCount = maxRowCount * (getStoreValue('columnCount') || 1) + itemForDisclaimer;
  listCount = Math.min(listCount, maxListCount) || 0;

  return { listCount, maxCount: { row: maxRowCount, column: maxColumnCount } };
}
