import KEYS from '../../../keys';

const getElementIndex = (event) => +event.currentTarget.getAttribute('data-n');

export function getFieldKeyboardNavigation({
  select,
  selectAll,
  onCtrlF,
  confirm,
  cancel,
  setScrollPosition,
  focusListItems,
}) {
  const getElement = (elm, next = false) => {
    const parentElm = elm?.parentElement[next ? 'nextElementSibling' : 'previousElementSibling'];
    return parentElm && parentElm.querySelector('.value');
  };

  let startedRange = false;
  const setStartedRange = (val) => {
    startedRange = val;
  };

  const handleKeyDown = (event) => {
    let elementToFocus;
    const { currentTarget, nativeEvent } = event;
    const { keyCode, shiftKey = false, ctrlKey = false, metaKey = false } = nativeEvent;
    switch (keyCode) {
      case KEYS.TAB:
        // Try to focus search field, otherwise confirm button.
        if (shiftKey) {
          const searchField = currentTarget.closest('.listbox-container')?.querySelector('.search input');
          if (searchField) {
            searchField.focus();
          } else {
            const confirmButton = document.querySelector(
              '#njs-action-toolbar-popover .actions-toolbar-default-actions .ActionsToolbar-item:last-child button'
            );
            confirmButton?.focus();
          }
        }
        break;
      case KEYS.SHIFT:
        // This is to ensure we include the first value when starting a range selection.
        setStartedRange(true);
        break;
      case KEYS.SPACE:
        select([+currentTarget.getAttribute('data-n')]);
        break;
      case KEYS.ARROW_DOWN:
      case KEYS.ARROW_RIGHT:
        elementToFocus = getElement(currentTarget, true);
        if (shiftKey && elementToFocus) {
          if (startedRange) {
            select([getElementIndex(event)], true);
            setStartedRange(false);
          }
          select([getElementIndex(event)], true);
        }
        break;
      case KEYS.ARROW_UP:
      case KEYS.ARROW_LEFT:
        elementToFocus = getElement(currentTarget, false);
        if (shiftKey && elementToFocus) {
          if (startedRange) {
            select([+currentTarget.getAttribute('data-n')], true);
            setStartedRange(false);
          }
          select([getElementIndex(event)], true);
        }
        break;
      case KEYS.ENTER:
        confirm();
        break;
      case KEYS.ESCAPE:
        cancel();
        return; // let it propagate to top-level
      case KEYS.HOME:
        focusListItems.setFirst(true);
        if (ctrlKey) {
          setScrollPosition?.('overflowStart');
          break;
        }
        setScrollPosition?.('start');
        break;
      case KEYS.END:
        focusListItems.setLast(true);
        if (ctrlKey) {
          setScrollPosition?.('overflowEnd');
          break;
        }
        setScrollPosition?.('end');
        break;
      case KEYS.A:
        if (ctrlKey || metaKey) {
          selectAll();
          break;
        }
        return;
      case KEYS.F:
        if (ctrlKey || metaKey) {
          onCtrlF();
          break;
        }
        return;
      default:
        return; // don't stop propagation since we want to outsource keydown to other handlers.
    }
    if (elementToFocus) {
      elementToFocus.focus();
    }
    event.preventDefault();
    event.stopPropagation();
  };
  return handleKeyDown;
}

export function getListboxInlineKeyboardNavigation({
  setKeyboardActive,
  hovering,
  setHovering,
  updateKeyScroll,
  containerRef,
  currentScrollIndex,
  app,
  appSelections,
  constraints,
}) {
  const focusInsideListbox = (element) => {
    const fieldElement = element.querySelector('.search input, .value.selector, .value, .ActionsToolbar-item button');
    setKeyboardActive(true);
    if (fieldElement) {
      fieldElement.focus();
    }
  };

  const changeFocus = (event) => {
    if (event.target?.classList.contains('listbox-container')) {
      // Focus currently on a listbox
      // Esc on a list box should move the focus to its parent, i.e. a filter pane if any
      setKeyboardActive(false);
    } else {
      // Focus currently on a row
      // Esc on a row should move the focus to its parent, i.e. a listbox
      // First unfocus the row
      event.target?.setAttribute('tabIndex', '-1');
      event.target?.blur();
      // Then focus the listbox
      event.currentTarget?.setAttribute('tabIndex', '0');
      event.currentTarget?.focus();
    }
  };

  const updateKeyScrollOnHover = (newState) => {
    if (hovering) {
      updateKeyScroll(newState);
    }
  };

  const handleKeyDown = (event) => {
    const { keyCode, ctrlKey = false, shiftKey = false } = event.nativeEvent;

    switch (keyCode) {
      // case KEYS.TAB: TODO: Focus confirm button using keyboard.focusSelection when we can access the useKeyboard hook.
      case KEYS.ENTER:
      case KEYS.SPACE:
        if (!event.target.classList.contains('listbox-container')) {
          return; // don't mess with keydown handlers within the listbox
        }
        focusInsideListbox(event.currentTarget);
        break;
      case KEYS.ESCAPE:
        changeFocus(event);
        break;
      case KEYS.ARROW_UP:
        updateKeyScrollOnHover({ up: 1 });
        break;
      case KEYS.ARROW_DOWN:
        updateKeyScrollOnHover({ down: 1 });
        break;
      case KEYS.ARROW_LEFT:
      case KEYS.ARROW_RIGHT:
        return; // let it propagate to top-level
      case KEYS.PAGE_UP:
        updateKeyScrollOnHover({ up: currentScrollIndex.stop - currentScrollIndex.start });
        break;
      case KEYS.PAGE_DOWN:
        updateKeyScrollOnHover({ down: currentScrollIndex.stop - currentScrollIndex.start });
        break;
      case KEYS.HOME:
        updateKeyScrollOnHover({ scrollPosition: ctrlKey && shiftKey ? 'overflowStart' : 'start' });
        break;
      case KEYS.END:
        updateKeyScrollOnHover({ scrollPosition: ctrlKey && shiftKey ? 'overflowEnd' : 'end' });
        break;
      default:
        return;
    }

    // Note: We should not stop propagation here as it will block the containing app
    // from handling keydown events.
    event.preventDefault();
  };

  const focusOnHoverDisabled = () => {
    const selectNotAllowed = constraints?.select || constraints?.active;
    const appInModal = app.isInModalSelection?.() ?? appSelections.isInModal();
    return selectNotAllowed || appInModal;
  };

  const handleOnMouseEnter = () => {
    if (!focusOnHoverDisabled()) {
      setHovering(true);
      containerRef?.current?.focus?.();
    }
  };

  const handleOnMouseLeave = () => {
    if (hovering) {
      setHovering(false);
      containerRef?.current?.blur?.();
    }
  };

  return { handleKeyDown, handleOnMouseEnter, handleOnMouseLeave };
}
