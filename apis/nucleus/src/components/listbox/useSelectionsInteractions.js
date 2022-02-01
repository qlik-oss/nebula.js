import { useEffect, useState, useCallback } from 'react';
import { getUniques, selectValues, applySelectionsOnPages } from './listbox-selections';

export default function useSelectionsInteractions({ layout, selections, pages = [], doc = document }) {
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
    doc.addEventListener('mouseup', onMouseUpDoc);
    return () => {
      doc.removeEventListener('mouseup', onMouseUpDoc);
    };
  }, []);

  useEffect(() => {
    if (selectingValues || !pages) {
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
