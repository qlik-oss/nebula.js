import { useEffect, useState, useCallback } from 'react';
import {
  getUniques,
  selectValues,
  applySelectionsOnPages,
  fillRange,
  getSelectedValues,
  getElemNumbersFromPages,
  containEquals,
} from './listbox-selections';

export default function useSelectionsInteractions({
  layout,
  selections,
  pages = [],
  rangeSelect = true,
  doc = document,
}) {
  const [instantPages, setInstantPages] = useState(pages);
  const [mouseDown, setMouseDown] = useState(false);
  const [selectingValues, setSelectingValues] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  const [preSelected, setPreSelected] = useState([]);

  const elemNumbersOrdered = getElemNumbersFromPages(pages);

  const select = async (elemNumbers = []) => {
    setSelectingValues(true);
    const isSingleSelect = layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne;
    const toggle = !isSingleSelect; // && elemNumbers.length === 1;
    const filtered = elemNumbers.length === 1 ? elemNumbers : elemNumbers.filter((n) => !selected.includes(n));
    await selectValues({ selections, elemNumbers: filtered, toggle });
    setSelectingValues(false);
  };

  const addToPreSelections = (elemNumbers, additive) => {
    const alreadyAdded = additive && [...preSelected, ...selected].includes(elemNumbers[0]);
    if (alreadyAdded) {
      return;
    }
    setPreSelected((existing) => {
      const uniques = getUniques([...existing, ...elemNumbers]);
      const filtered = additive ? uniques.filter((n) => !selected.includes(n)) : uniques;
      const items = additive ? fillRange(uniques, elemNumbersOrdered) : filtered;
      return items;
    });
  };

  const onMouseDown = useCallback(
    (event) => {
      if (selectingValues) {
        return;
      }
      setIsRangeSelection(false);
      setMouseDown(true);

      const elemNumber = +event.currentTarget.getAttribute('data-n');
      setPreSelected([elemNumber]);
    },
    [selectingValues]
  );

  const onMouseUp = useCallback(
    (event) => {
      const elemNumbers = [+event.currentTarget.getAttribute('data-n')];
      if (!rangeSelect || !mouseDown || selectingValues || containEquals(elemNumbers, preSelected)) {
        return;
      }
      addToPreSelections(elemNumbers);
    },
    [mouseDown, selectingValues, preSelected, selected, isRangeSelection]
  );

  const onMouseUpDoc = useCallback(() => {
    setMouseDown(false);
    setSelectingValues(false);
    setPreSelected([]);
  }, []);

  const onMouseEnter = useCallback(
    (event) => {
      if (mouseDown && !selectingValues) {
        setIsRangeSelection(true);
        const elemNumber = +event.currentTarget.getAttribute('data-n');
        addToPreSelections([elemNumber], true);
      }
    },
    [mouseDown, selectingValues, isRangeSelection, preSelected, selected]
  );

  useEffect(() => {
    // Perform selections of pre-selected values only when
    // interactions have finished (mouseup).
    const interactionIsFinished = !mouseDown;
    if (!interactionIsFinished || !layout) {
      return;
    }
    select(preSelected);
  }, [preSelected, mouseDown]);

  useEffect(() => {
    doc.addEventListener('mouseup', onMouseUpDoc);
    return () => {
      doc.removeEventListener('mouseup', onMouseUpDoc);
    };
  }, []);

  useEffect(() => {
    if (selectingValues || mouseDown) {
      return;
    }
    // Keep track of (truely) selected fields so we can prevent toggling them on range select.
    const alreadySelected = getSelectedValues(pages);
    setSelected(alreadySelected);
  }, [pages]);

  useEffect(() => {
    if (selectingValues || !pages || !mouseDown) {
      return;
    }
    // Render pre-selections before they have been selected in Engine.
    const newPages = applySelectionsOnPages(pages, preSelected);
    setInstantPages(newPages);
  }, [preSelected]);

  return {
    instantPages,
    isSelecting: selectingValues, // TODO: Compare times rendering with and without this
    interactionEvents: {
      onMouseDown,
      onMouseUp,
      onMouseEnter,
    },
  };
}
