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
  checkboxes = false,
  selectDisabled,
  doc = document,
  isSingleSelect = false,
}) {
  const [instantPages, setInstantPages] = useState(pages);
  const [mouseDown, setMouseDown] = useState(false);
  const [selectingValues, setSelectingValues] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  const [preSelected, setPreSelected] = useState([]);

  const elemNumbersOrdered = getElemNumbersFromPages(pages);

  // Select values for real, by calling the backend.
  const select = async (elemNumbers = [], additive = false) => {
    if (selectDisabled()) {
      return;
    }
    setSelectingValues(true);
    const filtered = additive ? elemNumbers.filter((n) => !selected.includes(n)) : elemNumbers;
    await selectValues({ selections, elemNumbers: filtered, isSingleSelect });
    setSelectingValues(false);
  };

  // Show estimated selection states instantly before applying the selections for real.
  const preSelect = (elemNumbers, additive = false) => {
    if (selectDisabled()) {
      return;
    }
    setPreSelected((existing) => {
      const uniques = getUniques([...existing, ...elemNumbers]);
      const filtered = additive ? uniques.filter((n) => !selected.includes(n)) : uniques;
      const filled = additive ? fillRange(uniques, elemNumbersOrdered) : filtered;
      return filled;
    });
  };

  const selectManually = (elementIds = [], additive = false) => {
    setIsRangeSelection(false); // range is not supported for manual select
    setMouseDown(true);
    preSelect(elementIds, additive || isRangeSelection);
    const p = select(elementIds, additive || isRangeSelection);
    setMouseDown(false);
    return p;
  };

  const onClick = useCallback(
    (event) => {
      if (selectingValues || selectDisabled()) {
        return;
      }
      const elemNumber = +event.currentTarget.getAttribute('data-n');
      setPreSelected([elemNumber]);
    },
    [selectingValues, selectDisabled]
  );

  const onMouseDown = useCallback(
    (event) => {
      if (selectingValues || selectDisabled()) {
        return;
      }
      setIsRangeSelection(false);
      setMouseDown(true);

      const elemNumber = +event.currentTarget.getAttribute('data-n');
      setPreSelected([elemNumber]);
    },
    [selectingValues, selectDisabled]
  );

  const onMouseUp = useCallback(
    (event) => {
      const elemNumber = +event.currentTarget.getAttribute('data-n');
      if (
        isSingleSelect ||
        !rangeSelect ||
        !mouseDown ||
        selectingValues ||
        (preSelected.length === 1 && preSelected[0] === elemNumber) // prevent toggling again on mouseup
      ) {
        return;
      }
      preSelect([elemNumber]);
    },
    [mouseDown, selectingValues, preSelected, selected, isRangeSelection, selectDisabled]
  );

  const onMouseUpDoc = useCallback(() => {
    // Ensure we end interactions when mouseup happens outside the Listbox.
    setMouseDown(false);
    setSelectingValues(false);
    setIsRangeSelection(false);
  }, []);

  const onMouseEnter = useCallback(
    (event) => {
      if (isSingleSelect || !mouseDown || selectingValues || selectDisabled()) {
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
      selectDisabled,
      layout && layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne,
    ]
  );

  useEffect(() => {
    // Perform selections of pre-selected values. This can
    // happen only when interactions have finished (mouseup).
    const interactionIsFinished = !mouseDown;
    if (!preSelected || !preSelected.length || selectingValues || !interactionIsFinished || !layout) {
      return;
    }
    select(preSelected, isRangeSelection);
  }, [preSelected, mouseDown, selectDisabled()]);

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
    if (selectingValues || !pages || (!checkboxes && !mouseDown)) {
      return;
    }
    // Render pre-selections before they have been selected in Engine.
    const newPages = applySelectionsOnPages(pages, preSelected, isSingleSelect);
    setInstantPages(newPages);
  }, [preSelected]);

  const interactionEvents = {};

  if (checkboxes) {
    Object.assign(interactionEvents, { onClick });
  } else if (rangeSelect) {
    Object.assign(interactionEvents, { onMouseUp, onMouseDown, onMouseEnter });
  } else {
    Object.assign(interactionEvents, { onMouseUp, onMouseDown });
  }

  return {
    instantPages,
    interactionEvents,
    select: selectManually, // preselect and select without having to trigger an event
  };
}
