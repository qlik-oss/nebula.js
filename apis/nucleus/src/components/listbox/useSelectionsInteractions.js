import { useEffect, useState, useCallback } from 'react';
import {
  getUniques,
  selectValues,
  applySelectionsOnPages,
  fillRange,
  getSelectedValues,
  getElemNumbersFromPages,
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

  const getIsSingleSelect = () => !!(layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne);

  // Select values for real, by calling the backend.
  const select = async (elemNumbers = [], additive = false) => {
    setSelectingValues(true);
    const isSingleSelect = getIsSingleSelect();
    const filtered = additive ? elemNumbers.filter((n) => !selected.includes(n)) : elemNumbers;
    await selectValues({ selections, elemNumbers: filtered, isSingleSelect });
    setSelectingValues(false);
  };

  // Show estimated selection states instantly before applying the selections for real.
  const preSelect = (elemNumbers, additive = false) => {
    setPreSelected((existing) => {
      const uniques = getUniques([...existing, ...elemNumbers]);
      const filtered = additive ? uniques.filter((n) => !selected.includes(n)) : uniques;
      const filled = additive ? fillRange(uniques, elemNumbersOrdered) : filtered;
      return filled;
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
      const elemNumber = +event.currentTarget.getAttribute('data-n');
      if (
        getIsSingleSelect() ||
        !rangeSelect ||
        !mouseDown ||
        selectingValues ||
        (preSelected.length === 1 && preSelected[0] === elemNumber) // prevent toggling again on mouseup
      ) {
        return;
      }
      preSelect([elemNumber]);
    },
    [mouseDown, selectingValues, preSelected, selected, isRangeSelection]
  );

  const onMouseUpDoc = useCallback(() => {
    // Ensure we end interactions when mouseup happens outside the Listbox.
    setMouseDown(false);
    setSelectingValues(false);
    setPreSelected([]);
  }, []);

  const onMouseEnter = useCallback(
    (event) => {
      if (getIsSingleSelect() || !mouseDown || selectingValues) {
        return;
      }
      setIsRangeSelection(true);
      const elemNumber = +event.currentTarget.getAttribute('data-n');
      preSelect([elemNumber], true);
    },
    [
      mouseDown,
      selectingValues,
      isRangeSelection,
      preSelected,
      selected,
      layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne,
    ]
  );

  useEffect(() => {
    // Perform selections of pre-selected values. This can
    // happen only when interactions have finished (mouseup).
    const interactionIsFinished = !mouseDown;
    if (selectingValues || !interactionIsFinished || !layout) {
      return;
    }
    select(preSelected, isRangeSelection);
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
