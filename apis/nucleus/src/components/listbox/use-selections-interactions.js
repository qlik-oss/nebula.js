import { useEffect, useState, useCallback } from 'react';
import { getUniques, selectValues, applySelectionsOnPages } from './listbox-selections';

export default function useSelectionInteractions({ layout, selections, pages = [] }) {
  // eslint-disable-next-line no-param-reassign
  const [mouseDown, setMouseDown] = useState(false);
  const [selectedElementNumbers, setSelectedElementNumbers] = useState([]);
  const [selectingValues, setSelectingValues] = useState(false);
  const [instantPages, setInstantPages] = useState(pages);

  const select = ({ elemNumbers }) => {
    setSelectingValues(true);
    const isSingleSelect = layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne;
    return selectValues({ selections, elemNumbers, isSingleSelect }).then(() => {
      setSelectingValues(false);
    });
  };

  const onMouseDown = useCallback(
    (event) => {
      if (selectingValues) {
        return;
      }
      const elemNumber = +event.currentTarget.getAttribute('data-n');
      setSelectedElementNumbers([elemNumber]);
      setMouseDown(true);
    },
    [selectingValues, layout]
  );

  const onMouseUpDoc = useCallback(() => {
    setMouseDown(false);
  }, []);

  useEffect(() => {
    if (!mouseDown) {
      return;
    }
    const elemNumbers = getUniques(selectedElementNumbers);
    if (elemNumbers.length) {
      select({ elemNumbers });
    }
  }, [selectedElementNumbers, mouseDown]);

  useEffect(() => {
    document.addEventListener('mouseup', onMouseUpDoc);
    return () => {
      document.removeEventListener('mouseup', onMouseUpDoc);
    };
  }, []);

  // Effect for instant UI update of selection states by modifying pages directly.
  useEffect(() => {
    if (selectingValues || !pages /*  || !selectedElementNumbers.length */) {
      return;
    }
    const newPages = applySelectionsOnPages(
      pages,
      selectedElementNumbers,
      mouseDown,
      selectedElementNumbers.length === 1
    );
    setInstantPages(newPages);
  }, [selectedElementNumbers]);

  return {
    instantPages,
    interactionEvents: {
      onMouseDown,
    },
  };
}
