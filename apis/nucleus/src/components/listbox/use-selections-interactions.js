import { useEffect, useState, useCallback } from 'react';
import { getUniques, selectValues, applySelectionsOnPages, fillRange, getSelectedValues } from './listbox-selections';

export default function useSelectionInteractions({ layout, selections, pages = [], rangeSelect = true }) {
  // eslint-disable-next-line no-param-reassign
  rangeSelect = false;
  const [mouseDown, setMouseDown] = useState(false);
  const [selectedElementNumbers, setSelectedElementNumbers] = useState([]);
  const [selectingValues, setSelectingValues] = useState(false);
  const [instantPages, setInstantPages] = useState(pages);
  const [previouslySelected, setPreviouslySelected] = useState([]);

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

  const onMouseUp = useCallback(
    (event) => {
      if (!mouseDown || selectingValues) {
        return;
      }
      let elemNumbers = [];
      if (rangeSelect) {
        const elemNumber = +event.currentTarget.getAttribute('data-n');
        const values = getUniques([...selectedElementNumbers.concat(elemNumber)]);
        // const isClick = values.length === 1;
        // if (isClick) {
        //   select({ elemNumbers: [elemNumber] });
        //   return;
        // }
        elemNumbers = values.filter((n) => !previouslySelected.includes(n));
        setSelectedElementNumbers(elemNumbers);
      }
      // if (elemNumbers.length) {
      //   select({ elemNumbers });
      // }
    },
    [
      mouseDown,
      selectingValues,
      selectedElementNumbers,
      previouslySelected,
      layout && !!layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne,
    ]
  );

  const onMouseEnter = useCallback(
    (event) => {
      if (mouseDown && !selectingValues) {
        const elemNumber = +event.currentTarget.getAttribute('data-n');
        setSelectedElementNumbers((existing) => {
          const items = getUniques(fillRange([...existing, elemNumber]));
          return items;
        });
      }
    },
    [
      mouseDown,
      selectingValues,
      layout && !!layout.qListObject.qDimensionInfo.qLocked,
      layout && !!layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne,
    ]
  );

  useEffect(() => {
    if (!mouseDown) {
      return;
    }
    const elemNumbers = getUniques(selectedElementNumbers);
    if (elemNumbers.length) {
      select({ elemNumbers });
    }
  }, [selectedElementNumbers, mouseDown]);

  // Keeps track of existing selections so we can avoid toggling values on drag select.
  useEffect(() => {
    if (mouseDown) {
      return;
    }
    const alreadySelected = getSelectedValues(pages);
    setPreviouslySelected(alreadySelected);
  }, [pages, mouseDown]);

  useEffect(() => {
    document.addEventListener('mouseup', onMouseUpDoc);
    return () => {
      document.removeEventListener('mouseup', onMouseUpDoc);
    };
  }, []);

  // Effect for instant UI update of selection states by modifying pages directly.
  useEffect(() => {
    const justCompletedMultiSelect = !mouseDown && selectedElementNumbers.length > 1;
    if (selectingValues || !pages || !selectedElementNumbers.length || justCompletedMultiSelect) {
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
      onMouseUp,
      onMouseEnter: rangeSelect ? onMouseEnter : undefined,
    },
  };
}
