import { useEffect, useCallback, useRef } from 'react';
import { selectValues, fillRange, getElemNumbersFromPages } from './listbox-selections';

const getKeyAsToggleSelected = (event) => !(event.metaKey || event.ctrlKey);

export default function useSelectionsInteractions({ selectionState, selections, checkboxes = false, doc = document }) {
  const currentSelect = useRef({
    startElemNumber: undefined,
    elemNumbers: [],
    isRange: false,
    toggle: false,
    active: false,
  });

  // eslint-disable-next-line arrow-body-style
  const doSelect = () => {
    selectionState.setSelectableValuesUpdating();
    return selectValues({
      selections,
      elemNumbers: currentSelect.current.elemNumbers,
      isSingleSelect: selectionState.isSingleSelect,
      toggle: currentSelect.current.toggle,
    });
  };

  const addToRange = (elemNumber) => {
    const { startElemNumber } = currentSelect.current;
    if (startElemNumber === elemNumber) {
      return;
    }
    const rangeEnds = [currentSelect.current.startElemNumber, elemNumber];
    const elemNumbersOrdered = getElemNumbersFromPages(selectionState.enginePages);
    const toMaybeAdd = fillRange(rangeEnds, elemNumbersOrdered);
    selectionState.updateItems(toMaybeAdd, true, currentSelect.current.elemNumbers);
  };

  const selectManually = (elementIds = [], additive = false) => {
    const elemNumbers = [];
    selectionState.updateItems(elementIds, additive, elemNumbers);
    selectionState.setSelectableValuesUpdating();

    return selectValues({
      selections,
      elemNumbers: additive ? elemNumbers : elementIds,
      isSingleSelect: selectionState.isSingleSelect,
      toggle: !selectionState.isSingleSelect,
    });
  };

  const handleSingleSelectKey = (event, target) => {
    if (event.ctrlKey || event.metaKey) {
      target.focus(); // will not be focused otherwise
      event.preventDefault();
    }
  };

  const onChange = useCallback((event) => {
    if (selectionState.selectDisabled()) {
      return;
    }
    const elemNumber = +event.target.getAttribute('data-n');
    const toggle = !selectionState.isSingleSelect && getKeyAsToggleSelected(event.nativeEvent);
    currentSelect.current.elemNumbers = [elemNumber];
    currentSelect.current.toggle = toggle;

    if (!toggle) {
      selectionState.clearItemStates(true);
    }
    selectionState.updateItem(elemNumber);

    currentSelect.current.active = false;
    doSelect();
  }, []);

  const onMouseDown = useCallback((event) => {
    if (event.button !== 0 || selectionState.selectDisabled()) {
      return;
    }
    const elemNumber = +event.currentTarget.getAttribute('data-n');
    const toggle = !selectionState.isSingleSelect && getKeyAsToggleSelected(event);
    currentSelect.current.isRange = false;
    currentSelect.current.startElemNumber = elemNumber;
    currentSelect.current.elemNumbers = [elemNumber];
    currentSelect.current.toggle = toggle;
    currentSelect.current.active = true;

    if (!toggle) {
      selectionState.clearItemStates(true);
    }
    selectionState.updateItem(elemNumber);

    if (selectionState.isSingleSelect) {
      currentSelect.current.active = false;
      doSelect();
    }

    handleSingleSelectKey(event, event.currentTarget);
  }, []);

  const onMouseUp = useCallback((event) => {
    if (event.button !== 0 || !currentSelect.current.active) {
      return;
    }
    currentSelect.current.active = false;
    if (currentSelect.current.isRange) {
      const elemNumber = +event.currentTarget.getAttribute('data-n');
      addToRange(elemNumber);
    }
    doSelect();
  }, []);

  const onMouseUpDoc = useCallback((event) => {
    // Ensure we end interactions when mouseup happens outside the Listbox.
    if (event.button !== 0 || !currentSelect.current.active) {
      return;
    }
    currentSelect.current.active = false;
    doSelect();
  }, []);

  const onMouseEnter = useCallback((event) => {
    if (!currentSelect.current.active) {
      return;
    }
    if (!currentSelect.current.isRange) {
      currentSelect.current.isRange = true;
      if (!selectionState.isSelected(currentSelect.current.startElemNumber)) {
        selectionState.updateItem(currentSelect.current.startElemNumber, true);
        currentSelect.current.elemNumbers = [];
      }
    }
    const elemNumber = +event.currentTarget.getAttribute('data-n');
    addToRange(elemNumber);
  }, []);

  useEffect(() => {
    doc.addEventListener('mouseup', onMouseUpDoc);
    return () => {
      doc.removeEventListener('mouseup', onMouseUpDoc);
    };
  }, [onMouseUpDoc]);

  useEffect(() => {
    const onDeactivated = () => {
      selectionState.clearItemStates(false);
    };
    const onCleared = () => {
      selectionState.clearItemStates(true);
      selectionState.triggerStateChanged();
    };

    selections.on('deactivated', onDeactivated);
    selections.on('cleared', onCleared);
    return () => {
      selections.removeListener('activated', onDeactivated);
      selections.removeListener('cleared', onCleared);
    };
  }, [selections]);

  const interactionEvents = {};

  if (checkboxes) {
    Object.assign(interactionEvents, { onChange });
  } else {
    Object.assign(interactionEvents, { onMouseUp, onMouseDown, onMouseEnter });
  }

  return {
    interactionEvents,
    select: selectManually, // preselect and select without having to trigger an event
  };
}
