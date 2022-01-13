import { useEffect, useState, useCallback } from 'react';
import {
  getUniques,
  selectValues,
  applySelectionsOnPages,
  fillRange,
  getSelectedValues,
} from './listbox-selection-utils';

export default function useSelectionInteractions({ layout, selections, model, pages = [] }) {
  const [mouseDown, setMouseDown] = useState(false);
  const [selectedElementNumbers, setSelectedElementNumbers] = useState([]);
  const [selectingValues, setSelectingValues] = useState(false);
  const [instantPages, setInstantPages] = useState(pages);
  const [previouslySelected, setPreviouslySelected] = useState([]);

  const onMouseDown = useCallback(
    (event) => {
      if (selectingValues) {
        return;
      }
      const elemNumber = +event.currentTarget.getAttribute('data-n');
      setSelectedElementNumbers([elemNumber]);
      setMouseDown(true);
    },
    [model]
  );

  // Keeps track of existing selections so we can avoid toggling values on drag select.
  useEffect(() => {
    if (mouseDown) {
      return;
    }
    const alreadySelected = getSelectedValues(pages);
    setPreviouslySelected(alreadySelected);
  }, [pages, mouseDown]);

  const onMouseUp = useCallback((event) => {
    if (!mouseDown || selectingValues) {
      return;
    }
    const elemNumber = +event.currentTarget.getAttribute('data-n');

    const isClick = selectedElementNumbers.length === 1;

    setSelectingValues(true);

    const values = getUniques([...selectedElementNumbers.concat(elemNumber)]);
    const toBeSelected = isClick ? values : values.filter((n) => !previouslySelected.includes(n));

    selectValues({
      selections,
      isSingleSelect: layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne,
      elemNumbers: toBeSelected,
    }).then(() => {
      setSelectingValues(false);
    });
  });

  document.addEventListener(
    'mouseup',
    useCallback(() => {
      setMouseDown(false);
    }, [model])
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
      model,
      mouseDown,
      layout && !!layout.qListObject.qDimensionInfo.qLocked,
      layout && !!layout.qListObject.qDimensionInfo.qIsOneAndOnlyOne,
    ]
  );

  // Effect for instant UI update of selection states by modifying pages directly.
  useEffect(() => {
    const justCompletedMultiSelect = !mouseDown && selectedElementNumbers.length > 1;
    if (!pages || !selectedElementNumbers.length || justCompletedMultiSelect) {
      return;
    }
    if (mouseDown && selectedElementNumbers.length === 1) {
      return;
    }
    const newPages = applySelectionsOnPages(
      pages,
      selectedElementNumbers,
      mouseDown,
      selectedElementNumbers.length === 1
    );
    setInstantPages(newPages);
  }, [selectedElementNumbers, mouseDown]);

  return {
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    instantPages,
  };
}
