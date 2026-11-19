/* eslint-disable no-underscore-dangle */
import { useEffect, useCallback, useRef } from 'react';
import { selectValues, fillRange, getElemNumbersFromPages } from './listbox-selections';
import rowColClasses from '../../components/ListBoxRowColumn/helpers/classes';

const dataItemSelector = `.${rowColClasses.fieldRoot}`;
// 'add' keeps today's behavior (plain click adds/toggles, modifier replaces); 'replace' inverts it.
const getToggle = (event, selectionMode) => {
  const modifierPressed = !!(event?.metaKey || event?.ctrlKey);
  return selectionMode === 'replace' ? modifierPressed : !modifierPressed;
};
// Replace mode: a plain click on the only selected value deselects it; with several selected it replaces.
const isReplaceDeselectClick = (event, selectionMode, isSelected, selectedCount) =>
  selectionMode === 'replace' && !getToggle(event, selectionMode) && isSelected && selectedCount === 1;

export default function useSelectionsInteractions({
  selectionState,
  selections,
  checkboxes = false,
  selectionMode = 'add',
  doc = document,
  loaderRef,
}) {
  const currentSelect = useRef({
    startElemNumber: undefined,
    elemNumbers: [],
    isRange: false,
    toggle: false,
    active: false,
    replaceSelectedCandidate: false,
    touchElemNumbers: [],
    touchRangeSmall: false,
  });

  useEffect(() => {
    if (!loaderRef.current?._listRef?._outerRef) {
      return undefined;
    }
    const preventGestureStart = (e) => e.preventDefault();
    const preventGestureChange = (e) => e.preventDefault();
    const preventGestureEnd = (e) => e.preventDefault();

    const listRef = loaderRef.current._listRef._outerRef;
    listRef.addEventListener('gesturestart', preventGestureStart);
    listRef.addEventListener('gesturechange', preventGestureChange);
    listRef.addEventListener('gestureend', preventGestureEnd);
    return () => {
      listRef.removeEventListener('gesturestart', preventGestureStart);
      listRef.removeEventListener('gesturechange', preventGestureChange);
      listRef.removeEventListener('gestureend', preventGestureEnd);
    };
  }, [loaderRef.current?._listRef?._outerRef]);

  const doSelect = async () => {
    if (selectionState.selectDisabled?.()) {
      return false;
    }
    selectionState.setSelectableValuesUpdating();
    return selectValues({
      selections,
      elemNumbers: currentSelect.current.elemNumbers,
      isSingleSelect: selectionState.isSingleSelect,
      toggle: currentSelect.current.toggle,
    });
  };

  const resolveReplaceCandidateAsDeselect = () => {
    currentSelect.current.replaceSelectedCandidate = false;
    currentSelect.current.toggle = true;
    selectionState.updateItem(currentSelect.current.startElemNumber);
  };

  const resolveReplaceCandidateAsRange = () => {
    currentSelect.current.replaceSelectedCandidate = false;
    selectionState.clearItemStates(true);
    selectionState.updateItem(currentSelect.current.startElemNumber);
  };

  const finishSelection = () => {
    if (currentSelect.current.replaceSelectedCandidate) {
      resolveReplaceCandidateAsDeselect();
    }
    return doSelect();
  };

  const getRange = (start, end) => {
    const elemNumbersOrdered = getElemNumbersFromPages(selectionState.enginePages);
    return fillRange([start, end], elemNumbersOrdered);
  };

  const addToRange = (elemNumber) => {
    const { startElemNumber } = currentSelect.current;
    if (startElemNumber === elemNumber) {
      return;
    }
    const toMaybeAdd = getRange(currentSelect.current.startElemNumber, elemNumber);
    selectionState.updateItems(toMaybeAdd, true, currentSelect.current.elemNumbers);
  };

  const selectManually = async (elementIds = [], additive = false, event = undefined) => {
    if (selectionState.selectDisabled?.()) {
      return false;
    }
    const replaceSelectedValue =
      !additive &&
      elementIds.length === 1 &&
      isReplaceDeselectClick(
        event?.nativeEvent,
        selectionMode,
        selectionState.isSelected(elementIds[0]),
        selectionState.selectedCount()
      );
    const toggle =
      !selectionState.isSingleSelect &&
      (additive || getToggle(event?.nativeEvent, selectionMode) || replaceSelectedValue);
    if (!toggle) {
      selectionState.clearItemStates(true);
    }

    const elemNumbers = [];
    selectionState.updateItems(elementIds, additive, elemNumbers);
    selectionState.setSelectableValuesUpdating();

    return selectValues({
      selections,
      elemNumbers: additive ? elemNumbers : elementIds,
      isSingleSelect: selectionState.isSingleSelect,
      toggle,
    });
  };

  const handleSingleSelectKey = (event, target) => {
    if (event.ctrlKey || event.metaKey) {
      target.focus(); // will not be focused otherwise
      event.preventDefault();
    }
  };

  const onChange = useCallback(
    (event) => {
      if (selectionState.selectDisabled()) {
        return;
      }
      const elemNumber = +event.target.getAttribute('data-n');
      const replaceSelectedValue = isReplaceDeselectClick(
        event.nativeEvent,
        selectionMode,
        selectionState.isSelected(elemNumber),
        selectionState.selectedCount()
      );
      const toggle =
        !selectionState.isSingleSelect && (getToggle(event.nativeEvent, selectionMode) || replaceSelectedValue);
      currentSelect.current.elemNumbers = [elemNumber];
      currentSelect.current.toggle = toggle;

      if (!toggle) {
        selectionState.clearItemStates(true);
      }
      selectionState.updateItem(elemNumber);

      currentSelect.current.active = false;
      doSelect();
    },
    [selectionMode]
  );

  const onMouseDown = useCallback(
    (event) => {
      if (event.button !== 0 || selectionState.selectDisabled()) {
        return;
      }
      const elemNumber = +event.currentTarget.getAttribute('data-n');
      const toggle = !selectionState.isSingleSelect && getToggle(event, selectionMode);
      currentSelect.current.isRange = false;
      currentSelect.current.startElemNumber = elemNumber;
      currentSelect.current.elemNumbers = [elemNumber];
      currentSelect.current.toggle = toggle;
      currentSelect.current.active = true;
      currentSelect.current.replaceSelectedCandidate =
        !selectionState.isSingleSelect &&
        isReplaceDeselectClick(
          event,
          selectionMode,
          selectionState.isSelected(elemNumber),
          selectionState.selectedCount()
        );

      if (!toggle && !currentSelect.current.replaceSelectedCandidate) {
        selectionState.clearItemStates(true);
      }
      if (!currentSelect.current.replaceSelectedCandidate) {
        selectionState.updateItem(elemNumber);
      }

      if (selectionState.isSingleSelect) {
        currentSelect.current.active = false;
        doSelect();
      }

      handleSingleSelectKey(event, event.currentTarget);
    },
    [selectionMode]
  );

  const onMouseUp = useCallback((event) => {
    if (event.button !== 0 || !currentSelect.current.active) {
      return;
    }
    currentSelect.current.active = false;
    if (currentSelect.current.isRange) {
      const elemNumber = +event.currentTarget.getAttribute('data-n');
      addToRange(elemNumber);
    }
    finishSelection();
  }, []);

  const onMouseUpDoc = useCallback((event) => {
    // Ensure we end interactions when mouseup happens outside the Listbox.
    if (event.button !== 0 || !currentSelect.current.active) {
      return;
    }
    currentSelect.current.active = false;
    finishSelection();
  }, []);

  const onMouseEnter = useCallback((event) => {
    if (!currentSelect.current.active) {
      return;
    }
    if (!currentSelect.current.isRange) {
      currentSelect.current.isRange = true;
      const { replaceSelectedCandidate, startElemNumber } = currentSelect.current;
      if (replaceSelectedCandidate) {
        resolveReplaceCandidateAsRange();
      }
      if (!selectionState.isSelected(startElemNumber)) {
        selectionState.updateItem(startElemNumber, true);
        if (!replaceSelectedCandidate) {
          currentSelect.current.elemNumbers = [];
        }
      }
    }
    const elemNumber = +event.currentTarget.getAttribute('data-n');
    addToRange(elemNumber);
  }, []);

  const onTouchStart = useCallback((event) => {
    // Handle range selection with two finger touch
    if (
      currentSelect.current.active ||
      currentSelect.current.isRange ||
      selectionState.isSingleSelect ||
      event.touches.length <= 1
    ) {
      return;
    }
    if (event.touches.length > 2) {
      doSelect();
      return;
    }
    const startTouchElemNumber = Number(event.touches[0].target?.closest(dataItemSelector)?.getAttribute('data-n'));
    const endTouchElemNumber = Number(event.touches[1].target?.closest(dataItemSelector)?.getAttribute('data-n'));

    if (Number.isNaN(startTouchElemNumber) || Number.isNaN(startTouchElemNumber)) {
      doSelect();
      return;
    }

    currentSelect.current.active = true;
    const range = getRange(startTouchElemNumber, endTouchElemNumber);
    if (range.length < 7) {
      currentSelect.current.touchRangeSmall = true;
    }

    currentSelect.current.elemNumbers = [];
    currentSelect.current.touchElemNumbers = [startTouchElemNumber, endTouchElemNumber];
  }, []);

  const onTouchEnd = useCallback(() => {
    if (currentSelect.current.touchElemNumbers.length !== 2) {
      return;
    }
    if (currentSelect.current.touchRangeSmall) {
      currentSelect.current.touchRangeSmall = false;
      currentSelect.current.touchElemNumbers = [];
      currentSelect.current.active = false;
      return;
    }

    const [startTouchElemNumber, endTouchElemNumber] = currentSelect.current.touchElemNumbers;
    currentSelect.current.startElemNumber = startTouchElemNumber;
    addToRange(endTouchElemNumber);
    currentSelect.current.touchElemNumbers = [];
    currentSelect.current.active = false;
    currentSelect.current.toggle = true;
    doSelect();
  }, []);

  useEffect(() => {
    doc.addEventListener('mouseup', onMouseUpDoc);
    return () => {
      doc.removeEventListener('mouseup', onMouseUpDoc);
    };
  }, [onMouseUpDoc]);

  useEffect(() => {
    const clearItemStates = () => {
      selectionState.clearItemStates(false);
    };
    const onCleared = () => {
      selectionState.clearItemStates(true);
      selectionState.triggerStateChanged();
    };

    selections.on('clearItemStates', clearItemStates);
    selections.on('deactivated', clearItemStates);
    selections.on('cleared', onCleared);
    return () => {
      selections.removeListener('clearItemStates', clearItemStates);
      selections.removeListener('deactivated', clearItemStates);
      selections.removeListener('cleared', onCleared);
    };
  }, [selections]);

  const interactionEvents = {};

  if (checkboxes) {
    Object.assign(interactionEvents, { onChange });
  } else {
    Object.assign(interactionEvents, { onMouseUp, onMouseDown, onMouseEnter, onTouchStart, onTouchEnd });
  }

  return {
    interactionEvents,
    select: selectManually, // preselect and select without having to trigger an event
  };
}
